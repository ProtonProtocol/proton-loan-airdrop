#pragma once

using namespace eosio;
using namespace std;

#define LOAN_TOKEN_CONTRACT name("loan.token")
#define LOAN_AIRDROP_MEMO string("LOAN Airdrop")

namespace proton
{
  static constexpr auto SECONDS_IN_MINUTE = 60;
  static constexpr auto SECONDS_IN_HOUR   = SECONDS_IN_MINUTE * 60;
  static constexpr auto SECONDS_IN_DAY    = SECONDS_IN_HOUR * 24;
  static constexpr auto HOURS_IN_DAY      = 24;
  static constexpr auto MAX_TERM_MONTHS   = 3;
  static constexpr auto MAX_PROCESS       = 5;
} // namespace proton