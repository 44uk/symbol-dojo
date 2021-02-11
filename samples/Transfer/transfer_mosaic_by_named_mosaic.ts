/**
 * $ ts-node transfer/create_mosaic_transfer_by_named_mosaic.ts RECIPIENT_NAMESPACE AMOUNT
 */
import {
  Account,
  Address,
  NamespaceHttp,
  NamespaceId,
  Mosaic,
  PlainMessage,
  TransferTransaction,
  UInt64,
  Deadline
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)
const nsHttp = new NamespaceHttp(url)

// アドレスオブジェクトの代わりにリンクされているネームスペースIDオブジェクトを使う
const recipient = Address.createFromRawAddress(process.argv[2])
const nsId = new NamespaceId(process.argv[3])
const amount = parseInt(process.argv[4]) || 0

nsHttp.getLinkedMosaicId(nsId).subscribe(
  linkedMosaicId => {
    consola.info("Initiator: %s", initiator.address.pretty())
    consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
    consola.info("Recipient: %s", recipient.pretty())
    consola.info("Endpoint:  %s/account/%s", url, recipient.plain())
    consola.info("MosaicId:  %s", linkedMosaicId.toHex())
    consola.info("Endpoint:  %s/mosaic/%s", url, linkedMosaicId.toHex())
    consola.info("")

    // MosaicIdには直接NamespaceIdオブジェクトを渡せます。
    // 一度モザイクIDを引いているのはモザイクIDを表示するためです。
    const transferTx = TransferTransaction.create(
      Deadline.create(),
      recipient,
      [new Mosaic(nsId, UInt64.fromUint(amount))],
      PlainMessage.create(`Send ${linkedMosaicId.toHex()} by ${nsId.fullName}`),
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
  error => consola.error("Error: ", error)
)

