/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  MultisigAccountModificationTransaction,
  AggregateTransaction,
  HashLockTransaction,
  UInt64
} from "symbol-sdk"
import { mergeMap, tap } from "rxjs/operators"

import { env } from '../util/env'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { cosignBondedWithAccount } from "../util/helper"
import { createDeadline, prettyPrint, txPrinter } from '../util'

async function main(props: INetworkStaticProps) {
  const txPrint = txPrinter(props.url)
  const deadline = createDeadline(props.epochAdjustment)

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)
  const aliceAccount = Account.createFromPrivateKey(env.ALICE_KEY, props.networkType)

  const frankAccount = Account.createFromPrivateKey(env.FRANK_KEY, props.networkType)

  const minApprovalDelta = 1 // トランザクションの発信には1人の承認が必要
  const minRemovalDelta  = 2 // 連署者を外すには2人に承認が必要
  const cosignerAddresses = [
    initiatorAccount.address,
    aliceAccount.address,
  ]

  const convertIntoMultisigTx = MultisigAccountModificationTransaction.create(
    deadline(),
    minApprovalDelta,
    minRemovalDelta,
    cosignerAddresses,
    [],
    props.networkType
  )

// 実際はAggregateTransaction.createBondedメソッドを使い連署アカウントに署名を求める。
// 今回は連署アカウントの秘密鍵がわかっているのでそれらを利用して署名してしまう。
  const aggregateTx = AggregateTransaction.createBonded(
    deadline(),
    [ convertIntoMultisigTx.toAggregate(frankAccount.publicAccount) ],
    props.networkType
  ).setMaxFeeForAggregate(props.networkType, cosignerAddresses.length)

  const signedTx = frankAccount.sign(aggregateTx, props.generationHash)
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

  const signedHLTx = initiatorAccount.sign(hashLockTx, props.generationHash)
  txPrint.info(signedHLTx)
  txPrint.status(signedHLTx)

  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil.announce(signedTx, signedHLTx)
    .pipe(
      tap(() => txPrint.url(signedHLTx)),
      mergeMap(() => {
        return cosignBondedWithAccount(props, initiatorAccount)
      }),
      mergeMap(() => {
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
