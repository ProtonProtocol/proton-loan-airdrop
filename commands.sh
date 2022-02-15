# 31556952 seconds in year
# 63113904 half seconds in year

cleospt push action yield.farms setrewards '
    [["8,XPRUSDC", "proton.swaps"],
    [
      {
        "quantity": "1.8000 XPR",
        "contract": "eosio.token"
      }
    ]]
' -p yield.farms;

cleospt push action yield.farms setrewards '
    [["8,XPRLOAN", "proton.swaps"],
    [
      {
        "quantity": "15.8443 LOAN",
        "contract": "loan.token"
      }
    ]]
' -p yield.farms;

cleospt push action yield.farms setrewards '
    [["4,SLOAN", "locked.token"],
    [
      {
        "quantity": "63.3772 LOAN",
        "contract": "loan.token"
      }
    ]]
' -p yield.farms;

# Deposit rewards
cleospt push action eosio.token transfer '["otctest", "yield.farms", "1000000.0000 XPR", "deposit rewards"]' -p otctest;

# FARM
cleospt push action yield.farms open '["otctest", ["XPRLOAN"]]' -p otctest;
cleospt push action proton.swaps transfer '["otctest", "yield.farms", "125.00000000 XPRLOAN", ""]' -p otctest;
cleospt push action yield.farms claim '["otctest", ["XPRUSDC"]]' -p otctest;
