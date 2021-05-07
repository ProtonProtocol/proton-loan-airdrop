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

// const USER_ACCOUNT = ME_ACCOUNT
const USER_ACCOUNT = accounts[4]

async function action() {
  try {
    await sendTransaction([
      {
        account: STAKE_TOKEN,
        name: `transfer`,
        authorization: [
          {
            actor: USER_ACCOUNT,
            permission: `active`,
          },
        ],
        data: {
          from: USER_ACCOUNT,
          to: STAKEREWARDS_CONTRACT,
          quantity: `1.0000000 DOGEUSD`,
          memo: ``,
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
