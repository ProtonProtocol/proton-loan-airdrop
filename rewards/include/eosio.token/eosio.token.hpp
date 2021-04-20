#pragma once

#include <eosio/asset.hpp>
#include <eosio/eosio.hpp>

#include <string>

namespace eosio {

using std::string;
class [[eosio::contract("eosio.token")]] token : public contract {
public:
  using contract::contract;

  [[eosio::action]] void create(const name& issuer,
                                const asset& maximum_supply);

  [[eosio::action]] void issue(const name& to, const asset& quantity,
                               const string& memo);
  [[eosio::action]] void retire(const asset& quantity, const string& memo);
  [[eosio::action]] void transfer(const name& from, const name& to,
                                  const asset& quantity, const string& memo);
  [[eosio::action]] void open(const name& owner, const symbol& symbol,
                              const name& ram_payer);
  [[eosio::action]] void close(const name& owner, const symbol& symbol);

  using create_action = eosio::action_wrapper<"create"_n, &token::create>;
  using issue_action = eosio::action_wrapper<"issue"_n, &token::issue>;
  using retire_action = eosio::action_wrapper<"retire"_n, &token::retire>;
  using transfer_action = eosio::action_wrapper<"transfer"_n, &token::transfer>;
  using open_action = eosio::action_wrapper<"open"_n, &token::open>;
  using close_action = eosio::action_wrapper<"close"_n, &token::close>;

  struct [[eosio::table]] account {
    asset balance;

    uint64_t primary_key() const { return balance.symbol.code().raw(); }
  };

  struct [[eosio::table]] currency_stats {
    asset supply;
    asset max_supply;
    name issuer;

    uint64_t primary_key() const { return supply.symbol.code().raw(); }
  };

  typedef eosio::multi_index<"accounts"_n, account> accounts;
  typedef eosio::multi_index<"stat"_n, currency_stats> stats;

  void sub_balance(const name& owner, const asset& value);
  void add_balance(const name& owner, const asset& value,
                   const name& ram_payer);
};

} // namespace eosio