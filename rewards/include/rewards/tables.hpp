#pragma once

#include "utils.hpp"
#include <eosio.token/eosio.token.hpp>

using namespace eosio;
using namespace std;

namespace proton {
struct [[eosio::table, eosio::contract("rewards")]] globals_config {
  /// the extended symbol of the token rewards are paid in
  extended_symbol reward_symbol;

  // there shall only be 1 global
  uint64_t primary_key() const { return 0; };
};
typedef multi_index<"globals.cfg"_n, globals_config> globals_config_table;

struct [[eosio::table, eosio::contract("rewards")]] rewards_config {
  /// references stake symbol to accrue rewards for & total stake amount
  extended_asset total_staked;
  /// amount of reward tokens to distribute to the depositors per block
  int64_t rewards_per_half_second;
  /// index result of the last rewards allocation
  double reward_index;
  /// last time at which rewards were allocated
  time_point reward_time;

  uint64_t primary_key() const {
    return total_staked.quantity.symbol.code().raw();
  };

  extended_symbol get_extended_symbol() const {
    return total_staked.get_extended_symbol();
  };
};
typedef multi_index<"rewards.cfg"_n, rewards_config> rewards_config_table;

// This stores special reward token logic
struct reward_snapshot {
  /// deposited stake balance
  int64_t balance;
  /// rewards accrued (in reward token) but not claimed yet
  int64_t accrued_rewards;
  /// last index of when rewards were updated
  double reward_index;
};
struct [[eosio::table, eosio::contract("rewards")]] reward {
  /// user account for this reward position
  name account;
  /// maps stake symbol to the reward snapshot
  map<extended_symbol, reward_snapshot> stakes;

  uint64_t primary_key() const { return account.value; };

  void append_tokens(const vector<extended_asset>& append_tokens) {
    for (const auto& append_token : append_tokens) {
      const auto ext_symbol = append_token.get_extended_symbol();
      check(stakes[ext_symbol].balance + append_token.quantity.amount >=
                stakes[ext_symbol].balance,
            "overflow");
      stakes[ext_symbol].balance += append_token.quantity.amount;
    }
  }

  void subtract_tokens(const vector<extended_asset>& subtract_tokens) {
    for (const auto& subtract_token : subtract_tokens) {
      const auto ext_symbol = subtract_token.get_extended_symbol();
      const auto balance_amount = stakes[ext_symbol].balance;
      check(balance_amount >= subtract_token.quantity.amount,
            "Balance overdrawn. Need " + subtract_token.quantity.to_string() +
                " but balance is " + to_string(balance_amount) +
                " for symbol " + ext_symbol.get_symbol().code().to_string() +
                " contract " + ext_symbol.get_contract().to_string());
      stakes[ext_symbol].balance -= subtract_token.quantity.amount;
    }
  }

  // required for const struct's that cannot access stakes using operator[]
  reward_snapshot get_snapshot(const extended_symbol& stake_symbol) const {
    auto it = stakes.find(stake_symbol);
    return it == stakes.end() ? reward_snapshot() : it->second;
  }
};
typedef multi_index<"rewards"_n, reward> rewards_table;

} // namespace proton