import { expect, config } from "chai";
import { Asset, Name, ExtendedAsset, Serializer } from "@greymass/eosio";
import { Blockchain, protonAssert, protonAssertMessage, expectToThrow } from "@proton/vert"

/**
 * Initialize
 */
const blockchain = new Blockchain()
const tokenContract = blockchain.createContract('atom/eosio.token', 'atom/eosio.token', true);

const [trader, alice, bob, token] = blockchain.createAccounts('trader', 'alice', 'bob', "token")

beforeEach(async () => {
  blockchain.resetTables()
})

/* Helpers */
const getaccountsRows = () => tokenContract.tables.accounts().getTableRows()
/**
 * Tests
 */
 describe('eos-vm', () => {
  describe('token create, issue and transfer', () => {
    it('create tokens', async () => { 
      const asset1 = Asset.fromString("100000000.0000, LOAN");

      await tokenContract.actions.create(['token', asset1]).send();
    });
  })
});