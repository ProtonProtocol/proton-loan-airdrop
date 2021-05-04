// @ts-check
const { loadConfig, Blockchain } = require("@klevoya/hydra");
const { safeParseInt } = require("./helpers");

const config = loadConfig("hydra.yml");

describe("rewards", () => {
  let blockchain = new Blockchain(config);
  let rewards = blockchain.createAccount(`rewards`);
  let token = blockchain.createAccount(`token`);
  let lpToken = blockchain.createAccount(`proton.swaps`);
  let user1 = blockchain.createAccount(`user1`);
  let user2 = blockchain.createAccount(`user2`);
  const start = new Date(`2001-01-01T00:00:00.000Z`); // avoid leap year

  const resetRewards = async () => {
    blockchain.setCurrentTime(start);

    // reset all token balances because of share / underlying exchange rate
    token.resetTables();
    await token.contract.create({
      issuer: token.accountName,
      maximum_supply: "10000000000.0000 REWARDS",
    });
    await token.contract.issue({
      to: token.accountName,
      quantity: "10000000000.0000 REWARDS",
      memo: "",
    });
    await token.contract.transfer({
      from: token.accountName,
      to: rewards.accountName,
      quantity: `10000000000.0000 REWARDS`,
      memo: `deposit rewards`,
    });
    await token.contract.create({
      issuer: token.accountName,
      maximum_supply: "10000000000.0000 LOAN",
    });
    await token.contract.issue({
      to: token.accountName,
      quantity: "10000000000.0000 LOAN",
      memo: "",
    });
    await token.contract.transfer({
      from: token.accountName,
      to: rewards.accountName,
      quantity: `10000000000.0000 LOAN`,
      memo: `deposit rewards`,
    });

    lpToken.resetTables();
    await lpToken.contract.create({
      issuer: lpToken.accountName,
      maximum_supply: "10000000000.00000000 BTCUSDC",
    });
    await lpToken.contract.issue({
      to: lpToken.accountName,
      quantity: "10000000000.00000000 BTCUSDC",
      memo: "",
    });
    await lpToken.contract.transfer({
      from: lpToken.accountName,
      to: user1.accountName,
      quantity: `1000.00000000 BTCUSDC`,
      memo: ``,
    });
    await lpToken.contract.transfer({
      from: lpToken.accountName,
      to: user2.accountName,
      quantity: `1000.00000000 BTCUSDC`,
      memo: ``,
    });
    await lpToken.contract.create({
      issuer: lpToken.accountName,
      maximum_supply: "10000000000.0000000 DOGEUSD",
    });
    await lpToken.contract.issue({
      to: lpToken.accountName,
      quantity: "10000000000.0000000 DOGEUSD",
      memo: "",
    });
    await lpToken.contract.transfer({
      from: lpToken.accountName,
      to: user1.accountName,
      quantity: `1000.0000000 DOGEUSD`,
      memo: ``,
    });
    await lpToken.contract.transfer({
      from: lpToken.accountName,
      to: user2.accountName,
      quantity: `1000.0000000 DOGEUSD`,
      memo: ``,
    });

    // reset rewards
    rewards.resetTables(`rewards`, `rewards.cfg`);
    await rewards.contract.setrewards({
      stake_symbol: {
        sym: `8,BTCUSDC`,
        contract: lpToken.accountName,
      },
      rewards_per_half_second: [
        {
          quantity: `0.1000 REWARDS`,
          contract: token.accountName,
        },
      ],
    });
    await rewards.contract.setrewards({
      stake_symbol: {
        sym: `7,DOGEUSD`,
        contract: lpToken.accountName,
      },
      rewards_per_half_second: [
        {
          quantity: `0.0500 REWARDS`,
          contract: token.accountName,
        },
      ],
    });
    await rewards.contract.open(
      {
        payer: rewards.accountName,
        user: user1.accountName,
        stakes: [`BTCUSDC`, `DOGEUSD`],
      },
      [{ actor: rewards.accountName, permission: `active` }]
    );
    await rewards.contract.open(
      {
        payer: rewards.accountName,
        user: user2.accountName,
        stakes: [`BTCUSDC`, `DOGEUSD`],
      },
      [{ actor: rewards.accountName, permission: `active` }]
    );
  };

  beforeAll(async () => {
    rewards.setContract(blockchain.contractTemplates[`rewards`]);
    token.setContract(blockchain.contractTemplates[`token`]);
    lpToken.setContract(blockchain.contractTemplates[`token`]);

    [rewards, token, lpToken].forEach((acc) =>
      acc.updateAuth(`active`, `owner`, {
        accounts: [
          {
            permission: {
              actor: acc.accountName,
              permission: `eosio.code`,
            },
            weight: 1,
          },
        ],
      })
    );
  });

  test("cannot withdraw more LP tokens than deposited", async () => {
    await resetRewards();
    // end is in 1 year
    const end = new Date(`2002-01-01T00:00:00.000Z`);

    await lpToken.contract.transfer(
      {
        from: user1.accountName,
        to: rewards.accountName,
        quantity: `1.00000000 BTCUSDC`,
        memo: ``,
      },
      [{ actor: user1.accountName, permission: `active` }]
    );
    await lpToken.contract.transfer(
      {
        from: user1.accountName,
        to: rewards.accountName,
        quantity: `1.0000000 DOGEUSD`,
        memo: ``,
      },
      [{ actor: user1.accountName, permission: `active` }]
    );

    // advance time to end
    blockchain.setCurrentTime(end);

    await rewards.contract.withdraw(
      {
        withdrawer: user1.accountName,
        token: {
          contract: lpToken.accountName,
          quantity: "1.00000000 BTCUSDC",
        },
      },
      [{ actor: user1.accountName, permission: `active` }]
    );

    const [user1Rewards] = rewards.getTableRowsScoped(`rewards`)[
      rewards.accountName
    ];

    // withdraw should have paid rewards
    const claimedBalances = token.getTableRowsScoped(`accounts`)[
      user1.accountName
    ];
    expect(claimedBalances[0]).toMatchObject({
      balance: `6307200.0000 REWARDS`,
    });
    // and transferred out LP tokens again
    const balances = lpToken.getTableRowsScoped(`accounts`)[user1.accountName];
    expect(balances[0].balance).toEqual(`1000.00000000 BTCUSDC`);
  });

  test("pays out single staker rewards correctly, cannot claim twice", async () => {
    await resetRewards();
    // end is in 1 year
    const end = new Date(`2002-01-01T00:00:00.000Z`);

    await lpToken.contract.transfer(
      {
        from: user1.accountName,
        to: rewards.accountName,
        quantity: `1.00000000 BTCUSDC`,
        memo: ``,
      },
      [{ actor: user1.accountName, permission: `active` }]
    );

    // advance time to end
    blockchain.setCurrentTime(end);

    await rewards.contract[`update.user`](
      {
        user: user1.accountName,
      },
      [{ actor: user1.accountName, permission: `active` }]
    );

    const [user1Rewards] = rewards.getTableRowsScoped(`rewards`)[
      rewards.accountName
    ];
    const blocksDelta = Math.floor((end.getTime() - start.getTime()) / 500);
    const rewardsPerBlock = 1000;
    const totalAmount = rewardsPerBlock * blocksDelta;
    const expectedUser1Rewards = totalAmount;

    // allow little bit of rounding errors
    expect(
      Math.abs(
        safeParseInt(user1Rewards.stakes[0].value.accrued_rewards[0]) -
          expectedUser1Rewards
      )
    ).toBeLessThan(2);
    expect(user1Rewards.stakes[0].value).toMatchObject({
      balance: "100000000",
      reward_indices: [630.72],
    });

    const rewardsCfg = rewards.getTableRowsScoped(`rewards.cfg`)[
      rewards.accountName
    ];
    expect(rewardsCfg[0]).toMatchObject({
      reward_indices: [630.72],
      reward_time: "2002-01-01T00:00:00.000",
      rewards_per_half_second: [
        {
          contract: "token",
          quantity: "0.1000 REWARDS",
        },
      ],
      total_staked: {
        contract: lpToken.accountName,
        quantity: "1.00000000 BTCUSDC",
      },
    });

    await rewards.contract.claim(
      {
        claimer: user1.accountName,
        stakes: [`BTCUSDC`],
      },
      [{ actor: user1.accountName, permission: `active` }]
    );

    await expect(
      rewards.contract.claim(
        {
          claimer: user1.accountName,
          stakes: [`BTCUSDC`],
        },
        [{ actor: user1.accountName, permission: `active` }]
      )
    ).rejects.toHaveProperty(
      "message",
      expect.stringMatching(/nothing to claim/gi)
    );
    const claimedBalances = token.getTableRowsScoped(`accounts`)[
      user1.accountName
    ];
    expect(claimedBalances[0]).toMatchObject({
      balance: `6307200.0000 REWARDS`,
    });
  });

  test("pays out multiple staker rewards correctly", async () => {
    await resetRewards();
    await rewards.contract.setrewards({
      stake_symbol: {
        sym: `8,BTCUSDC`,
        contract: lpToken.accountName,
      },
      rewards_per_half_second: [
        {
          quantity: `0.1000 REWARDS`,
          contract: token.accountName,
        },
        {
          quantity: `0.0500 LOAN`,
          contract: token.accountName,
        },
      ],
    });
    // need to enter market again because rewards was changed
    await rewards.contract.open(
      {
        payer: rewards.accountName,
        user: user1.accountName,
        stakes: [`BTCUSDC`],
      },
      [{ actor: rewards.accountName, permission: `active` }]
    );

    // end is in 1 year
    const end = new Date(`2002-01-01T00:00:00.000Z`);

    await lpToken.contract.transfer(
      {
        from: user1.accountName,
        to: rewards.accountName,
        quantity: `1.00000000 BTCUSDC`,
        memo: ``,
      },
      [{ actor: user1.accountName, permission: `active` }]
    );

    // advance time to end
    blockchain.setCurrentTime(end);

    await rewards.contract[`update.user`](
      {
        user: user1.accountName,
      },
      [{ actor: user1.accountName, permission: `active` }]
    );

    const [user1Rewards] = rewards.getTableRowsScoped(`rewards`)[
      rewards.accountName
    ];
    const blocksDelta = Math.floor((end.getTime() - start.getTime()) / 500);
    const rewardsPerBlock = 1000;
    const totalAmount = rewardsPerBlock * blocksDelta;
    const expectedUser1Rewards = totalAmount;
    const expectedUser1Loan = totalAmount / 2;

    // allow little bit of rounding errors
    const btcStake = user1Rewards.stakes[0];
    expect(
      Math.abs(
        safeParseInt(btcStake.value.accrued_rewards[0]) - expectedUser1Rewards
      )
    ).toBeLessThan(2);
    expect(user1Rewards.stakes[0].value).toMatchObject({
      balance: "100000000",
      reward_indices: [630.72, 315.36],
    });
    expect(
      Math.abs(
        safeParseInt(btcStake.value.accrued_rewards[1]) - expectedUser1Loan
      )
    ).toBeLessThan(2);

    await rewards.contract.claim(
      {
        claimer: user1.accountName,
        stakes: [`BTCUSDC`],
      },
      [{ actor: user1.accountName, permission: `active` }]
    );
    const claimedBalances = token.getTableRowsScoped(`accounts`)[
      user1.accountName
    ];
    expect(claimedBalances).toEqual([
      {
        balance: `3153600.0000 LOAN`,
      },
      {
        balance: `6307200.0000 REWARDS`,
      },
    ]);
  });

  test("pays out correctly according to time and balances deposited", async () => {
    await resetRewards();

    // end is in 1 year
    const end = new Date(`2002-01-01T00:00:00.000Z`);

    await lpToken.contract.transfer(
      {
        from: user1.accountName,
        to: rewards.accountName,
        quantity: `1.00000000 BTCUSDC`,
        memo: ``,
      },
      [{ actor: user1.accountName, permission: `active` }]
    );

    // advance time by 1/10
    let now = new Date(
      start.getTime() + (end.getTime() - start.getTime()) / 10
    );
    blockchain.setCurrentTime(now);
    // user 2 starts minting 10x more
    await lpToken.contract.transfer(
      {
        from: user2.accountName,
        to: rewards.accountName,
        quantity: `10.00000000 BTCUSDC`,
        memo: ``,
      },
      [{ actor: user2.accountName, permission: `active` }]
    );

    // advance time to end
    blockchain.setCurrentTime(end);

    await rewards.contract[`update.user`]({
      user: user1.accountName,
    });
    await rewards.contract[`update.user`]({
      user: user2.accountName,
    });

    const [user1Rewards, user2Rewards] = rewards.getTableRowsScoped(`rewards`)[
      rewards.accountName
    ];
    const blocksDelta = Math.floor((end.getTime() - start.getTime()) / 500);
    const rewardsPerBlock = 1000;
    const totalAmount = rewardsPerBlock * blocksDelta;
    // received full amount on first 1/10 time, received 1/11 amount on 9/10 time
    const expectedUser1Rewards = Math.floor(
      (0.1 * 1 + 0.9 * (1 / 11)) * totalAmount
    );

    const expectedUser2Rewards = totalAmount - expectedUser1Rewards;

    // allow little bit of rounding errors
    expect(
      Math.abs(
        safeParseInt(user1Rewards.stakes[0].value.accrued_rewards[0]) -
          expectedUser1Rewards
      )
    ).toBeLessThan(2);
    expect(
      Math.abs(
        safeParseInt(user2Rewards.stakes[0].value.accrued_rewards[0]) -
          expectedUser2Rewards
      )
    ).toBeLessThan(2);
  });

  test("rewards are independent of LP precision", async () => {
    await resetRewards();

    // end is in 1 year
    const end = new Date(`2002-01-01T00:00:00.000Z`);

    await lpToken.contract.transfer(
      {
        from: user1.accountName,
        to: rewards.accountName,
        quantity: `1.0000000 DOGEUSD`,
        memo: ``,
      },
      [{ actor: user1.accountName, permission: `active` }]
    );

    // advance time by 1/10
    let now = new Date(
      start.getTime() + (end.getTime() - start.getTime()) / 10
    );
    blockchain.setCurrentTime(now);
    // user 2 starts minting 10x more
    await lpToken.contract.transfer(
      {
        from: user2.accountName,
        to: rewards.accountName,
        quantity: `10.0000000 DOGEUSD`,
        memo: ``,
      },
      [{ actor: user2.accountName, permission: `active` }]
    );

    // advance time to end
    blockchain.setCurrentTime(end);

    await rewards.contract[`update.user`]({
      user: user1.accountName,
    });
    await rewards.contract[`update.user`]({
      user: user2.accountName,
    });

    const [user1Rewards, user2Rewards] = rewards.getTableRowsScoped(`rewards`)[
      rewards.accountName
    ];
    const blocksDelta = Math.floor((end.getTime() - start.getTime()) / 500);
    const rewardsPerBlock = 500;
    const totalAmount = rewardsPerBlock * blocksDelta;
    // received full amount on first 1/10 time, received 1/11 amount on 9/10 time
    const expectedUser1Rewards = Math.floor(
      (0.1 * 1 + 0.9 * (1 / 11)) * totalAmount
    );

    const expectedUser2Rewards = totalAmount - expectedUser1Rewards;

    // allow little bit of rounding errors
    expect(
      Math.abs(
        safeParseInt(user1Rewards.stakes[1].value.accrued_rewards[0]) -
          expectedUser1Rewards
      )
    ).toBeLessThan(2);
    expect(
      Math.abs(
        safeParseInt(user2Rewards.stakes[1].value.accrued_rewards[0]) -
          expectedUser2Rewards
      )
    ).toBeLessThan(2);
  });

  test("no deposits no rewards", async () => {
    await resetRewards();

    // end is in 1 year
    const end = new Date(`2002-01-01T00:00:00.000Z`);

    // advance time to end
    blockchain.setCurrentTime(end);

    await rewards.contract[`update`]({
      stake_symbols: [`BTCUSDC`],
    });
    const rewardsCfg = rewards.getTableRowsScoped(`rewards.cfg`)[
      rewards.accountName
    ];
    expect(rewardsCfg[0]).toMatchObject({
      // still 0
      reward_indices: [0],
      // but time is updated
      reward_time: "2002-01-01T00:00:00.000",
      rewards_per_half_second: [
        {
          contract: "token",
          quantity: "0.1000 REWARDS",
        },
      ],
      total_staked: {
        contract: lpToken.accountName,
        quantity: "0.00000000 BTCUSDC",
      },
    });
  });

  test("rewards are correctly distributed after one user withdraws", async () => {
    await resetRewards();

    // end is in 1 year
    const end = new Date(`2002-01-01T00:00:00.000Z`);

    await lpToken.contract.transfer(
      {
        from: user1.accountName,
        to: rewards.accountName,
        quantity: `10.00000000 BTCUSDC`,
        memo: ``,
      },
      [{ actor: user1.accountName, permission: `active` }]
    );

    // user 2 mints the same
    await lpToken.contract.transfer(
      {
        from: user2.accountName,
        to: rewards.accountName,
        quantity: `10.00000000 BTCUSDC`,
        memo: ``,
      },
      [{ actor: user2.accountName, permission: `active` }]
    );

    // advance time by 1/10
    let now = new Date(
      start.getTime() + (end.getTime() - start.getTime()) / 10
    );
    blockchain.setCurrentTime(now);

    await rewards.contract[`update.user`]({
      user: user2.accountName,
    });
    const [, user2RewardsOld] = rewards.getTableRowsScoped(`rewards`)[
      rewards.accountName
    ];
    // user withdraws after 1/10 time
    await rewards.contract.withdraw(
      {
        withdrawer: user2.accountName,
        token: {
          contract: lpToken.accountName,
          quantity: "10.00000000 BTCUSDC",
        },
      },
      [{ actor: user2.accountName, permission: `active` }]
    );

    // advance time to end
    blockchain.setCurrentTime(end);

    await rewards.contract[`update.user`]({
      user: user1.accountName,
    });
    await rewards.contract[`update.user`]({
      user: user2.accountName,
    });

    const [user1Rewards, user2Rewards] = rewards.getTableRowsScoped(`rewards`)[
      rewards.accountName
    ];
    const blocksDelta = Math.floor((end.getTime() - start.getTime()) / 500);
    const rewardsPerBlock = 1000;
    const totalAmount = rewardsPerBlock * blocksDelta;
    // received half amount on first 1/10 time, received full amount on 9/10 time
    const expectedUser1Rewards = Math.floor(
      (0.1 * 0.5 + 0.9 * 1.0) * totalAmount
    );

    const expectedUser2Rewards = totalAmount - expectedUser1Rewards;
    // allow little bit of rounding errors
    expect(
      Math.abs(
        safeParseInt(user1Rewards.stakes[0].value.accrued_rewards[0]) -
          expectedUser1Rewards
      )
    ).toBeLessThan(2);
    // user2 rewards have already been claimed at withdrawal
    expect(
      Math.abs(
        safeParseInt(user2RewardsOld.stakes[0].value.accrued_rewards[0]) -
          expectedUser2Rewards
      )
    ).toBeLessThan(2);
    expect(
      safeParseInt(user2Rewards.stakes[0].value.accrued_rewards[0])
    ).toEqual(0);

    // can close user2
    await rewards.contract.close(
      {
        user: user2.accountName,
        stakes: [`BTCUSDC`, `DOGEUSD`],
      },
      [{ actor: user2.accountName, permission: `active` }]
    );
    expect(
      rewards.getTableRowsScoped(`rewards`)[rewards.accountName]
    ).toHaveLength(1);
  });
}); // end describe

/**
 * To test:
 * [x] cannot withdraw more LP tokens than deposited
 * [x] no double claim
 * [x] can claim several stakes correctly
 * [x] two users share the rewards
 * [x] rewards with DOGE (7 decimals) work the same
 * [x] if nobody staked, no rewards are paid, but time is updated
 * [x] rewards are correctly distributed after one person withdraws
 * [x] can close position
 * [ ] implement book-keeping of contract reward balances as staking token could be used as reward token for some other stake
 */
