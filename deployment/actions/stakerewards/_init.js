const initEnvironment = require(`eosiac`);

const { sendTransaction, env } = initEnvironment(
  process.env.EOSIAC_ENV || `ptest`,
  { verbose: true }
);

const accounts = Object.keys(env.accounts);

const ME_ACCOUNT = accounts[0];
const STAKEREWARDS_CONTRACT = accounts[1];
const STAKE_TOKEN = accounts[2];
const REWARD_TOKEN = accounts[3];

async function action() {
  try {
    await sendTransaction([
      {
        account: STAKEREWARDS_CONTRACT,
        name: `setrewards`,
        authorization: [
          {
            actor: STAKEREWARDS_CONTRACT,
            permission: `active`,
          },
        ],
        data: {
          stake_symbol: {
            sym: "8,BTCUSDC",
            contract: STAKE_TOKEN,
          },
          rewards_per_half_second: [
            {
              quantity: "0.1000 XPR",
              contract: REWARD_TOKEN,
            },
            {
              quantity: "0.0500 LOAN",
              contract: REWARD_TOKEN,
            },
          ],
        },
      },
      {
        account: STAKEREWARDS_CONTRACT,
        name: `setrewards`,
        authorization: [
          {
            actor: STAKEREWARDS_CONTRACT,
            permission: `active`,
          },
        ],
        data: {
          stake_symbol: {
            sym: "7,DOGEUSD",
            contract: STAKE_TOKEN,
          },
          rewards_per_half_second: [
            {
              quantity: "0.1000 XPR",
              contract: REWARD_TOKEN,
            },
            {
              quantity: "0.1000 LOAN",
              contract: REWARD_TOKEN,
            },
          ],
        },
      },
    ]);

    process.exit(0);
  } catch (error) {
    // ignore
    process.exit(1);
  }
}

action();
