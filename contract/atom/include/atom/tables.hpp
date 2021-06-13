#pragma once

using namespace eosio;
using namespace std;

namespace proton {
  struct [[eosio::table, eosio::contract("atom")]] Airdrop {
    name account;
    asset amount;
    
    uint64_t primary_key() const { return account.value; };
  };
  typedef multi_index<"airdrop"_n, Airdrop> airdrop_table;
}