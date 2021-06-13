import path from 'path'

export const CREATE_OUTPUTS = Boolean(process.env.CREATE_OUTPUTS || false)
export const CREATE_OUTPUTS_LOAN = Boolean(process.env.CREATE_OUTPUTS_LOAN || false)
export const EXECUTE_LOAN_AIRDROP = Boolean(process.env.EXECUTE_LOAN_AIRDROP || false)
export const CREATE_OUTPUTS_LOOP_TIMER = process.env.CREATE_OUTPUTS_LOOP_TIMER && +process.env.CREATE_OUTPUTS_LOOP_TIMER
export const PRIVATE_KEYS = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
export const MARIADB_CONFIG_1 = {
    host: process.env.MARIADB_HOST_1,
    port: +(process.env.MARIADB_PORT_1 as string),
    user: process.env.MARIADB_USER_1,
    password: process.env.MARIADB_PASSWORD_1,
    database: process.env.MARIADB_DATABASE_1
}
export const MARIADB_CONFIG_2 = {
    host: process.env.MARIADB_HOST_2,
    port: +(process.env.MARIADB_PORT_2 as string),
    user: process.env.MARIADB_USER_2,
    password: process.env.MARIADB_PASSWORD_2,
    database: process.env.MARIADB_DATABASE_2
}

console.log(MARIADB_CONFIG_1, MARIADB_CONFIG_2)

export const LIGHT_API_WS = 'wss://lightapi.eosamsterdam.net/wsapi'
export const ENDPOINT = 'https://proton.eoscafeblock.com'

export const LONGSTAKING_CONTRACT = 'longstaking'
export const LONGSTAKING_STAKES_TABLE = 'stakes'

export const FARMING_CONTRACT = 'yield.farms'
export const FARMING_REWARDS_TABLE = 'rewards'

export const SWAPS_CONTRACT = 'proton.swaps'
export const SWAPS_POOLS_TABLE = 'pools'

export const LOAN_TOKEN_SYMBOL = 'LOAN'
export const LOAN_TOKEN_PRECISION = 4
export const LOAN_TOKEN_CONTRACT = 'loan.token'
export const LOAN_TOKEN_CONTRACT_PERMISSION = 'active'
export const LOAN_AIRDROP_CONTRACT = 'loan.airdrop'
export const LOAN_AIRDROP_ACTION = 'airdrop'
export const LOAN_AIRDROP_CHUNKS = 30

export const LOAN_AIRDROP_REVIEW_JSON_PATH = path.resolve(__dirname, 'outputs', 'loan_airdrop_review.json')
export const LOAN_AIRDROP_DISTRIBUTE_JSON_PATH = path.resolve(__dirname, 'outputs', 'loan_airdrop_distribute.json')
export const LOAN_AIRDROP_REVIEW_CSV_PATH = path.resolve(__dirname, 'outputs', 'loan_airdrop_review.csv')

export const BLACKLIST = [
    'stake.proton',
    'swapscold',

    'thom1',
    'thefatcd',
    'thekorss',

    'alcor',
    'atomicassets',
    'atomicmarket',
    'blocktivity',
    'bot',
    'cfund.proton',
    'cron',
    'distributor',
    'eosio',
    'eosio.bpay',
    'eosio.ram',
    'eosio.ramfee',
    'eosio.saving',
    'eosio.vpay',
    'eosio.assert',
    'eosio.msig',
    'eosio.proton',
    'eosio.wrap',
    'interest.x',
    'longstaking',
    'mechanics',
    'newdex',
    'newdexwallet',
    'oracles',
    'proton.wrap',
    'protonnz',
    'protonvoting',
    'randreceiver',
    'resources',
    'rng',
    'rpslive',
    'simpleassets',
    'specialmint',
    'swaps',
    'tippedtipped',
    'token.proton',
    'yield.farms',
    'caseygrooms',
    'coinabis',
    'eosio.token',
    'proton.swaps',
    'sense',
    'spacedemon',
    'thomashp',
    'xsol',
    'xtokens',
]

export const VESTING_INPUTS = [
    'fred',
    'softatom',
    'softelectron'
]

export const VESTING_OUTPUT = 'vestingloan'
