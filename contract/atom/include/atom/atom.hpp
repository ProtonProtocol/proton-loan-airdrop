#pragma once

// Standard.
#include <vector>

// EOS
#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/crypto.hpp>
#include <eosio/transaction.hpp>

// Local
#include "constants.hpp"
#include "tables.hpp"

using namespace eosio;
using namespace std;

namespace proton {
  CONTRACT atom : public contract {
  public:
    using contract::contract;

    atom( name receiver, name code, datastream<const char*> ds )
      : contract(receiver, code, ds),
        _airdrops(receiver, receiver.value) {}

    ACTION airdrop (
      const std::vector<Airdrop>& airdrops
    );

    ACTION cleanup () {
      require_auth(get_self());
      
      airdrop_table db(get_self(), get_self().value);
      auto itr = db.end();
      while(db.begin() != itr){
        itr = db.erase(--itr);
      }
    }

    void transfer ( const name& from,
                    const name& to,
                    const asset& quantity,
                    const string& memo );

    // Action wrappers
    using transfer_action = action_wrapper<"transfer"_n, &atom::transfer>;

    // Initialize tables from tables.hpp
    airdrop_table _airdrops;
  };
}