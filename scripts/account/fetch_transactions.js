/**
 * $ node account/fetch_transactions.js PUBLIC_KEY
 */
const {
  PublicAccount,
  NetworkType,
  AccountHttp
} = require('nem2-sdk');
const {
  forkJoin
} = require('rxjs');
const {
  map
} = require('rxjs/operators');

const url = process.env.API_URL || 'http://localhost:3000';
const publicAccount = PublicAccount.createFromPublicKey(process.argv[2], NetworkType.MIJIN_TEST);
const accountHttp = new AccountHttp(url);

forkJoin([
  accountHttp.incomingTransactions(publicAccount),
  accountHttp.outgoingTransactions(publicAccount),
  accountHttp.unconfirmedTransactions(publicAccount)
]).pipe(
  map(results => {
    const [ incomings, outgoings, unconfirmed ] = results;
    return { incomings, outgoings, unconfirmed };
  })
).subscribe(
  data => console.log(data)
);
