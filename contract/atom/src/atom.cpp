#include <atom/atom.hpp>

namespace proton
{
  void atom::airdrop(
    const std::vector<Airdrop>& airdrops
  ) {
    require_auth(get_self());

    for (auto airdrop: airdrops) {
      check(_airdrops.find(airdrop.account.value) == _airdrops.end(), "airdrop already exists");

      _airdrops.emplace(get_self(), [&](auto& a) {
        a.account = airdrop.account;
        a.amount = airdrop.amount;
      });

      // Pay out airdrop
      transfer_action t_action( LOAN_TOKEN_CONTRACT, {get_self(), "active"_n} );
      t_action.send(get_self(), airdrop.account, airdrop.amount, LOAN_AIRDROP_MEMO);
    }
  }
} // namepsace contract