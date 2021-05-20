# Proton LP rewards

#### Structure

- [The rewards contract](./rewards)
- [The standard eosio.token contract](./eosio.token). Used for share symbols (LP tokens / interest-bearing tokens) of the markets.
- [The Hydra tests](./js_tests)

## Development

#### Build

```bash
# compile smart contracts
./build.sh
```

#### Tests

```bash
# install hydra and login, adjust hydra.yml options
npm i -g @klevoya/hydra
# run tests
cd js_tests
# adjust hydra.yml options to configure hydra server or comment out options block
# run tests
npm test -- rewards
```

# Documentation

## General

<details>
  <summary>Mechanics</summary>

The main idea is that rewards for a user in a single market depend on their proportional share of the total staked assets.
Therefore, we keep track of events that change the total staked amount.
These are the "deposit" and "withdraw" actions.
In-between two such events, the reward payout is _linear_:

1. Total reward payout: `timeDeltaInHalfSeconds * rewardPerHalfBlock`
2. For this time period, the user stakes did not change and can be credited
   accordingly
   So whenever any such event happens, we first pay out the rewards using the old
   stake state, and then update the stake state.

The total user rewards are the sum of their rewards in each period:

```tex
total_user_rewards = sum_{p in periods}: user_stake_p / total_staked_p * rewards_p
```

However, this is hard to track for each user because we'd need to update all users on each period.

A lot of times the `user_stake_p` (the staked balance of the user) does not change for a specific user as other users are depositing/withdrawing.
We can further split this into consecutive period _partitions_ where the `user_stake_p` is constant:

```tex
total_user_rewards_u = sum_{cp in constant_periods_u} sum_{p in cp}:
user_stake_cp / total_staked_p * rewards_p
= sum_{cp in constant_periods} user_stake_cp * [sum_{p in cp}: rewards_p / total_staked_p]
```

Notice that if we introduce a new variable `reward_index_p` and define it as:

```tex
reward_index_p = sum_{i=0..p}: rewards_i / total_staked_i
```

We get for the inner sum:

```tex
sum_{p in cp}: rewards_p / total_staked_p = reward_index_{cp.end} -
reward_index_{cp.begin}
```

Therefore:

```tex
total_user_rewards = sum_{cp in constant_periods} user_stake_cp *
(reward_index_{cp.end} - reward_index_{cp.begin})
```

#### What does this formula mean?

It means that we only need to keep track of a running `reward_index` variable on each deposit/withdraw, and we only need to update a user when their balance changes (translates to a "constant period" being over), i.e., when the user themself runs deposit/withdraw.
So we can keep track of all users, by only updating the total running index and the index of the currently depositing/withdrawing user.

A note on the initial value of `reward_index`:
Notice how the first period starts from initializing the rewards (`createstake` acttion) until the first deposit.
As the user's balance is zero, it doesn't matter what the initial value of `reward_index_0` is as it gets multipled by 0 (the initial user balance).
We choose the initial `reward_index` value to be 0 for convenience reasons and to keep the index smaller.

</details>

## Tables

<details>
  <summary>Show Tables</summary>

### TABLE `rewards.cfg`

- `{extended_asset} total_staked`: references stake symbol to accrue rewards for & total stake amount
- `{vector<extended_asset>} rewards_per_half_second`: reward tokens to distribute to the depositors per block
- `{vector<double>} reward_indices`: index result of the last rewards allocation. same order as rewards_per_half_second
- `{time_point} reward_time`: last time at which rewards were allocated

### example

```json
{
  "reward_indices": [630.72],
  "reward_time": "2002-01-01T00:00:00.000",
  "rewards_per_half_second": [
    {
      "contract": "token",
      "quantity": "0.1000 REWARDS"
    }
  ],
  "total_staked": {
    "contract": "proton.swaps",
    "quantity": "1.00000000 BTCUSDC"
  }
}
```

### TABLE `rewards`

- `{name} account`: user account for this reward position
- `{map<symbol_code, reward_snapshot>} stakes`: maps stake symbol to the reward snapshot
- `{int64_t} reward_snapshot.balance`: deposited stake balance
- `{vector<int64_t>} reward_snapshot.accrued_rewards`: rewards accrued (in reward token) but not claimed yet. same order as in rewards_config
- `{vector<double>} reward_snapshot.reward_indices`: latest indices of when rewards were updated for this user. same order as in rewards_config

### example

```json
{
  "account": "user1",
  "stakes": [
    {
      "key": {
        "sym": "8,BTCUSDC",
        "contract": "proton.swaps"
      },
      "value": {
        "balance": "100000000",
        "accrued_rewards": ["63072000000"],
        "reward_indices": [630.72]
      }
    }
  ]
}
```

</details>

## Actions

<details>
  <summary>Show User Actions</summary>

### DEPOSIT STAKE

Deposits stake tokens to receive rewards on.

This action is triggered as a `transfer` action of the stake symbol contract.

- **authority**: `from`
- **requirements**: none
- **memo**: `` (none)

#### example

```json
{
  "account": "proton.swaps",
  "name": "transfer",
  "data": {
    "from": "user",
    "to": "stakerewards",
    "quantity": "1.00000000 BTCUSDC",
    "memo": ""
  }
}
```

### WITHDRAW STAKE

Withdraw stake tokens which decreases stake balance to earn rewards on.

- **authority**: `withdrawer`
- **requirements**: The user needs to have enough stake tokens deposited.

#### args

- `{name} withdrawer`: the withdrawing user
- `{extended_asset} token`: the stake token amount to withdraw

#### example

```json
{
  "account": "stakerewards",
  "name": "withdraw",
  "data": {
    "withdrawer": "user",
    "token": {
      "quantity": "1.00000000 BTCUSDC",
      "contract": "proton.swaps"
    }
  }
}
```

### CLAIM REWARDS

Claims any out-standing rewards for the markets (`rewards.markets[market].accrued_amount`).
The rewards for the claimed markets are updated before claiming.
The rewards must be transferred to the contract before any claims. If not enough reward tokens are in the contract, the claim happens on the left-over amount and resets the user's claimable rewards to zero.

- **authority**: `user` or `self`
- **requirements**: none

#### args

- `{name} user`: The user claiming rewards
- `{vector<symbol_code>} stakes`: the stake symbols of the markets to claim rewards from

#### example

```json
{
  "account": "stakerewards",
  "name": "claim",
  "data": {
    "claimer": "user",
    "stakes": ["BTCUSDC"]
  }
}
```

### UPDATE USER

Updates a user's tables by accruing debt and rewards.

- **authority**: none
- **requirements**: none

#### args

- `{name} user`: The user claiming rewards

#### example

```json
{
  "account": "stakerewards",
  "name": "update.user",
  "data": {
    "user": "user"
  }
}
```

### OPEN STAKES

Enters the specified staking markets for a user by opening relevant table entries.
The user can only deposit to the staking markets they have entered.
Is a no-op if the user already entered the staking market.

> The contract account currently covers the user's RAM cost.

- **authority**: `user`
- **requirements**: none

#### args

- `{name} user`: The user entering the staking markets
- `{vector<symbol_code>} stakes`: the stake symbols of the markets to enter

#### example

```json
{
  "account": "stakerewards",
  "name": "open",
  "data": {
    "user": "user",
    "stakes": ["BTCUSDC"]
  }
}
```

### CLOSE STAKES

Exits the specified staking markets for a user by closing relevant table entries.

- **authority**: `user`
- **requirements**: the user must not have any out-standing rewards or stakes. The stake should be withdrawn first, and the rewards claimed.

#### args

- `{name} user`: The user exiting the staking markets
- `{vector<symbol_code>} stakes`: the stake symbols of the markets to exit

#### example

```json
{
  "account": "stakerewards",
  "name": "close",
  "data": {
    "user": "user",
    "stakes": ["BTCUSDC"]
  }
}
```

</details>

<details>
  <summary>Show Admin Actions</summary>

### CREATE/UPDATE STAKING MARKET

Creates or updates a staking market.

- **authority**: `self`
- **requirements**: The stake symbols must not be used as the stake symbol of another market already.

> ⚠️ Stake symbols and reward symbols should always be distinct as the accounting fails otherwise. If any market pays out rewards in `REWARDS` tokens, make sure that `REWARDS` is not the stake symbol of any staking market.

#### args

- `{extended_symbol} stake_symbol`: The symbol that users need to stake in order to receive the rewards
- `{vector<extended_asset>} rewards_per_half_second`: A list of reward token amounts that will be distributed to users each half-second (~block).

#### example

```json
{
  "account": "stakerewards",
  "name": "setrewards",
  "data": {
    "stake_symbol": {
      "sym": "8,BTCUSDC",
      "contract": "proton.swaps"
    },
    "rewards_per_half_second": [
      {
        "quantity": "0.1000 REWARDS",
        "contract": "rewardtoken"
      },
      {
        "quantity": "0.0500 LOAN",
        "contract": "rewardtoken"
      }
    ]
  }
}
```

### DEPOSIT REWARDS

Transfers reward tokens to the contract for them to be distributed to claimers.

This action is triggered as a `transfer` action of the reward symbol contract.

- **authority**: `from`
- **requirements**: none
- **memo**: `deposit rewards`

#### example

```json
{
  "account": "rewardtoken",
  "name": "transfer",
  "data": {
    "from": "admin",
    "to": "stakerewards",
    "quantity": "10000000000.0000 REWARDS",
    "memo": "deposit rewards"
  }
}
```

### WITHDRAW REWARDS

Withdraws deposited rewards.

- **authority**: `self`
- **requirements**: the amount to withdraw must be less than the contract's current balance

#### args

- `{name} to`: the account that will receive the withdrawal
- `{extended_asset} token`: the amount of rewards to withdraw

#### example

```json
{
  "account": "stakerewards",
  "name": "withdraw.res",
  "data": {
    "to": "admin",
    "token": {
      "quantity": "1.00000000 REWARDS",
      "contract": "rewardtoken"
    }
  }
}
```

</details>
