/**
 */
import consola from 'consola'
import {
  Account,
  AggregateTransaction,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicNonce,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  UInt64,
} from 'symbol-sdk'

import { env } from '../util/env'
import { createDeadline } from '../util'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'

async function main(props: INetworkStaticProps) {
  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)
  const deadline = createDeadline(props.epochAdjustment)

  const nonce = MosaicNonce.createRandom()
  const isSupplyMutable = true
  const isTransferable = true
  const isRestrictable = true
  const divisibility = 0
  const duration = UInt64.fromUint(1000)

  const mosaicDefinitionTx = MosaicDefinitionTransaction.create(
    deadline(),
    nonce,
    MosaicId.createFromNonce(nonce, initiatorAccount.address),
    MosaicFlags.create(isSupplyMutable, isTransferable, isRestrictable),
    divisibility,
    duration,
    props.networkType,
  )

  const delta = 1000000;
  const mosaicSupplyChangeTx = MosaicSupplyChangeTransaction.create(
    deadline(),
    mosaicDefinitionTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(delta * Math.pow(10, divisibility)),
    props.networkType,
  )

  const aggregateTx = AggregateTransaction.createComplete(
    deadline(),
    [ mosaicDefinitionTx,
      mosaicSupplyChangeTx ].map(tx => tx.toAggregate(initiatorAccount.publicAccount)),
    props.networkType,
    [],
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 0)

  consola.info(
    aggregateTx.cosignatures,
    aggregateTx.size
  )

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
        consola.success('confirmed: %s, height: %d',
          resp.transactionInfo?.hash,
          resp.transactionInfo?.height.compact(),
        )
        consola.success('%s/transactions/confirmed/%s', props.url, signedTx.hash)
      },
      error => {
        consola.error(error)
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
