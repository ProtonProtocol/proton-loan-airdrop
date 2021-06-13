import stringify from 'csv-stringify'
import fs from 'fs'
import { BLACKLIST, LOAN_AIRDROP_REVIEW_JSON_PATH, LOAN_AIRDROP_REVIEW_CSV_PATH, VESTING_INPUTS, VESTING_OUTPUT, LOAN_AIRDROP_DISTRIBUTE_JSON_PATH, LOAN_TOKEN_PRECISION } from '../constants'
import { AccountLoan, Accounts } from '../parsers'
import BN from 'bignumber.js'

const saveLoanAirdropJson = async (accountsArray: Array<AccountLoan>) => {
  const accountsArrayString = JSON.stringify(accountsArray, null, 4)
  
  fs.writeFileSync(LOAN_AIRDROP_REVIEW_JSON_PATH, accountsArrayString);

  if (!fs.existsSync(LOAN_AIRDROP_DISTRIBUTE_JSON_PATH)) {
    fs.writeFileSync(LOAN_AIRDROP_DISTRIBUTE_JSON_PATH, accountsArrayString)
  }
}

const saveLoanAirdropCsv = async (accountsArray: Array<AccountLoan>) => {
  return new Promise((resolve) => {
    stringify(accountsArray, { header: true }, function (_err, output) {
      fs.writeFileSync(LOAN_AIRDROP_REVIEW_CSV_PATH, output)
      resolve(undefined)
    })
  })
}

export const saveLoanAirdrop = async (accounts: Accounts) => {
  // Remove blacklist
  for (const blacklisted of BLACKLIST) {
    delete accounts[blacklisted]
  }

  // Reassign vest
  for (let i = 0; i < VESTING_INPUTS.length; i++) {
    const input = VESTING_INPUTS[i]
    const output = VESTING_OUTPUT

    if (i === 0) {
      accounts[output] = accounts[input]
    } else {
      for (const key in accounts[input]) {
        accounts[output][key] += accounts[input][key]
      }
    }

    accounts[output].account = output
    delete accounts[input]
  }

  // Write to CSV
  const data = Object
    .values(accounts)
    .map(account => {
      account.xmtLoan              = account.xmtBalance * 333
      account.xprLoan              = account.xprBalance * 1
      account.refundingXprLoan     = account.refundingXpr * 1
      account.shortStakeLoan       = account.shortStake * 2
      account.xmtLpLoan            = account.xmtLp * 666
      account.xprLpLoan            = account.xprLp * 2
      account.farmerLpLoan         = account.farmerLp * 2
      account.longStake90DaysLoan  = account.longStake90Days * 10
      account.longStake365DaysLoan = account.longStake365Days * 30
      account.totalLoan            = account.xmtLoan +
                                     account.xprLoan +
                                     account.refundingXprLoan +
                                     account.shortStakeLoan +
                                     account.xmtLpLoan + 
                                     account.xprLpLoan + 
                                     account.farmerLpLoan + 
                                     account.longStake90DaysLoan + 
                                     account.longStake365DaysLoan
      account.totalLoan            = +new BN(account.totalLoan).toFixed(LOAN_TOKEN_PRECISION)

      return account
    })

  const accountsArray = Object.values(data)

  await saveLoanAirdropJson(accountsArray as AccountLoan[])
  await saveLoanAirdropCsv(accountsArray as AccountLoan[])
}