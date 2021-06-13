import fs from 'fs'
import { AccountLoan } from '../parsers'
import { LOAN_AIRDROP_CHUNKS, LOAN_AIRDROP_DISTRIBUTE_JSON_PATH } from '../constants'
import { processAirdrop } from '../connect/eosjs'

export const executeLoanAirdrop = async () => {
    const airdrops: AccountLoan[] = require(LOAN_AIRDROP_DISTRIBUTE_JSON_PATH)

    const numOfChunks = Math.ceil(airdrops.length / LOAN_AIRDROP_CHUNKS)

    for (let i = 0; i < numOfChunks; i++) {
        console.count('Processed Airdrop')

        const airdropChunk = airdrops.slice(i * LOAN_AIRDROP_CHUNKS, (i + 1) * LOAN_AIRDROP_CHUNKS)

        await processAirdrop(airdropChunk)

        for (const airdrop of airdropChunk) {
            airdrop.loanDistributed = airdrop.totalLoan
        }

        fs.writeFileSync(LOAN_AIRDROP_DISTRIBUTE_JSON_PATH, JSON.stringify(airdrops, null, 4));
    }

    process.exit(0)
}