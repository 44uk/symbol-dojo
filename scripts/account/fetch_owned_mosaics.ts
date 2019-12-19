/**
 * $ node account/fetch_owned_mosaics.js ADDRESS
 */
import {
  Account,
  NetworkType,
  Address,
  AccountHttp,
  MosaicHttp,
  MosaicService
} from "nem2-sdk"
import {
  mergeMap,
  toArray
} from "rxjs/operators"
import { env } from "../util/env"

const url = env.API_URL

let address: Address
if(env.PRIVATE_KEY) {
  const initiator = Account.createFromPrivateKey(
    env.PRIVATE_KEY,
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
    console.log("%o", mosaicAmountViews)
  })

