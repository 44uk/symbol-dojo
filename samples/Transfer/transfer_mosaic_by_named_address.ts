/**
 * $ ts-node transfer/create_mosaic_transfer_by_named_address.ts RECIPIENT_NAMESPACE AMOUNT
 */
import {
  Account,
  NetworkCurrencyMosaic,
  NamespaceHttp,
  NamespaceId,
  PlainMessage,
  TransferTransaction,
  Deadline,
  UInt64
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
const nsId = new NamespaceId(process.argv[2])
const amount = parseInt(process.argv[3]) || 0

nsHttp.getLinkedAddress(nsId).subscribe(
  linkedAddress => {
    consola.info("Initiator: %s", initiator.address.pretty())
    consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
    consola.info("Namespace: %s", nsId.fullName)
    consola.info("Recipient: %s", linkedAddress.pretty())
    consola.info("Endpoint:  %s/account/%s", url, linkedAddress.plain())
    consola.info("")

    // `recipient`には直接`NamespaceId`オブジェクトを渡せます。
    // 一度アドレスを引いているのは宛先アドレスを表示するためです。
    const transferTx = TransferTransaction.create(
      Deadline.create(),
      nsId,
      [NetworkCurrencyMosaic.createRelative(amount)],
      PlainMessage.create(`Send to ${linkedAddress.pretty()} by ${nsId.fullName}`),
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
