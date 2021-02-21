/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  EmptyMessage,
  PlainMessage,
  AggregateTransaction,
  HashLockTransaction,
  TransferTransaction,
  UInt64,
} from "symbol-sdk"
import { mergeMap } from "rxjs/operators"

import { env } from '../util/env'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline, txPrinter } from '../util'
import { cosignBondedWithAccount } from "../util/helper"

async function main(props: INetworkStaticProps) {
  const txPrint = txPrinter(props.url)
  const deadline = createDeadline(props.epochAdjustment)

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)
  const aliceAccount = Account.createFromPrivateKey(env.ALICE_KEY, props.networkType)

  // Alice 宛のメッセージ付きトランザクションを生成
  const message = PlainMessage.create("Hi, Alice. Pay my money back!")
  const fromCreditor = TransferTransaction.create(
    deadline(),
    aliceAccount.address,
    [],
    message,
    props.networkType
  )

  // Initiator 宛の転送トランザクションを生成
  const xymMosaic = props.currency.createRelative(100)
  const fromDebtor = TransferTransaction.create(
    deadline(),
    initiatorAccount.address,
    [ xymMosaic ],
    EmptyMessage,
    props.networkType
  )

  const aggregateTx = AggregateTransaction.createBonded(
    deadline(),
    [
      // 署名者は Initiator としてメッセージを送信する。
      fromCreditor.toAggregate(initiatorAccount.publicAccount),
      // 署名者は Alice として XYM を送信する。
      fromDebtor.toAggregate(aliceAccount.publicAccount)
    ],
    props.networkType
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 1)

  // Initiator が要求するシチュエーションのため、Initiator が署名する。
  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)
  txPrint.info(signedTx)
  txPrint.status(signedTx)

  // 他アカウントの署名を求めるアグリゲートボンデッドの場合は、
  // HashLock トランザクションが予め承認済みになっている必要がある。
  const hashLockTx = HashLockTransaction.create(
    deadline(),
    props.currency.createRelative(10),
    UInt64.fromUint(300), // 300ブロック=およそ5分
    signedTx,
    props.networkType
  ).setMaxFee(props.minFeeMultiplier)

  // 署名した人がロック分の 10 XYM を負担するが、このトランザクションは誰が署名してもよい。
  const signedHLTx = initiatorAccount.sign(hashLockTx, props.generationHash)
  txPrint.info(signedHLTx)
  txPrint.status(signedHLTx)

  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil.announce(signedTx, signedHLTx)
    .pipe(
      mergeMap(() => {
        txPrint.url(signedHLTx)
        return cosignBondedWithAccount(props, aliceAccount)
      })
    )
    .subscribe(
      resp => {
        txPrint.url(signedTx)
      },
      error => {
        consola.error(error)
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
