/**
 * $ node scripts/account/fetch_transactions_by_address.js ADDRESS
 */
const {
  Address,
  AccountHttp,
} = require('nem2-sdk');
const {
  of,
  forkJoin
} = require('rxjs');
const {
  map,
  mergeMap
} = require('rxjs/operators');

const url = process.env.API_URL || 'http://localhost:3000';
const address = Address.createFromRawAddress(process.argv[2]);
const accountHttp = new AccountHttp(url);

accountHttp.getAccountInfo(address).pipe(
  mergeMap(accountInfo => {
    let observers = [];
    if(address.equals(accountInfo.address)) {
      observers = [
        accountHttp.incomingTransactions(accountInfo.publicAccount),
        accountHttp.outgoingTransactions(accountInfo.publicAccount),
        accountHttp.unconfirmedTransactions(accountInfo.publicAccount),
      ];
    } else {
      observers = [
        of([]),
        of([]),
        of([]),
      ];
    }
    return forkJoin([of(accountInfo)].concat(observers));
  }),
  map(results => {
    const [ account, incomings, outgoings, unconfirmed ] = results;
    return { account, incomings, outgoings, unconfirmed };
  })
).subscribe(
  data => console.log(data)
);
