import { get_lp_shares, get_yield_farmers, get_long_stakes } from "../connect/eosjs"
import { get_token_holders } from "../connect/lightApi"
import { AccountFields } from "../parsers"
import { get_short_stakers, get_refunding_xpr } from "../connect/sql"

export const processes = [
    {
      fields: [AccountFields.xmtBalance],
      fetch: async () => [await get_token_holders('xtokens', 'XMT')] 
    },
    {
      fields: [AccountFields.xprBalance],
      fetch: async () => [await get_token_holders('eosio.token', 'XPR')]
    },
    {
      fields: [AccountFields.shortStake],
      fetch: async () => [await get_short_stakers()]
    },
    {
      fields: [AccountFields.refundingXpr],
      fetch: async () => [await get_refunding_xpr()]
    },
    {
      fields: [AccountFields.xmtLpBalance, AccountFields.xmtLp],
      fetch: async () => {
        const { lpBalances, tokenBalances } = await get_lp_shares('proton.swaps', '8,XMTUSDC', 'XMT')
        return [lpBalances, tokenBalances]
      }
    },
    {
      fields: [AccountFields.xprLpBalance, AccountFields.xprLp],
      fetch: async () => {
        const { lpBalances, tokenBalances } = await get_lp_shares('proton.swaps', '8,XPRUSDC', 'XPR')
        return [lpBalances, tokenBalances]
      }
    },
    {
      fields: [AccountFields.farmerLpBalance, AccountFields.farmerLp],
      fetch: async () => {
        const { farmersLp, farmersToken } = await get_yield_farmers('proton.swaps', '8,XPRUSDC', 'XPR')
        return [farmersLp, farmersToken]
      }
    },
    {
      fields: [AccountFields.longStake90Days, AccountFields.longStake365Days],
      fetch: async () => {
        const { longStakes90Days, longStakes365Days } = await get_long_stakes()
        return [longStakes90Days, longStakes365Days]
      }
    },
  ]