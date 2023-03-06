import { expect, config } from "chai";
import { Asset, Name, ExtendedAsset, Serializer } from "@greymass/eosio";
import { Blockchain, protonAssert, protonAssertMessage, expectToThrow } from "@proton/vert"

/**
 * Initialize
 */
const blockchain = new Blockchain()
const tokenContract = blockchain.createContract('eosio.token', 'eosio.token', true);
const blocklistContract = blockchain.createContract('blocklist', 'assembly/blocklist', true)

const [trader, alice, bob] = blockchain.createAccounts('trader', 'alice', 'bob')

beforeEach(async () => {
  blockchain.resetTables()
  await blocklistContract.actions.adduser(['trader']).send();
})

/**
 * Tests
 */
 describe('eos-vm', () => {
  describe('token create, issue and transfer', () => {
    it('create tokens', async () => { 
      const asset = Asset.fromString("0.0000, LOAN");
      const asset1 = Asset.fromString("100000000.0000, LOAN");
      const asset2 = Asset.fromString("50000000.0000, LOAN");
      const asset3 = Asset.fromString("200000.0000, LOAN");

      await tokenContract.actions.create(['trader', asset]).send();

      await tokenContract.actions.issue(['trader', asset1, "issue the tokens"]).send('trader@active');
      await expectToThrow(
        tokenContract.actions.transfer(['trader', 'alice', asset2, "transfer the tokens"]).send('trader@active'),
        protonAssert('Sender is blocklisted, transfer cannot be performed')
      )

      await blocklistContract.actions.removeuser(['trader']).send();
      await tokenContract.actions.transfer(['trader', 'alice', asset2, "transfer the tokens"]).send('trader@active');

      await blocklistContract.actions.adduser(['trader']).send();
      await expectToThrow(
        tokenContract.actions.transfer(['trader', 'bob', asset2, "transfer the tokens"]).send('trader@active'),
        protonAssert('Sender is blocklisted, transfer cannot be performed')
      )
    });
  })
});