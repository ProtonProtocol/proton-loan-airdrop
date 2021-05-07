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

const MAX_SUPPLIES_STAKES = [
  `10000000000.00000000 BTCUSDC`,
  `10000000000.0000000 DOGEUSD`,
];
const MAX_SUPPLIES_REWARDS = [
  `10000000000.0000 XPR`,
  `10000000000.0000 LOAN`,
];

async function createIssueStakeTokens() {
  for (const maxSupply of MAX_SUPPLIES_STAKES) {
    await sendTransaction([
      {
        account: STAKE_TOKEN,
        name: `create`,
        authorization: [
          {
            actor: STAKE_TOKEN,
            permission: `active`,
          },
        ],
        data: {
          issuer: STAKE_TOKEN,
          maximum_supply: maxSupply,
        },
      },
      {
        account: STAKE_TOKEN,
        name: `issue`,
        authorization: [
          {
            actor: STAKE_TOKEN,
            permission: `active`,
          },
        ],
        data: {
          to: STAKE_TOKEN,
          quantity: maxSupply,
          memo: "",
        },
      },
      {
        account: STAKE_TOKEN,
        name: `transfer`,
        authorization: [
          {
            actor: STAKE_TOKEN,
            permission: `active`,
          },
        ],
        data: {
          from: STAKE_TOKEN,
          to: ME_ACCOUNT,
          quantity: maxSupply,
          memo: "",
        },
      },
    ]);
  }
}

async function createIssueRewardTokens() {
  for (const maxSupply of MAX_SUPPLIES_REWARDS) {
    await sendTransaction([
      {
        account: REWARD_TOKEN,
        name: `create`,
        authorization: [
          {
            actor: REWARD_TOKEN,
            permission: `active`,
          },
        ],
        data: {
          issuer: REWARD_TOKEN,
          maximum_supply: maxSupply,
        },
      },
      {
        account: REWARD_TOKEN,
        name: `issue`,
        authorization: [
          {
            actor: REWARD_TOKEN,
            permission: `active`,
          },
        ],
        data: {
          to: REWARD_TOKEN,
          quantity: maxSupply,
          memo: "",
        },
      },
      {
        account: REWARD_TOKEN,
        name: `transfer`,
        authorization: [
          {
            actor: REWARD_TOKEN,
            permission: `active`,
          },
        ],
        data: {
          from: REWARD_TOKEN,
          to: STAKEREWARDS_CONTRACT,
          quantity: maxSupply,
          memo: "deposit rewards",
        },
      },
    ]);
  }
}

async function action() {
  try {
    await createIssueStakeTokens();
    await createIssueRewardTokens();
    process.exit(0);
  } catch (error) {
    // ignore
    process.exit(1);
  }
}

action();
