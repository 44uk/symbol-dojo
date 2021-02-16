/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  AggregateTransaction,
  CosignatureTransaction,
  EmptyMessage,
  HashLockTransaction,
  Mosaic,
  MosaicId,
  PlainMessage,
  TransactionGroup,
  TransactionMapping,
  TransactionType,
  TransferTransaction,
  UInt64,
} from "symbol-sdk"

import { env } from '../util/env'
import { prettyPrint } from '../util/print'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline } from '../util'
import { map, mergeMap } from "rxjs/operators"
import { from } from "rxjs"

async function main(props: INetworkStaticProps) {
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

  const feeTransferTx = TransferTransaction.create(
    deadline(),
    aliceAccount.address,
    [], // [ props.currency.createAbsolute(messageTx.maxFee) ],
    EmptyMessage,
    props.networkType,
  )

  const aggregateTx = AggregateTransaction.createComplete(
    deadline(),
    [ feeTransferTx.toAggregate(initiatorAccount.publicAccount),
      messageTx.toAggregate(aliceAccount.publicAccount) ],
    props.networkType,
    [],
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 1)
  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)

  // -------------------------------------------------------------------------------

  const signedTxDTO = signedTx.toDTO()
  const signedCoTx = CosignatureTransaction.signTransactionPayload(
    aliceAccount,
    signedTxDTO.payload,
    props.generationHash
  )
  const restoredAggregateTx = TransactionMapping.createFromPayload(signedTxDTO.payload) as AggregateTransaction

  const collectedSignedTx = initiatorAccount.signTransactionGivenSignatures(
    restoredAggregateTx,
    [signedCoTx],
    props.generationHash
  )

  // -------------------------------------------------------------------------------

  consola.info('announce: %s, signer: %s, maxFee: %d',
    collectedSignedTx.hash,
    collectedSignedTx.getSignerAddress().plain(),
    aggregateTx.maxFee
  )
  consola.info('%s/transactionStatus/%s', props.url, signedTx.hash)

  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil.announce(collectedSignedTx)
    .subscribe(
      resp => {
        prettyPrint(resp)
        consola.success('%s/transactions/confirmed/%s', props.url, signedTx.hash)
      },
      error => {
        consola.error(error)
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
  .catch(error => consola.error(error))
