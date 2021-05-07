```bash
npm i -g eosiac

# deploy changes
eosiac apply ptest

# run actions
node actions/tokens/_init.js
node actions/stakerewards/_init.js
# user
node actions/user/_init.js
node actions/user/deposit-withdraw.js
node actions/user/claim.js
```