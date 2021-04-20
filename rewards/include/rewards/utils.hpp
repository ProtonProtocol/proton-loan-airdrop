#pragma once

#include <cmath>
#include <eosio.token/eosio.token.hpp>
#include <rewards/constants.hpp>
#include <string>
#include <vector>

using namespace eosio;
using namespace std;

namespace proton {
static inline void ltrim(std::string& s) {
  s.erase(s.begin(), std::find_if(s.begin(), s.end(), [](unsigned char ch) {
            return !std::isspace(ch);
          }));
}

// trim from end (in place)
static inline void rtrim(std::string& s) {
  s.erase(std::find_if(s.rbegin(), s.rend(),
                       [](unsigned char ch) { return !std::isspace(ch); })
              .base(),
          s.end());
}

// trim from both ends (in place)
static inline void trim(std::string& s) {
  ltrim(s);
  rtrim(s);
}

static inline bool starts_with(const std::string& text,
                               const std::string& search_for) {
  // https://stackoverflow.com/a/40441240/9843487
  // text starts with prefix?
  return text.rfind(search_for, 0) == 0;
}

static extended_asset get_balance(const name& acc,
                                  const extended_symbol& token_symbol) {
  token::accounts accounts_table(token_symbol.get_contract(), acc.value);
  const auto& it = accounts_table.find(token_symbol.get_symbol().code().raw());
  int64_t amount = it == accounts_table.end() ? 0 : it->balance.amount;
  return extended_asset(amount, token_symbol);
}

static uint64_t get_blocks_since(const time_point& from, const time_point& to) {
  check(from <= to, "get_blocks_since from > to");
  uint64_t diff_ms = (to - from).count() / 1000;
  constexpr uint64_t AVERAGE_BLOCK_RATE_MS = 500;
  return diff_ms / AVERAGE_BLOCK_RATE_MS;
}
} // namespace proton
