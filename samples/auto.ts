/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 10
 */
import {
  Account,
  Address,
  NetworkCurrencyMosaic,
  PlainMessage,
  TransferTransaction,
  Deadline,
  NetworkType
} from "symbol-sdk"
import * as util from "./util/util"


/*
1ブロックに30Tx投げ込むとして、



/*






if(env.INITIATOR_KEY === undefined) {
  throw new Error("You need to be set env variable PRIVATE_KEY")
}
if(env.GENERATION_HASH === undefined) {
  throw new Error("You need to be set env variable GENERATION_HASH")
}

const url: string = env.API_URL
// 秘密鍵からアカウントオブジェクトを作る
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

// アドレス文字列からアドレスオブジェクトを作る
const recipient = Address.createFromRawAddress(process.argv[2])
const amount = parseInt(process.argv[3] || "0")

// 確認用の情報を出力
console.log("Initiator: %s", initiator.address.pretty())
console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
console.log("Recipient: %s", recipient.pretty())
console.log("Endpoint:  %s/account/%s", url, recipient.plain())
console.log("")

// 送信するモザイク配列
// ここでは`NetworkCurrencyMosaic`すなわち`nem.xem`モザイクオブジェクトを準備
// モザイクIDで作る場合は以下のようにする。
// 可分性がわからないので送信量は絶対値で指定する必要がある。
// const mosaics = [new Mosaic(new MosaicId("__MOSAIC_ID__"), UInt64.fromUint(absoluteAmount))]
const mosaics = [NetworkCurrencyMosaic.createRelative(amount)]

// メッセージオブジェクトを作成
// 空メッセージを送る場合は EmptyMessage を使います。
const message = PlainMessage.create("Ticket fee")

// トランザクションオブジェクトを作成
// Deadline.create() デフォルトでは2時間。引数の単位は`時間`です。(第二引数で単位を変えられる)
// SDKでは最大24時間未満とされているので、`24`を渡すとエラーになります。
// Deadline.create(1439, jsJoda.ChronoUnit.MINUTES) // ex) 23時間59分
const transferTx = TransferTransaction.create(
  Deadline.create(23),
  recipient,
  mosaics,
  message,
  env.NETWORK_TYPE
)

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
