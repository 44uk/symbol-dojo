/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  Address,
  AggregateTransaction,
  PlainMessage,
  TransferTransaction,
} from "symbol-sdk"

import { env } from '../util/env'
import { printTx } from "../util/print"
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline } from '../util'

async function main(props: INetworkStaticProps) {
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

  const xymMosaic = props.currency.createRelative(1)

  // 送信するモザイク配列
  const mosaics = [ xymMosaic ]

  // メッセージオブジェクトを作成
  const message = PlainMessage.create("Thank you for your kindness!")

  const transferTxes = recipients.map(recipient => TransferTransaction.create(
    deadline(),
    recipient,
    mosaics,
    message,
    props.networkType
  ))

  const aggregateTx = AggregateTransaction.createComplete(
    deadline(),
    transferTxes.map(tx => tx.toAggregate(initiatorAccount.publicAccount)),
    props.networkType,
    [],
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 0)

  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)

  consola.info('announce: %s, signer: %s, maxFee: %d',
    signedTx.hash,
    signedTx.getSignerAddress().plain(),
    aggregateTx.maxFee
  )
  consola.info('%s/transactionStatus/%s', props.url, signedTx.hash)
  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil(signedTx)
    .subscribe(
      resp => {
        printTx(resp)
        consola.success('%s/transactions/confirmed/%s', props.url, signedTx.hash)
      },
      error => {
        consola.error(error)
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
