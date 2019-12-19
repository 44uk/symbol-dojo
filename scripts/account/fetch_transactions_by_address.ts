/**
 * $ node account/fetch_transactions_by_address.js ADDRESS
 */
import {
  Address,
  AccountHttp,
} from "nem2-sdk"
import {
  of,
  forkJoin
} from "rxjs"
import {
  map,
  mergeMap
} from "rxjs/operators"
import { env } from "../util/env"

const url = env.API_URL
const address = Address.createFromRawAddress(process.argv[2])
const accountHttp = new AccountHttp(url)

accountHttp.getAccountInfo(address).pipe(
  mergeMap(accountInfo => {
    let observers = []
    if(address.equals(accountInfo.address)) {
      observers = [
        accountHttp.incomingTransactions(accountInfo.publicAccount.address),
        accountHttp.outgoingTransactions(accountInfo.publicAccount.address),
        accountHttp.unconfirmedTransactions(accountInfo.publicAccount.address),
      ]
    } else {
      observers = [
        of([]),
        of([]),
        of([]),
      ]
    }
    return forkJoin([of(accountInfo)].concat(observers))
  }),
  map(results => {
    const [ account, incomings, outgoings, unconfirmed ] = results
    return { account, incomings, outgoings, unconfirmed }
  })
).subscribe(
  data => console.log(data)
)
