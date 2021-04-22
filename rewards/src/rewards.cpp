#include <rewards/rewards.hpp>

/** Mechanics

Main idea:
The rewards for a user in a single market depend on their proportional share of
the total staked assets. Therefore, we keep track of events that change the
total staked amount. These are the "deposit" and "withdraw" actions. In-between
two such events, the reward payout is linear:
1. Total reward payout: timeDeltaInHalfSeconds * rewardPerHalfBlock
2. For this time period, the user stakes did not change and can be credited
accordingly
So whenever any such event happens, we first pay out the rewards using the old
stake state, and then update the stake state.

the total user rewards are the sum of their rewards in each period:
total_user_rewards = sum_{p in periods}: user_stake_p / total_staked_p *
rewards_p
however, this is hard to track because we'd need to update all users on each
period.

a lot of times the user_stake_p does not change for a specific user as other
people are depositing/withdrawing. we can further split this into period
_sequences_ where the user_stake_p is constant:
total_user_rewards_u = sum_{cp in constant_periods_u}
  sum_{p in cp}: user_stake_cp / total_staked_p * rewards_p
  = sum_{cp in constant_periods} user_stake_cp * [sum_{p in cp}: rewards_p /
total_staked_p]

notice that if we introduce a new variable "reward_index_p" and define it as:
reward_index_p = sum_{i=0..p}: rewards_i / total_staked_i
we get for the inner sum:
sum_{p in cp}: rewards_p / total_staked_p = reward_index_{cp.end} -
reward_index_{cp.begin}

Therefore:
total_user_rewards = sum_{cp in constant_periods} user_stake_cp *
(reward_index_{cp.end} - reward_index_{cp.begin})

What does this formula mean?
It means that we only need to keep track of a running reward_index variable on
each deposit/withdraw, and we only need to update a user when their balance
changes, i.e., when the user themself runs deposit/withdraw.
So we can keep track of all users, by only updating the running index and the
currently depositing/withdrawing user.

A note on the initial value of reward_index:
Notice how the first period starts from initializing the rewards (`createstake`
acttion) until the first deposit. As the user's balance is zero, it doesn't
matter what the initial value of reward_index_0 is as it gets multipled by 0.
We choose the initial reward_index value to be 0 for convenience reasons.
 */

namespace proton {
void rewards::initrewards(const extended_symbol& reward_symbol) {
  require_auth(get_self());
  auto globals_it = _globalscfg.begin();

  auto upsert = [&](auto& g) {
    // changing the reward symbol would break the current outstanding claims
    check(g.reward_symbol.get_contract().value == 0,
          "reward symbol has already been set");
    g.reward_symbol = reward_symbol;
  };
  if (globals_it == _globalscfg.end()) {
    _globalscfg.emplace(get_self(), upsert);
  } else {
    _globalscfg.modify(globals_it, get_self(), upsert);
  }
}

void rewards::createstake(const extended_symbol& stake_symbol,
                          const asset& rewards_per_half_second) {
  require_auth(get_self());

  auto globals = get_globals();
  check(globals.reward_symbol.get_contract().value != 0,
        "set up reward token with initrewards first");
  check(globals.reward_symbol.get_symbol() == rewards_per_half_second.symbol,
        "reward symbol mismatch");

  // check if stake already exists
  auto cfg_it = _rewardscfg.find(stake_symbol.get_symbol().code().raw());
  if (cfg_it == _rewardscfg.end()) {
    _rewardscfg.emplace(get_self(), [&](auto& r) {
      r.total_staked = extended_asset(0, stake_symbol);
      r.rewards_per_half_second = rewards_per_half_second.amount;
      r.reward_index = 0.0;
      r.reward_time = current_time_point();
    });
  } else {
    // update index up to now using the old reward rate
    update_reward_index(cfg_it->get_extended_symbol().get_symbol().code());

    _rewardscfg.modify(cfg_it, same_payer, [&](auto& r) {
      r.rewards_per_half_second = rewards_per_half_second.amount;
    });
  }
}

void rewards::deposit_stake(const name& depositor,
                            const extended_asset& token) {
  require_auth(depositor);
  check(token.quantity.amount > 0, "must use a positive amount");
  // check if this market exists and if user entered
  check_user_in_stake(depositor, token.get_extended_symbol());

  // update rewards for stake token
  symbol_code stake_sym = token.quantity.symbol.code();
  update_reward_index(stake_sym);
  update_user_rewards(depositor, stake_sym);

  auto rewards_it =
      _rewards.require_find(depositor.value, "enter markets first");
  _rewards.modify(rewards_it, same_payer,
                  [&](auto& r) { r.append_tokens({token}); });

  auto rewardscfg_it = get_reward_config_by_stake(stake_sym);
  _rewardscfg.modify(rewardscfg_it, same_payer,
                     [&](auto& r) { r.total_staked += token; });
}

void rewards::withdraw(const name& withdrawer, const extended_asset& token) {
  require_auth(withdrawer);
  check(token.quantity.amount > 0, "must use a positive amount");
  // check if this market exists and if user entered
  check_user_in_stake(withdrawer, token.get_extended_symbol());

  _claim(withdrawer, {token.quantity.symbol.code()});

  auto rewards_it =
      _rewards.require_find(withdrawer.value, "enter markets first");
  _rewards.modify(rewards_it, same_payer,
                  [&](auto& r) { r.subtract_tokens({token}); });

  token::transfer_action transfer_act(token.contract,
                                      {get_self(), name("active")});
  transfer_act.send(get_self(), withdrawer, token.quantity, "withdraw");
}

void rewards::deposit_rewards(const extended_asset& token) {
  // we don't need to track the reward balance, can just use token.accounts
}

void rewards::withdraw_rewards(const name& to, const extended_asset& token) {
  require_auth(get_self());
  check(token.quantity.amount > 0, "must use a positive amount");
  check(to != get_self(), "cannot withdraw to self");

  auto globals = get_globals();
  check(globals.reward_symbol == token.get_extended_symbol(),
        "must withdraw reward symbol");

  token::transfer_action transfer_act(token.contract,
                                      {get_self(), name("active")});
  transfer_act.send(get_self(), to, token.quantity, "withdraw rewards");
}

void rewards::open(const name& payer, const name& user,
                   const vector<symbol_code>& stakes) {
  require_auth(payer);
  // open the reward balance for the user
  auto rewards_it = _rewards.find(user.value);
  auto upsert_rewards = [&](auto& r) {
    r.account = user;
    for (const auto& stake_sym : stakes) {
      auto rewardcfg = get_reward_config_by_stake(stake_sym);
      extended_symbol stake_symbol = rewardcfg->get_extended_symbol();
      if (r.stakes.find(stake_symbol) == r.stakes.end()) {
        r.stakes[stake_symbol] =
            reward_snapshot{.accrued_rewards = 0,
                            .reward_index = rewardcfg->reward_index,
                            .balance = 0};
      }
    }
  };
  if (rewards_it == _rewards.end()) {
    _rewards.emplace(payer, upsert_rewards);
  } else {
    _rewards.modify(rewards_it, payer, upsert_rewards);
  }
}

void rewards::close(const name& user, const vector<symbol_code>& stakes) {
  check(has_auth(get_self()) || has_auth(user), "missing authorization");
  // no need to update user rewards here as we make sure they have a 0 balance
  // everywhere
  int64_t token_count = 0;

  auto rewards_it = _rewards.find(user.value);
  _rewards.modify(rewards_it, same_payer, [&](auto& r) {
    r.account = user;
    for (const auto& stake_sym : stakes) {
      auto rewardcfg = get_reward_config_by_stake(stake_sym);
      extended_symbol stake_symbol = rewardcfg->get_extended_symbol();
      auto stake_it = r.stakes.find(stake_symbol);
      if (stake_it != r.stakes.end()) {
        check(stake_it->second.accrued_rewards == 0 &&
                  stake_it->second.balance == 0,
              "outstanding rewards or balance. must withdraw first");
        r.stakes.erase(stake_it);
      }
    }

    token_count = r.stakes.size();
  });

  if (token_count == 0) {
    _rewards.erase(rewards_it);
  }
}

void rewards::claim(const name& claimer, const vector<symbol_code>& stakes) {
  check(has_auth(get_self()) || has_auth(claimer), "missing authorization");

  int64_t amount_claimed = _claim(claimer, stakes);

  // if nothing was sent out, user didn't claim a single stake, reject
  check(amount_claimed > 0, "nothing to claim");
}

int64_t rewards::_claim(const name& claimer,
                        const vector<symbol_code>& stakes) {
  extended_symbol reward_symbol = get_globals().reward_symbol;
  // initialize here and subtract what we send out
  // because this contract's balance only updates _after_ transfer actions
  extended_asset initial_reward_balance =
      get_balance(get_self(), reward_symbol);
  extended_asset running_reward_balance =
      get_balance(get_self(), reward_symbol);

  for (const symbol_code& stake_sym : stakes) {
    auto rewardscfg_it = get_reward_config_by_stake(stake_sym);
    extended_symbol stake_symbol = rewardscfg_it->get_extended_symbol();
    check_user_in_stake(claimer, stake_symbol);
    auto rewards_it =
        _rewards.require_find(claimer.value, "enter market first");

    // update user rewards first, can do this here because
    // we don't issue rewards but they are already in this contract
    update_reward_index(stake_sym);
    update_user_rewards(claimer, stake_sym);

    int64_t accrued_rewards =
        rewards_it->get_snapshot(stake_symbol).accrued_rewards;

    _rewards.modify(rewards_it, same_payer, [&](auto& r) {
      r.stakes[stake_symbol].accrued_rewards = 0;
    });

    // there could be rounding errors such that the last claimer has a higher
    // balance than what has been issued in the updates
    extended_asset to_transfer = running_reward_balance;
    if (accrued_rewards < to_transfer.quantity.amount) {
      to_transfer.quantity.amount = accrued_rewards;
    }
    if (to_transfer.quantity.amount == 0)
      continue;

    running_reward_balance -= to_transfer;
    token::transfer_action transfer_act(to_transfer.contract,
                                        {get_self(), name("active")});
    transfer_act.send(get_self(), claimer, to_transfer.quantity,
                      "claim " + stake_sym.to_string());
  }

  return (initial_reward_balance - running_reward_balance).quantity.amount;
}

void rewards::update(const vector<symbol_code>& stake_symbols) {
  // no auth required
  // manually trigger an update
  // useful for "read actions" to call in the same transaction
  for (const auto& stake_sym : stake_symbols) {
    update_reward_index(stake_sym);
  }
}

void rewards::update_user(const name& user) {
  // no auth required
  // manually trigger an update
  // useful for "read actions" to call in the same transaction
  auto rewards_it = _rewards.require_find(user.value, "enter markets first");
  vector<symbol_code> user_stakes;
  for (const auto& pair : rewards_it->stakes) {
    user_stakes.push_back(pair.first.get_symbol().code());
  }

  for (const symbol_code& stake_sym : user_stakes) {
    update_reward_index(stake_sym);
    update_user_rewards(user, stake_sym);
  }
}

void rewards::update_reward_index(const symbol_code& stake) {
  time_point now = current_time_point();
  auto rewardscfg_it = get_reward_config_by_stake(stake);
  // no unnecessary db updates
  if (now <= rewardscfg_it->reward_time)
    return;

  uint64_t blocks_delta = get_blocks_since(rewardscfg_it->reward_time, now);
  int64_t new_rewards_delta =
      blocks_delta * rewardscfg_it->rewards_per_half_second;

  // keep updating time even if there are no rewards
  if (new_rewards_delta == 0) {
    _rewardscfg.modify(rewardscfg_it, same_payer,
                       [&](auto& r) { r.reward_time = now; });
  } else {
    // we want to distribute new_rewards_delta among all stakers, pro rata
    int64_t total_staked = rewardscfg_it->total_staked.quantity.amount;
    if (total_staked == 0) {
      // past period to now with nobody in the market => don't issue tokens
      _rewardscfg.modify(rewardscfg_it, same_payer,
                         [&](auto& r) { r.reward_time = now; });
      return;
    }

    double ratio = (double)new_rewards_delta / total_staked;
    _rewardscfg.modify(rewardscfg_it, same_payer, [&](auto& r) {
      r.reward_index = r.reward_index + ratio;
      r.reward_time = now;
    });

    // no issue of rewards, we assume they are transferred to this contract
  }
}

void rewards::update_user_rewards(const name& user, const symbol_code& stake) {
  auto rewardscfg_it = get_reward_config_by_stake(stake);
  auto rewards_it = _rewards.require_find(user.value, "enter market first");

  _rewards.modify(rewards_it, same_payer, [&](auto& r) {
    auto& snapshot = r.stakes[rewardscfg_it->get_extended_symbol()];
    double delta_index = rewardscfg_it->reward_index - snapshot.reward_index;
    int64_t user_delta = snapshot.balance * delta_index;
    snapshot.accrued_rewards += user_delta;
    snapshot.reward_index = rewardscfg_it->reward_index;
  });
}

rewards_config_table::const_iterator
rewards::get_reward_config_by_stake(const symbol_code& stake_symbol) {
  return _rewardscfg.require_find(
      stake_symbol.raw(),
      ("rewards config does not exist for market: " + stake_symbol.to_string())
          .c_str());
}

globals_config rewards::get_globals() {
  auto globals = _globalscfg.begin();
  check(globals != _globalscfg.end(), "globals not set");
  return *globals;
}

void rewards::check_user_in_stake(const name& user,
                                  const extended_symbol& stake_symbol) {
  string error =
      ("enter market first: " + stake_symbol.get_symbol().code().to_string());
  auto rewards_it = _rewards.require_find(user.value, error.c_str());

  check(rewards_it->stakes.find(stake_symbol) != rewards_it->stakes.end(),
        error.c_str());
}
} // namespace proton