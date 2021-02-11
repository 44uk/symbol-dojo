/**
 * $ ts-node account/fetch_transactions.ts ADDRESS
 */
import {
  AccountHttp,
  Address,
  QueryParams,
  Order,
  TransactionType
} from "symbol-sdk"
import {
  forkJoin
} from "rxjs"
import {
  map
} from "rxjs/operators"
import { env } from "../util/env"

const url = env.GATEWAT_URL
const address = Address.createFromRawAddress(process.argv[2])
const accountHttp = new AccountHttp(url)
const params = new QueryParams(
  20, // 取得件数 10 - 100 の指定が可能
  undefined, // 取得開始ID 取得するトランザクションの基準を指定
  Order.DESC, // 取得したトランザクションのID順序
  // TransactionType.TRANSFER // トランザクションタイプで絞り込む
)

forkJoin([
  accountHttp.getAccountUnconfirmedTransactions(address, params),
  accountHttp.getAccountIncomingTransactions(address, params),
  accountHttp.getAccountOutgoingTransactions(address, params)
]).pipe(
  map(results => {
    const [ unconfirmed, incomings, outgoings ] = results
    return { unconfirmed, incomings, outgoings }
  })
).subscribe(
  resp => consola.info(resp)
)
