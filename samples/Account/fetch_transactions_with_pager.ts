/**
 * $ ts-node account/fetch_transactions_with_params.ts ADDRESS
 */
import {
  AccountHttp,
  Address,
  QueryParams,
  Transaction,
} from "symbol-sdk"
import {
  forkJoin
} from "rxjs"
import {
  map, last
} from "rxjs/operators"
import { env } from "../util/env"
import { Pager } from "../util"

export class OutgoingTransactionsPager extends Pager<Transaction[]> {
  private readonly resource: AccountHttp
  private readonly address: Address
  private params: QueryParams

  constructor(source: AccountHttp, address: Address, params: QueryParams) {
    super()
    this.resource = source
    this.address = address
    this.params = params
      consola.debug(this.params)
  }

  public nextPage() {
    this.resource.getAccountOutgoingTransactions(this.address, this.params).subscribe(next => {
      consola.debug(this.params)
      consola.debug(next.length)
      if (next.length != 0) {
        const last = next[next.length - 1]
        // @ts-ignore
        this.params = { ...this.params, id: last.transactionInfo.id }
        consola.debug(this.params)
        this.next(next)
      } else {
        this.complete()
      }
    }, error => {
      this.error(error)
    })
  }
}



const url = env.API_URL
const accountHttp = new AccountHttp(url)
const address = Address.createFromRawAddress(process.argv[2])
const params = new QueryParams(11)

const pager = new OutgoingTransactionsPager(accountHttp, address, params)

pager
  .subscribe(
    resp => consola.info("")
  )

// forkJoin([
//   accountHttp.getAccountUnconfirmedTransactions(address),
//   accountHttp.getAccountIncomingTransactions(address),
//   accountHttp.getAccountOutgoingTransactions(address)
// ]).pipe(
//   map(results => {
//     const [ unconfirmed, incomings, outgoings ] = results
//     return { unconfirmed, incomings, outgoings }
//   })
// ).subscribe(
//   resp => consola.info(resp)
// )
