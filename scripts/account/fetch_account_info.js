/**
 * $ node account/fetch_account_info.js ADDRESS
 */
const {
  Account,
  NetworkType,
  Address,
  AccountHttp
} = require('nem2-sdk');

const url = process.env.API_URL || 'http://localhost:3000';

let address = '';
if(process.env.PRIVATE_KEY) {
  const initiator = Account.createFromPrivateKey(
    process.env.PRIVATE_KEY,
    NetworkType.MIJIN_TEST
  );
  address = initiator.address;
} else {
  address = Address.createFromRawAddress(process.argv[2]);
}

const accountHttp = new AccountHttp(url);

accountHttp.getAccountInfo(address)
  .subscribe(accountInfoView => {
    console.log('%o', accountInfoView);
  })
;
