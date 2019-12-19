/**
 * $ node transfer/create_mosaic_transfer_by_named_address.js RECIPIENT_NAMESPACE NAMESPACE 10
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
const nsId = new NamespaceId(process.argv[2])
const amount = parseInt(process.argv[3]) || 0

nsHttp.getLinkedAddress(nsId).subscribe(
  address => {
    console.log("Initiator: %s", initiator.address.pretty())
    console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
    console.log("Namespace: %s", nsId.fullName)
    console.log("Recipient: %s", address.pretty())
    console.log("Endpoint:  %s/account/%s", url, address.plain())
    console.log("")

    // recipientには直接NamespaceIdオブジェクトを渡せます。
    // 一度アドレスを引いているのは宛先アドレスを表示するためです。
    const transferTx = TransferTransaction.create(
      Deadline.create(),
      nsId,
      [NetworkCurrencyMosaic.createRelative(amount)],
      PlainMessage.create(`Send to ${address.pretty()} by ${nsId.fullName}`),
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
