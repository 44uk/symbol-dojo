/**
 * $ node transfer/create_mosaic_transfer_by_named_mosaic.js RECIPIENT NAMESPACE AMOUNT
 */
import {
  Account,
  NetworkType,
  Address,
  NamespaceHttp,
  NamespaceId,
  Mosaic,
  PlainMessage,
  TransferTransaction,
  UInt64,
  Deadline
} from "nem2-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  env.NETWORK_TYPE
)
const nsHttp = new NamespaceHttp(url)

// アドレスオブジェクトの代わりにリンクされているネームスペースIDオブジェクトを使う
const recipient = Address.createFromRawAddress(process.argv[2])
const nsId = new NamespaceId(process.argv[3])
const amount = parseInt(process.argv[4]) || 0

nsHttp.getLinkedMosaicId(nsId)
  .subscribe(
    mosaicId => {
      console.log("Initiator: %s", initiator.address.pretty())
      console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
      console.log("Recipient: %s", recipient.pretty())
      console.log("Endpoint:  %s/account/%s", url, recipient.plain())
      console.log("MosaicId:  %s", mosaicId.toHex())
      console.log("Endpoint:  %s/mosaic/%s", url, mosaicId.toHex())
      console.log("")

      // MosaicIdには直接NamespaceIdオブジェクトを渡せます。
      // 一度モザイクIDを引いているのはモザイクIDを表示するためです。
      const transferTx = TransferTransaction.create(
        Deadline.create(),
        recipient,
        [new Mosaic(nsId, UInt64.fromUint(amount))],
        PlainMessage.create(`Send ${mosaicId.toHex()} by ${nsId.fullName}`),
        env.NETWORK_TYPE,
        UInt64.fromUint(50000)
      )

      const signedTx = initiator.sign(transferTx, env.GENERATION_HASH)

      util.listener(url, initiator.address, {
        onOpen: () => {
          util.announce(url, signedTx)
        },
        onConfirmed: (listener) => listener.close()
      })
    },
    error => console.error("Error: ", error)
  )

