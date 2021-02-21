/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  Address,
  PlainMessage,
  TransferTransaction,
} from "symbol-sdk"

import { env } from '../util/env'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline, prettyPrint, txPrinter } from '../util'

async function main(props: INetworkStaticProps) {
  const txPrint = txPrinter(props.url)
  const deadline = createDeadline(props.epochAdjustment)

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)

  const aliceAccount = Account.createFromPrivateKey(env.ALICE_KEY, props.networkType)
  const aliceAddress = aliceAccount.address.pretty()

  // アドレス文字列からアドレスオブジェクトを作る
  const recipient = Address.createFromRawAddress(aliceAddress)
  // 送信するモザイクオブジェクトを作る
  const xymMosaic = props.currency.createRelative(100)

  // 確認用にアカウントの情報を出力
  consola.info("Initiator: %s", initiatorAccount.address.pretty())
  consola.info("Endpoint:  %s/accounts/%s", props.url, initiatorAccount.address.plain())
  consola.info("Recipient: %s", recipient.pretty())
  consola.info("Endpoint:  %s/accounts/%s", props.url, recipient.plain())
  consola.info("")

  // 送信するモザイク配列
  const mosaics = [ xymMosaic ]

  // メッセージオブジェクトを作成
  const message = PlainMessage.create("Hello!")

  // トランザクションオブジェクトを作成
  // Deadline.create() デフォルトでは2時間。引数の単位は`時間`です。(第二引数で単位を変えられる)
  // 仕様では24時間より大きくできないとされているので、`24`を渡すとエラーになります。
  // Deadline.create(1439, jsJoda.ChronoUnit.MINUTES) // ex) 23時間59分
  const transferTx = TransferTransaction.create(
    deadline(),
    recipient,
    mosaics,
    message,
    props.networkType
  ).setMaxFee(props.minFeeMultiplier)

  // 最大手数料とは、トランザクションに対して支払うことができる最大の手数料をさします。
  // ネットワークの混雑具合で増減するため、ブロックに取り込まれるまでは実際の手数料は確定しません。
  // 最小手数料は、トランザクションの `トランザクションバイトサイズ * ネットワークの最小手数料乗数` で算出されます。
  // この手数料以上を指定しなければ支払わなければブロックは取り込まれません。
  // 最小手数料は `transferTx.size * props.minFeeMultiplier` で算出できます。
  // オブジェクト作成時点では `size` メソッドを叩けないため、
  // `setMaxFee` はそのオブジェクトのサイズに引数で渡した `Multipler` を乗じた手数料をセットしたオブジェクトを返却します。
  consola.info("%d(TxByteSize) * %d(FeeMul) = %d(MaxFee) (%s:%d)",
    transferTx.size,
    props.minFeeMultiplier,
    transferTx.maxFee,
    props.currency.namespaceId?.fullName,
    transferTx.maxFee.compact() / Math.pow(10, props.currency.divisibility)
  )
  consola.info("")

  // `setMaxFee`メソッドは`FeeMultiplier`を引数に受け取り、
  // トランザクションバイトサイズと乗算され、手数料が設定済みのトランザクションオブジェクトを返却します。
  // つまり、渡したFeeMultiplierにおいて、最小の手数料が設定されます。
  // const feeSetTx = transferTx.setMaxFee(100)

  // トランザクションに署名をする
  const signedTx = initiatorAccount.sign(transferTx, props.generationHash)

  txPrint.info(signedTx)
  txPrint.status(signedTx)
  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil.announce(signedTx)
    .subscribe(
      resp => {
        txPrint.url(signedTx)
        prettyPrint(resp)
      },
      error => {
        consola.error(error)
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
