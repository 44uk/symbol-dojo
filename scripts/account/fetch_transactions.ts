/**
 * $ node account/fetch_transactions.js PUBLIC_KEY
 */
import {
  PublicAccount,
  NetworkType,
  AccountHttp,
  QueryParams,
  Order
} from "nem2-sdk"
import {
  forkJoin
} from "rxjs"
import {
  map
} from "rxjs/operators"
import { env } from "../util/env"

const url = env.API_URL
const publicAccount = PublicAccount.createFromPublicKey(process.argv[2], env.NETWORK_TYPE)
const accountHttp = new AccountHttp(url)

const queryParams = new QueryParams(10, undefined, Order.ASC)

forkJoin([
  accountHttp.incomingTransactions(publicAccount.address, queryParams),
  accountHttp.outgoingTransactions(publicAccount.address),
  accountHttp.unconfirmedTransactions(publicAccount.address)
]).pipe(
  map(results => {
    const [ incomings, outgoings, unconfirmed ] = results
    return { incomings, outgoings, unconfirmed }
  })
).subscribe(
  data => console.log(data)
)
