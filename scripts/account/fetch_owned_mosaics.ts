/**
 * $ ts-node account/fetch_owned_mosaics.ts ADDRESS
 */
import {
  Account,
  Address,
  AccountHttp,
  MosaicHttp,
  MosaicService
} from "symbol-sdk"
import {
  mergeMap,
  toArray
} from "rxjs/operators"
import { env } from "../util/env"

const url = env.API_URL

let address: Address
if(env.INITIATOR_KEY) {
  const initiator = Account.createFromPrivateKey(
    env.INITIATOR_KEY,
    env.NETWORK_TYPE
  )
  address = initiator.address
} else {
  address = Address.createFromRawAddress(process.argv[2])
}

const accountHttp = new AccountHttp(url)
const mosaicHttp = new MosaicHttp(url)
const mosaicService = new MosaicService(accountHttp, mosaicHttp)

// アカウントが保有するモザイクを取得する
mosaicService.mosaicsAmountViewFromAddress(address)
  .pipe(
    mergeMap(_ => _),
    toArray()
  )
  .subscribe(mosaicAmountViews => {
    consola.info("%o", mosaicAmountViews)
  })

