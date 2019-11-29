/**
 * $ node account/fetch_transactions.js PUBLIC_KEY
 */
import {
  PublicAccount,
  NetworkType,
  AccountHttp,
  QueryParams,
  Order
} from 'nem2-sdk'
import {
  forkJoin
} from 'rxjs'
import {
  map
} from 'rxjs/operators'
import { env } from '../env'

const url = env.API_URL || 'http://localhost:3000'
const publicAccount = PublicAccount.createFromPublicKey(process.argv[2], NetworkType.MIJIN_TEST)
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
