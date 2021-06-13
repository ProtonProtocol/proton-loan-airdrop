const subdomain = window.location.host.split('.')[1] ? window.location.host.split('.')[0] : false
const subdomainChain = subdomain === 'testnet' ? 'proton-test' : 'proton'
export const CHAIN = process.env.VUE_APP_CHAIN || subdomainChain

export const ATOM_CONTRACT = 'loan.airdrop'
export const TOKEN_CONTRACT = 'loan.token'

export const requestAccount = 'loan.airdrop'
export const endpoints = CHAIN === 'proton'
  ? ['https://proton.greymass.com', 'https://proton.eoscafeblock.com', 'https://proton.eosusa.news', 'https://proton.cryptolions.io', 'https://proton.pink.gg']
  : ['https://testnet.protonchain.com']
export const appName = 'Proton Lend'
