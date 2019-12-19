/**
 * $ node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import {
  Account,
  Address,
  NetworkCurrencyMosaic,
  PlainMessage,
  TransferTransaction,
  Deadline,
  UInt64,
  NetworkType,
} from "nem2-sdk"
import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
// 秘密鍵からアカウントオブジェクトを作る
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  env.NETWORK_TYPE
)

// アドレス文字列からアドレスオブジェクトを作る
const recipient = Address.createFromRawAddress(process.argv[2])
const amount = parseInt(process.argv[3]) || 0

// 確認用の情報を出力
console.log("Initiator: %s", initiator.address.pretty())
console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
console.log("Recipient: %s", recipient.pretty())
console.log("Endpoint:  %s/account/%s", url, recipient.plain())
console.log("")

// 送信するモザイク配列
// ここでは`NetworkCurrencyMosaic`すなわち`cat.currency`モザイクオブジェクトを準備
// モザイクIDで作る場合は以下のようにする。
// 可分性がわからないので送信量は絶対値で指定する必要がある。
// const mosaics = [new Mosaic(new MosaicId("__MOSAIC_ID__"), UInt64.fromUint(absoluteAmount))]
const mosaics = [NetworkCurrencyMosaic.createRelative(amount)]

// メッセージオブジェクトを作成
// 空メッセージを送る場合は EmptyMessage を使います。
const message = PlainMessage.create("Ticket fee")

// トランザクションオブジェクトを作成
// Deadline.create() デフォルトでは2時間。引数の単位は`時間`です。(第二引数で単位を変えられる)
// 仕様では24時間より大きくできないとされているので `24`を渡すとエラーになります。
// Deadline.create(1439, jsJoda.ChronoUnit.MINUTES) // ex) 23時間59分
const transferTx = TransferTransaction.create(
  Deadline.create(23),
  recipient,
  mosaics,
  message,
  env.NETWORK_TYPE,
  UInt64.fromUint(50000)
)

// 最大手数料とは、トランザクションに対して支払うことができる最大の手数料をさします。
// ネットワークの混雑具合で増減するため、ブロックに取り込まれるまでは実際の手数料は確定しません。
// 最小の手数料はバイトサイズ*FeeMultiplierで算出されます。
// 少なくともこの手数料を支払わなければブロックは取り込まれません。
console.log("TxByteSize: %d", transferTx.size)

// トランザクションに署名をする
const signedTx = initiator.sign(transferTx, env.GENERATION_HASH)

// トランザクション成功/失敗,未承認,承認のモニタリング接続
util.listener(url, initiator.address, {
  onOpen: () => {
    // 署名済みトランザクションを発信
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
