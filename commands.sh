# 31556952 seconds in year
# 63113904 half seconds in year

cleospt push action yield.farms setrewards '
    [["8,XPRUSDC", "proton.swaps"],
    [
      {
        "quantity": "0.4500 XPR",
        "contract": "eosio.token"
      }
    ]]
' -p yield.farms;

cleospt push action yield.farms setrewards '
    [["8,XPRXMT", "proton.swaps"],
    [
      {
        "quantity": "0.4500 XPR",
        "contract": "eosio.token"
      }
    ]]
' -p yield.farms;

cleospt push action eosio.token transfer '["syedjafri", "yield.farms", "1000000.0000 XPR", "deposit rewards"]' -p syedjafri;

cleospt push action yield.farms open '["syedjafri", ["XPRUSDC"]]' -p syedjafri;
cleospt push action proton.swaps transfer '["syedjafri", "yield.farms", "1000.00000000 XPRUSDC", ""]' -p syedjafri;
cleospt push action yield.farms claim '["syedjafri", ["XPRUSDC"]]' -p syedjafri;
