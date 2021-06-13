import { JsonRpc, Api, JsSignatureProvider } from '@proton/js'
import { get_token_holders } from './lightApi'
import { ENDPOINT, LONGSTAKING_CONTRACT, LONGSTAKING_STAKES_TABLE, FARMING_CONTRACT, FARMING_REWARDS_TABLE, SWAPS_CONTRACT, SWAPS_POOLS_TABLE, LOAN_AIRDROP_ACTION, LOAN_AIRDROP_CONTRACT, LOAN_TOKEN_CONTRACT_PERMISSION, PRIVATE_KEYS, LOAN_TOKEN_SYMBOL, LOAN_TOKEN_PRECISION } from '../constants'
import { LongStakeRow, YieldFarmRewardsRow, BalanceRow, AccountLoan } from '../parsers'

export const rpc = new JsonRpc(ENDPOINT)
export const api = new Api({ rpc, signatureProvider: new JsSignatureProvider(PRIVATE_KEYS)})

export const processAirdrop = async (airdrops: AccountLoan[]) => {
  const airdropsToProcess = airdrops
    .filter(airdrop => airdrop.loanDistributed === 0)
    .map(airdrop => ({
      account: airdrop.account,
      amount: `${airdrop.totalLoan.toFixed(LOAN_TOKEN_PRECISION)} ${LOAN_TOKEN_SYMBOL}`, 
    }))

  if (!airdropsToProcess.length) {
    return
  }

  return api.transact({
    actions: [{
      account: LOAN_AIRDROP_CONTRACT,
      name: LOAN_AIRDROP_ACTION,
      data: {
        airdrops: airdropsToProcess
      },
      authorization: [{ actor: LOAN_AIRDROP_CONTRACT, permission: LOAN_TOKEN_CONTRACT_PERMISSION }]
    }]
  }, {
    useLastIrreversible: true,
    expireSeconds: 3000
  })
}

export async function _get_long_stakes (lower_bound: any = undefined): Promise<LongStakeRow[]> {
  const { rows, more, next_key } = await rpc.get_table_rows({
    code: LONGSTAKING_CONTRACT,
    scope: LONGSTAKING_CONTRACT,
    table: LONGSTAKING_STAKES_TABLE,
    limit: -1,
    lower_bound
  })
  
  if (more) {
    const restOfRows: LongStakeRow[] = await _get_long_stakes(next_key)
    return rows.concat(restOfRows)
  } else {
    return rows
  }
}

function parse_long_stakes (longStakes: LongStakeRow[], plan_index?: number) {
  return longStakes
    .filter((longStake: any) => plan_index === undefined || longStake.plan_index === plan_index)
    .map((longStake: any) => ({
      account: longStake.account,
      amount: +longStake.staked.split(' ')[0]
    }))
}

export async function get_long_stakes() {
  const longStakesRaw = await _get_long_stakes()

  return {
    longStakes: parse_long_stakes(longStakesRaw),
    longStakes90Days: parse_long_stakes(longStakesRaw, 0),
    longStakes365Days: parse_long_stakes(longStakesRaw, 1),
  }
}

export async function _get_yield_farmers (lower_bound: any = undefined): Promise<YieldFarmRewardsRow[]> {
  const { rows, more, next_key } = await rpc.get_table_rows({
    code: FARMING_CONTRACT,
    scope: FARMING_CONTRACT,
    table: FARMING_REWARDS_TABLE,
    limit: -1,
    lower_bound
  })

  if (more) {
    const restOfRows: YieldFarmRewardsRow[] = await _get_yield_farmers(next_key)
    return rows.concat(restOfRows)
  } else {
    return rows
  }
}

export async function get_yield_farmers (code: string, lt_symbol: string, token: string) {
  const yieldFarmersRaw = await _get_yield_farmers()
  const farmersLp: BalanceRow[] = yieldFarmersRaw.map((yieldFarmer) => ({
    account: yieldFarmer.account,
    amount: +yieldFarmer.stakes[0].value.balance / Math.pow(10, 8)
  }))

  const { lpSupply, tokensInPool } = await get_lp_supply(code, lt_symbol, token)
  const farmersToken: BalanceRow[] = farmersLp.map((farmerLp) => ({
    account: farmerLp.account,
    amount: (farmerLp.amount / lpSupply) * tokensInPool
  }))

  return {
    farmersLp,
    farmersToken
  }
}

export async function get_token_supply (code: string, symbol: string) {
  const stats = await rpc.get_currency_stats(code, symbol)
  let { supply } = stats[symbol]
  return +supply.split(' ')[0]
}

export async function get_lp_supply (code: string, lt_symbol: string, token: string) {
  const symbol_code = lt_symbol.split(',')[1]
  const lpSupply = await get_token_supply(code, symbol_code)
  const pool = await get_pool(lt_symbol)

  let tokensInPool = 0
  if (pool.pool1.quantity.split(' ')[1] === token) {
    tokensInPool = pool.pool1.quantity.split(' ')[0]
  } else if (pool.pool2.quantity.split(' ')[1] === token) {
    tokensInPool = pool.pool2.quantity.split(' ')[0]
  } else {
    throw new Error('Token not found in pool')
  }

  return {
    lpSupply,
    tokensInPool
  }
}

export async function get_lp_shares (code: string, lt_symbol: string, token: string) {
  const { lpSupply, tokensInPool } = await get_lp_supply(code, lt_symbol, token)
  const lpBalances = await get_token_holders(code, lt_symbol.split(',')[1])
  const tokenBalances = lpBalances.map(lpBalance => ({
    account: lpBalance.account,
    amount: (lpBalance.amount / lpSupply) * tokensInPool
  }))

  return {
    lpBalances,
    tokenBalances
  }
}

export async function get_pool (lt_symbol: string) {
  const { rows } = await rpc.get_table_rows({
    code: SWAPS_CONTRACT,
    scope: SWAPS_CONTRACT,
    table: SWAPS_POOLS_TABLE,
    limit: -1
  })
  const row = rows.find((row: any) => row.lt_symbol === lt_symbol)
  if (!row) {
    throw new Error('No pool found with that lt_symbol')
  }
  return row
}