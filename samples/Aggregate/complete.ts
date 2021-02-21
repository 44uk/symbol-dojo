/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  AggregateTransaction,
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
  const bobAccount   = Account.createFromPrivateKey(env.BOB_KEY  , props.networkType)
  const carolAccount = Account.createFromPrivateKey(env.CAROL_KEY, props.networkType)

  const recipients = [
    aliceAccount.address,
    bobAccount.address,
    carolAccount.address
  ]

  // 3つのアカウント向けの転送トランザクションを生成
  const xymMosaic = props.currency.createRelative(100)
  const transferTxes = recipients.map(recipient => TransferTransaction.create(
    deadline(),
    recipient,
    [ xymMosaic ],
    PlainMessage.create("Thank you for your kindness!"),
    props.networkType
  ))

  // 3つのトランザクションをアグリゲートコンプリートで集約
  // `toAggregate` にはそのトランザクションに署名すべきアカウントの公開アカウントを渡す
  const aggregateTx = AggregateTransaction.createComplete(
    deadline(),
    transferTxes.map(tx => tx.toAggregate(initiatorAccount.publicAccount)),
    props.networkType,
    [],
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 0)

  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)

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
