#pragma once

// Standard.
#include <string>
#include <vector>

// EOS
#include <eosio/asset.hpp>
#include <eosio/crypto.hpp>
#include <eosio/eosio.hpp>
#include <eosio/transaction.hpp>

// Local
#include "constants.hpp"
#include "tables.hpp"
#include <eosio.token/eosio.token.hpp>

using namespace eosio;
using namespace std;

namespace proton {
CONTRACT rewards : public contract {
public:
  using contract::contract;

  rewards(name receiver, name code, datastream<const char*> ds)
      : contract(receiver, code, ds), _globalscfg(receiver, receiver.value),
        _rewards(receiver, receiver.value),
        _rewardscfg(receiver, receiver.value) {}

  // Actions and on_transfer handlers
  // transfer stake token and make balance available to borrow against
  void deposit_stake(const name& depositor, const extended_asset& token);

  // withdraw stake token to have own custody or to trade it
  ACTION withdraw(const name& withdrawer, const extended_asset& token);

  /// allows admin to add rewards. rewards must be pre-deposited
  void deposit_rewards(const extended_asset& token);

  /// allows admin to withdraw the deposited rewards
  [[eosio::action("withdraw.rew")]] void withdraw_rewards(
      const name& to, const extended_asset& token);

  ACTION claim(const name& claimer, const vector<symbol_code>& stakes);

  // triggers a manual accrual update of the stake
  ACTION update(const vector<symbol_code>& stake_symbols);
  // triggers a manual accrual update of all user-entered stakes
  [[eosio::action("update.user")]] void update_user(const name& user);

  [[eosio::on_notify("*::transfer")]] void on_transfer(
      const name& from, const name& to, const asset& quantity,
      const string& memo);

  // open balances for user in these stakes
  ACTION open(const name& payer, const name& user,
              const vector<symbol_code>& stakes);
  // closes balances for user in these stakes
  ACTION close(const name& user, const vector<symbol_code>& stakes);

  ACTION initrewards(const extended_symbol& reward_symbol);
  ACTION setrewards(const symbol_code& stake,
                    const asset& rewards_per_half_second);

  // Initialize tables from tables.hpp
  globals_config_table _globalscfg;
  rewards_config_table _rewardscfg;
  rewards_table _rewards;

private:
  int64_t _claim(const name& claimer, const vector<symbol_code>& stakes);
  rewards_config_table::const_iterator get_reward_config_by_stake(
      const symbol_code& stake_symbol);
  globals_config get_globals();
  void check_user_in_stake(const name& user,
                           const extended_symbol& stake_symbol);

  void update_reward_index(const symbol_code& stake);
  void update_user_rewards(const name& user, const symbol_code& stake);
};

} // namespace proton