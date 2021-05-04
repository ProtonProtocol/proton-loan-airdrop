#pragma once

#include "utils.hpp"
#include <eosio.token/eosio.token.hpp>

using namespace eosio;
using namespace std;

namespace proton {
struct [[eosio::table, eosio::contract("rewards")]] globals_config {
  /// not needed for now, don't emplace a row

  // there shall only be 1 global
  uint64_t primary_key() const { return 0; };
};
typedef multi_index<"globals.cfg"_n, globals_config> globals_config_table;

struct [[eosio::table, eosio::contract("rewards")]] rewards_config {
  /// references stake symbol to accrue rewards for & total stake amount
  extended_asset total_staked;
  /// reward tokens to distribute to the depositors per block
  vector<extended_asset> rewards_per_half_second;
  /// index result of the last rewards allocation
  /// same order as rewards_per_half_second
  vector<double> reward_indices;
  /// last time at which rewards were allocated
  time_point reward_time;

  uint64_t primary_key() const {
    return total_staked.quantity.symbol.code().raw();
  };

  extended_symbol get_extended_symbol() const {
    return total_staked.get_extended_symbol();
  };

  /// appends new rewards tokens or updates existing ones with new amount
  void update_rewards(vector<extended_asset> new_rewards) {
    // not efficient, but as the vectors usually have 1-2 elements that's fine
    for (const extended_asset& new_reward : new_rewards) {
      auto found_it = std::find_if(
          rewards_per_half_second.begin(), rewards_per_half_second.end(),
          [&new_reward](const extended_asset& x) {
            return x.get_extended_symbol() == new_reward.get_extended_symbol();
          });
      if (found_it == rewards_per_half_second.end()) {
        rewards_per_half_second.push_back(new_reward);
        reward_indices.push_back(0.0);
      } else {
        *found_it = new_reward;
      }
    };
  };
};
typedef multi_index<"rewards.cfg"_n, rewards_config> rewards_config_table;

// This stores special reward token logic
struct reward_snapshot {
  /// deposited stake balance
  int64_t balance;
  /// rewards accrued (in reward token) but not claimed yet
  /// same order as in rewards_config
  vector<int64_t> accrued_rewards;
  /// latest indices of when rewards were updated
  /// same order as in rewards_config
  vector<double> reward_indices;
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
                " but balance is " +
                asset(balance_amount, ext_symbol.get_symbol()).to_string() +
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