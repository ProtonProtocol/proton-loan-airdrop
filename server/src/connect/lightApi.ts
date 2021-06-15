import { Client } from 'jsonrpc2-ws'
import { BalanceRow } from '../parsers';
import { LIGHT_API_WS } from '../constants'

const client = new Client(LIGHT_API_WS);

client.on('connected', () => { console.log('connected'); });
client.on('error', (err: any) => { console.error(err); });

interface BalanceRaw {
    account: string;
    amount: string;
}

export async function get_token_holders(contract: string, currency: string): Promise<BalanceRow[]> {
    let balances: BalanceRaw[] = []

    return new Promise((resolve) => {
        client.methods.set("reqdata", (_: any, params: any) => {
            if (params.end) {
                const data = balances.map((balance: { account: string; amount: string }) => ({
                    account: balance.account,
                    amount: +balance.amount
                }))
                resolve(data)
            }

            balances.push(params.data)
        });

        try {
            client.call("get_token_holders", {
                reqid: 100,
                network: 'proton',
                contract: contract,
                currency: currency
            })
        } catch (err) {
            console.error(err)
            process.exit(0)
        }
    })
}