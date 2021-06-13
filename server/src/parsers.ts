import * as z from 'zod'

export const accountNameParser = z.string().regex(/^[.1-5a-z]{0,12}[.1-5a-j]?$/)

export enum AccountFields {
    account              = "account",
    xmtBalance           = "xmtBalance",
    xprBalance           = "xprBalance",
    refundingXpr         = "refundingXpr",
    shortStake           = "shortStake",
    xmtLpBalance         = "xmtLpBalance",
    xmtLp                = "xmtLp",
    xprLpBalance         = "xprLpBalance",
    xprLp                = "xprLp",
    farmerLpBalance      = "farmerLpBalance",
    farmerLp             = "farmerLp",
    longStake90Days      = "longStake90Days",
    longStake365Days     = "longStake365Days",
    xmtLoan              = "xmtLoan",
    xprLoan              = "xprLoan",
    refundingXprLoan     = "refundingXprLoan",
    shortStakeLoan       = "shortStakeLoan",
    xmtLpLoan            = "xmtLpLoan",
    xprLpLoan            = "xprLpLoan",
    farmerLpLoan         = "farmerLpLoan",
    longStake90DaysLoan  = "longStake90DaysLoan",
    longStake365DaysLoan = "longStake365DaysLoan",
    totalLoan            = "totalLoan",
    loanDistributed      = "loanDistributed",
}

export const accountParser = z.object({
    [AccountFields.account]         : accountNameParser,
    [AccountFields.xmtBalance]      : z.number().default(0),
    [AccountFields.xprBalance]      : z.number().default(0),
    [AccountFields.refundingXpr]    : z.number().default(0),
    [AccountFields.shortStake]      : z.number().default(0),
    [AccountFields.xmtLpBalance]    : z.number().default(0),
    [AccountFields.xmtLp]           : z.number().default(0),
    [AccountFields.xprLpBalance]    : z.number().default(0),
    [AccountFields.xprLp]           : z.number().default(0),
    [AccountFields.farmerLpBalance] : z.number().default(0),
    [AccountFields.farmerLp]        : z.number().default(0),
    [AccountFields.longStake90Days] : z.number().default(0),
    [AccountFields.longStake365Days]: z.number().default(0),
}).catchall(z.number());
export type Account = z.infer<typeof accountParser>

export const accountLoanParser = accountParser.extend({
    [AccountFields.xmtLoan]             : z.number().default(0),
    [AccountFields.xprLoan]             : z.number().default(0),
    [AccountFields.refundingXprLoan]    : z.number().default(0),
    [AccountFields.shortStakeLoan]      : z.number().default(0),
    [AccountFields.xmtLpLoan]           : z.number().default(0),
    [AccountFields.xprLpLoan]           : z.number().default(0),
    [AccountFields.farmerLpLoan]        : z.number().default(0),
    [AccountFields.longStake90DaysLoan] : z.number().default(0),
    [AccountFields.longStake365DaysLoan]: z.number().default(0),
    [AccountFields.totalLoan]           : z.number().default(0),
    [AccountFields.loanDistributed]     : z.number().default(0),
}).catchall(z.number());

export type AccountLoan = z.infer<typeof accountLoanParser>
export type Accounts = { [key: string]: Account | AccountLoan }

export interface BalanceRow {
    account: string;
    amount: number;
}

export interface YieldFarmRewardsRow {
    account: string;
    stakes: Array<{
        key: {
            sym: string;
            contract: string
        },
        value: {
            balance: string;
            accrued_rewards: number[],
            reward_indices: number[]
        }
    }>
}

export interface LongStakeRow {
    index: number;
    plan_index: number;
    account: string;
    start_time: string;
    staked: string;
    oracle_price: number;
}