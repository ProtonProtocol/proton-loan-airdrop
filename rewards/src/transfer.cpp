#include <rewards/rewards.hpp>

namespace proton {
void rewards::on_transfer(const name& from, const name& to,
                          const asset& quantity, const string& memo) {
  // Skip if outgoing
  if (from == get_self()) {
    return;
  }

  // Validate transfer
  check(to == get_self(), "invalid to account");

  // Deposit
  name token_contract = get_first_receiver();
  auto token = extended_asset(quantity, token_contract);

  // Special eosio exclusion
  if (from == "eosio"_n) {
    deposit_rewards(token);
    return;
  }

  // Skip if deposit from system accounts
  if (from == "eosio.stake"_n || from == "eosio.ram"_n) {
    return;
  }

  std::string trimmed_memo = memo;
  trim(trimmed_memo);
  if (starts_with(trimmed_memo, "deposit rewards")) {
    deposit_rewards(token);
  } else {
    deposit_stake(from, token);
  }
}

} // namespace proton