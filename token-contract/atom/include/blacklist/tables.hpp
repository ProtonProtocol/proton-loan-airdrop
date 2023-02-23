#include <eosio/asset.hpp>
#include <eosio/eosio.hpp>

namespace eosio {
    struct [[eosio::table, eosio::contract("blacklist")]] blacklists {
    name  account_name;

    uint64_t primary_key() const { return account_name.value; }
    };
    typedef multi_index<"blacklists"_n, blacklists> blacklists_table;
}