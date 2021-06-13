const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
console.log(path.join(__dirname, '..', '.env'))

import { saveLoanAirdrop } from './actions/save'
import { Account, BalanceRow, AccountLoan, Accounts, accountParser, accountLoanParser } from './parsers'
import { processes } from './actions/processes'
import { executeLoanAirdrop } from './actions/distributor'
import { CREATE_OUTPUTS_LOAN, CREATE_OUTPUTS_LOOP_TIMER, CREATE_OUTPUTS, EXECUTE_LOAN_AIRDROP } from './constants'

const setAccounts = (accounts: Accounts, rows: BalanceRow[], field: string, modifiers?: { isLoan?: boolean }): { [key: string]: Account | AccountLoan } => {
  for (const row of rows) {
    if (!accounts[row.account]) {
      if (modifiers?.isLoan) {
        accounts[row.account] = accountLoanParser.parse({ account: row.account })
      } else {
        accounts[row.account] = accountParser.parse({ account: row.account })
      }
    }

    const oldAmount = accounts[row.account][field] ? +accounts[row.account][field] : 0
    accounts[row.account][field] = oldAmount + row.amount
  }

  return accounts
}

const createOutputs = async () => {
  console.log(new Date(), 'Creating Loan Airdrop Outputs!')

  let accounts: Accounts = {}

  for (const { fields, fetch } of processes) {
    const dataArray = await fetch()

    for (let i = 0; i < fields.length; i++) {
      accounts = setAccounts(accounts, dataArray[i], fields[i], {
        isLoan: CREATE_OUTPUTS_LOAN
      })
    }
  }

  if (CREATE_OUTPUTS_LOAN) {
    await saveLoanAirdrop(accounts)
  }

  console.log(new Date(), 'Finished creating Loan Airdrop Outputs!')
  
  // Loop
  if (CREATE_OUTPUTS_LOOP_TIMER) {
    setTimeout(() => createOutputs(), CREATE_OUTPUTS_LOOP_TIMER)
  } else {
    process.exit(0)
  }
}

if (CREATE_OUTPUTS) {
  createOutputs()
}

if (EXECUTE_LOAN_AIRDROP) {
  executeLoanAirdrop()
}
