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
    [ new Mosaic(new MosaicId('3DFDD22B638FD112'), UInt64.fromUint(100)) ],
    message,
    props.networkType
  ).setMaxFee(props.minFeeMultiplier)

  const transferTx = TransferTransaction.create(
    deadline(),
    aliceAccount.address,
    [],
    //[ props.currency.createAbsolute(messageTx.maxFee) ],
    EmptyMessage,
    props.networkType,
  ) // .setMaxFee(props.minFeeMultiplier)

  const aggregateTx = AggregateTransaction.createBonded(
    deadline(),
    [ transferTx.toAggregate(initiatorAccount.publicAccount),
      messageTx.toAggregate(aliceAccount.publicAccount) ],
    props.networkType
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 1)

  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)

  consola.info('announce: %s, signer: %s, maxFee: %d',
    signedTx.hash,
    signedTx.getSignerAddress().plain(),
    transferTx.maxFee
  )
  consola.info('%s/transactionStatus/%s', props.url, signedTx.hash)

  const hashLockTx = HashLockTransaction.create(
    deadline(),
    props.currency.createRelative(10),
    UInt64.fromUint(300),
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

  listenConfirmed(props, initiatorAccount, aliceAccount)

  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil.announce(signedTx, signedHLTx)
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

function listenConfirmed(props: INetworkStaticProps, initiator: Account, cosigner: Account) {
  const listener = props.factory.createListener()

  listener.open()
    .then(() => {
      consola.success('Start listening to be confirmed')
      listener.cosignatureAdded(initiator.address)
        .subscribe(
          resp => console.debug('initiator confirmed')
        )
      listener.cosignatureAdded(cosigner.address)
        .subscribe(
          resp => console.debug('cosigner confirmed')
        )
    })
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
