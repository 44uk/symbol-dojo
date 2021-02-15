/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  AggregateTransaction,
  TransactionSearchCriteria,
  CosignatureTransaction,
  EmptyMessage,
  HashLockTransaction,
  PlainMessage,
  TransferTransaction,
  UInt64,
  TransactionGroup,
  TransactionType,
  Transaction,
} from "symbol-sdk"

import { env } from '../util/env'
import { prettyPrint } from '../util/print'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline } from '../util'
import { EmptyError, from, of } from "rxjs"
import { first, map, mergeMap, tap } from "rxjs/operators"
import { Signer } from "crypto"

async function main(props: INetworkStaticProps) {
  const deadline = createDeadline(props.epochAdjustment)

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)
  const aliceAccount = Account.createFromPrivateKey(env.ALICE_KEY, props.networkType)

  // メッセージオブジェクトを作成
  const message = PlainMessage.create("Hi, Alice. Pay my money back!")

  const fromCreditor = TransferTransaction.create(
    deadline(),
    aliceAccount.address,
    [],
    message,
    props.networkType
  ).setMaxFee(props.minFeeMultiplier)

  const xymMosaic = props.currency.createRelative(100)
  const fromDebtor = TransferTransaction.create(
    deadline(),
    initiatorAccount.address,
    [ xymMosaic ],
    EmptyMessage,
    props.networkType
  ).setMaxFee(props.minFeeMultiplier)

  const aggregateTx = AggregateTransaction.createBonded(
    deadline(),
    [ fromCreditor.toAggregate(initiatorAccount.publicAccount),
      fromDebtor.toAggregate(aliceAccount.publicAccount) ],
    props.networkType
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 1)

  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)

  consola.info('announce: %s, signer: %s, maxFee: %d',
    signedTx.hash,
    signedTx.getSignerAddress().plain(),
    aggregateTx.maxFee
  )
  consola.info('%s/transactionStatus/%s', props.url, signedTx.hash)

  const hashLockTx = HashLockTransaction.create(
    deadline(),
    props.currency.createRelative(10),
    UInt64.fromUint(300), // 300ブロック=およそ5分
    signedTx,
    props.networkType
  ).setMaxFee(props.minFeeMultiplier)

  const signedHLTx = initiatorAccount.sign(hashLockTx, props.generationHash)
  consola.info('announce: %s, signer: %s, maxFee: %d',
    signedHLTx.hash,
    signedHLTx.getSignerAddress().plain(),
    hashLockTx.maxFee
  )
  consola.info('%s/transactionStatus/%s', props.url, signedHLTx.hash)

  const announceUtil = createAnnounceUtil(props.factory)

  announceUtil.announce(signedTx, signedHLTx)
    .pipe(
      // map(aggregateTx)
    )
    .subscribe(
      resp => {
        prettyPrint(resp)
        consola.success('%s/transactions/confirmed/%s', props.url, signedTx.hash)
        whenPartial(props, aliceAccount)
      },
      error => {
        consola.error(error)
      }
    )
}

function whenPartial(props: INetworkStaticProps, cosigner: Account) {
  const announceUtil = createAnnounceUtil(props.factory)

  props.factory.createTransactionRepository().search({
    type: [ TransactionType.AGGREGATE_BONDED ],
    group: TransactionGroup.Partial,
    address: cosigner.address,
  })
    .pipe(
      mergeMap(results => from(results.data)),
      map(tx => CosignatureTransaction.create(tx as AggregateTransaction)),
      map(cosignTx => cosigner.signCosignatureTransaction(cosignTx)),
      mergeMap(signedCoTx => announceUtil.cosign(signedCoTx)),
    )
    .subscribe(
      resp => prettyPrint(resp)
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
