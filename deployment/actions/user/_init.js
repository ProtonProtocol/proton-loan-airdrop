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
const USER1_ACCOUNT = ME_ACCOUNT
const USER2_ACCOUNT = accounts[4];

async function action() {
  try {
    await sendTransaction([
      {
        account: STAKEREWARDS_CONTRACT,
        name: `open`,
        authorization: [
          {
            actor: USER1_ACCOUNT,
            permission: `active`,
          },
        ],
        data: {
          payer: USER1_ACCOUNT,
          user: USER1_ACCOUNT,
          stakes: [`BTCUSDC`, `DOGEUSD`],
        },
      },
      {
        account: STAKEREWARDS_CONTRACT,
        name: `open`,
        authorization: [
          {
            actor: USER2_ACCOUNT,
            permission: `active`,
          },
        ],
        data: {
          payer: USER2_ACCOUNT,
          user: USER2_ACCOUNT,
          stakes: [`BTCUSDC`, `DOGEUSD`],
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
