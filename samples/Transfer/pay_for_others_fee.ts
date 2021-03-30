/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  AggregateTransaction,
  CosignatureSignedTransaction,
  CosignatureTransaction,
  EmptyMessage,
  PlainMessage,
  SignedTransaction,
  TransactionMapping,
  TransactionType,
  TransferTransaction,
} from "symbol-sdk"

import { env } from '../util/env'
import { prettyPrint } from '../util/print'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline, txPrinter } from '../util'

async function main(props: INetworkStaticProps) {
  const txPrint = txPrinter(props.url)
  const deadline = createDeadline(props.epochAdjustment)

  const providerAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)

  const aliceAccount = Account.createFromPrivateKey(env.ALICE_KEY, props.networkType)
  const bobAccount   = Account.createFromPrivateKey(env.BOB_KEY  , props.networkType)

  // on Alice side ------------------------------------------------

  const messageTx = TransferTransaction.create(
    deadline(),
    bobAccount.address,
    [],
    PlainMessage.create("A message from Alice to Bob signed by the Provider."),
    props.networkType
  ).toAggregate(aliceAccount.publicAccount)

  // Webシステムへ送信する
  const serializedTx = messageTx.serialize()


  // on Provider side ------------------------------------------------

  // HTTPリクエストで受信した想定
  const requestedTx = TransactionMapping.createFromPayload(serializedTx)

  // 署名するトランザクションがないと `Failure_Aggregate_Ineligible_Cosignatories` となってしまう。
  const dummyTx = TransferTransaction.create(
    deadline(),
    providerAccount.address,
    [],
    EmptyMessage,
    props.networkType,
  ).toAggregate(providerAccount.publicAccount)

  const aggregateTx = AggregateTransaction.createComplete(
    deadline(),
    [ requestedTx, dummyTx ],
    props.networkType,
    [],
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 1)

  // 一度レスポンスとして返却する
  const { payload: signedTxPayload } = providerAccount.sign(aggregateTx, props.generationHash)


  // on Alice side ------------------------------------------------

  const compositedTx = TransactionMapping.createFromPayload(signedTxPayload) as AggregateTransaction
  const originalTx = compositedTx.innerTransactions
    .find(tx => tx.type === messageTx.type)
    // TODO: createFromPayloadで作られるトランザクションで失われている情報があり一致しない。
    // TODO: バグなのか、やり方が間違っているのか要調査
    // .find(tx => tx.serialize() === messageTx.serialize())
  // console.log('%s', originalTx!.serialize())
  // console.log('%s', messageTx.serialize())

  // TODO: ここで自分がリクエストしたトランザクションと一致することは必ず確認しなければならない。
  if(! originalTx) {
    throw new Error('It might be tampered your transaction.')
  }

  const signedCoTx = CosignatureTransaction.signTransactionPayload(
    aliceAccount,
    signedTxPayload,
    props.generationHash
  )

  const serializedCoTx = JSON.stringify(signedCoTx)


  // on Provider side ------------------------------------------------

  const parsedCoTxDTO = JSON.parse(serializedCoTx)
  const restoredCoTx = new CosignatureSignedTransaction(
    parsedCoTxDTO.parentHash,
    parsedCoTxDTO.signature,
    parsedCoTxDTO.signerPublicKey
  )

  const signedTx = providerAccount.signTransactionGivenSignatures(
    aggregateTx,
    [ restoredCoTx ],
    props.generationHash
  )

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
  .catch(error => consola.error(error))
