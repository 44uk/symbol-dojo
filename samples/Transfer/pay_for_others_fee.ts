/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  AggregateTransaction,
  CosignatureTransaction,
  EmptyMessage,
  PlainMessage,
  SignedTransaction,
  TransactionMapping,
  TransferTransaction,
} from "symbol-sdk"

import { env } from '../util/env'
import { prettyPrint } from '../util/print'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline, txPrinter } from '../util'

async function main(props: INetworkStaticProps) {
  const txPrint = txPrinter(props.url)
  const deadline = createDeadline(props.epochAdjustment)

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)
  const aliceAccount = Account.createFromPrivateKey(env.ALICE_KEY, props.networkType)
  const bobAccount = Account.createFromPrivateKey(env.BOB_KEY, props.networkType)

  const message = PlainMessage.create("A message from Alice to Bob.")

  const messageTx = TransferTransaction.create(
    deadline(),
    bobAccount.address,
    [], // [ new Mosaic(new MosaicId('3DFDD22B638FD112'), UInt64.fromUint(100)) ],
    message,
    props.networkType
  ).setMaxFee(props.minFeeMultiplier)

  // 署名するトランザクションがないと `Failure_Aggregate_Ineligible_Cosignatories` となってしまう。
  const dummyTx = TransferTransaction.create(
    deadline(),
    initiatorAccount.address,
    [], // [ props.currency.createAbsolute(messageTx.maxFee) ],
    EmptyMessage,
    props.networkType,
  )

  const aggregateTx = AggregateTransaction.createComplete(
    deadline(),
    [ messageTx.toAggregate(aliceAccount.publicAccount),
      dummyTx.toAggregate(initiatorAccount.publicAccount) ],
    props.networkType,
    [],
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 1)

  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)
  const signedTxDTO = signedTx.toDTO()

  // -------------------------------------------------------------------------------

  // DTO形式でデータを受け取ることを想定
  const restoredAggregateTx = TransactionMapping.createFromPayload(signedTxDTO.payload) as AggregateTransaction

  const signedCoTx = CosignatureTransaction.signTransactionPayload(
    aliceAccount,
    signedTxDTO.payload,
    props.generationHash
  )

  const collectedSignedTx = initiatorAccount.signTransactionGivenSignatures(
    restoredAggregateTx,
    [ signedCoTx ],
    props.generationHash
  )
  const collectedSignedTxDTO = collectedSignedTx.toDTO()

  // -------------------------------------------------------------------------------

  // DTO形式でデータを受け取ることを想定
  const restoredCollectionSignedTx = new SignedTransaction(
    collectedSignedTxDTO.payload,
    collectedSignedTxDTO.hash,
    collectedSignedTxDTO.signerPublicKey,
    collectedSignedTxDTO.type,
    collectedSignedTxDTO.networkType
  )

  txPrint.info(signedTx)
  txPrint.status(signedTx)
  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil.announce(restoredCollectionSignedTx)
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
