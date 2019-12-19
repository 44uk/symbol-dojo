/**
 * $ node account/fetch_account_info_with_mosaics.js ADDRESS
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
  map,
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

// アカウント情報と保有モザイク情報を組み合わせる
accountHttp.getAccountInfo(address)
  .pipe(
    mergeMap(account => mosaicService.mosaicsAmountViewFromAddress(account.address)
      .pipe(
        mergeMap(_ => _),
        toArray(),
        map(mosaics => ({ account, mosaics }))
      ),
    )
  )
  .subscribe(accountInfoWithMosaicInfoView => {
    // getAccountInfoの情報
    console.log("%o", accountInfoWithMosaicInfoView.account)
    // mosaicsAmountViewFromAddressの情報
    console.log("%o", accountInfoWithMosaicInfoView.mosaics)
  })

