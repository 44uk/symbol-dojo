/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  Address,
  Currency,
  PlainMessage,
  TransferTransaction,
  Deadline,
} from "symbol-sdk"
import { env } from "../util/env"

import * as util from "../util/util"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

// アドレス文字列からアドレスオブジェクトを作る
const recipient = Address.createFromRawAddress(process.argv[2])
const amount = parseInt(process.argv[3]) || 0

// 確認用の情報を出力
consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Recipient: %s", recipient.pretty())
consola.info("Endpoint:  %s/account/%s", url, recipient.plain())
consola.info("")

// 送信するモザイク配列
// ここでは`NetworkCurrencyMosaic`すなわち`nem.xem`モザイクオブジェクトを準備
// モザイクIDで作る場合は以下のようにする。
// 可分性の情報が無いので、量は絶対値で指定する必要がある。
// const mosaics = [new Mosaic(new MosaicId("__MOSAIC_ID__"), UInt64.fromUint(absoluteAmount))]
// const mosaics = [NetworkCurrencyMosaic.createRelative(amount)]
const mosaics = [Currency.PUBLIC.createRelative(amount)]

// メッセージオブジェクトを作成
// 空メッセージを送る場合は、空文字を渡しても良いですが、`EmptyMessage`クラスも用意されています。
const message = PlainMessage.create("Hello!")

// トランザクションオブジェクトを作成
// Deadline.create() デフォルトでは2時間。引数の単位は`時間`です。(第二引数で単位を変えられる)
// 仕様では24時間より大きくできないとされているので、`24`を渡すとエラーになります。
// Deadline.create(1439, jsJoda.ChronoUnit.MINUTES) // ex) 23時間59分
const transferTx = TransferTransaction.create(
  Deadline.create(env.EPOCH_ADJUSTMENT, 23),
  recipient,
  mosaics,
  message,
  env.NETWORK_TYPE,
).setMaxFee(300)

// 最大手数料とは、トランザクションに対して支払うことができる最大の手数料をさします。
// ネットワークの混雑具合で増減するため、ブロックに取り込まれるまでは実際の手数料は確定しません。
// 最小手数料は、トランザクションのバイトサイズ*FeeMultiplierで算出されます。
// この手数料以上を指定しなければ支払わなければブロックは取り込まれません。
consola.info("TxByteSize: %d", transferTx.size)
consola.info("")

// `setMaxFee`メソッドは`FeeMultiplier`を引数に受け取り、
// トランザクションバイトサイズと乗算され、手数料が設定済みのトランザクションオブジェクトを返却します。
// つまり、渡したFeeMultiplierに置いて、最小の手数料が設定されます。
// const feeSetTx = transferTx.setMaxFee(100)

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
