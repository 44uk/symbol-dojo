/**
 */
import consola from 'consola'
import {
  Account,
  AggregateTransaction,
  Deadline,
  KeyGenerator,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicNonce,
  MosaicRestrictionTransactionService,
  MosaicRestrictionType,
  MosaicService,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  UInt64,
} from 'symbol-sdk'

import { env } from '../util/env'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'

async function main(props: INetworkStaticProps) {
  const deadline = (hour = 2) => Deadline.create(props.epochAdjustment, hour)

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)

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

  const delta = 1000000
  const mosaicSupplyChangeTx = MosaicSupplyChangeTransaction.create(
    deadline(),
    mosaicDefinitionTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(delta * Math.pow(10, divisibility)),
    props.networkType,
  )

  const mosaicService = new MosaicService(
    props.factory.createAccountRepository(),
    props.factory.createMosaicRepository(),
  )

  const aggregateTx = AggregateTransaction.createComplete(
    deadline(),
    [ mosaicDefinitionTx,
      mosaicSupplyChangeTx ].map(tx => tx.toAggregate(initiatorAccount.publicAccount)),
    props.networkType,
    [],
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 0)

  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)

  const announceUtil = createAnnounceUtil(props.factory)

  consola.info('announce: %s, signer: %s',
    signedTx.hash,
    signedTx.getSignerAddress().plain(),
  )

  announceUtil(signedTx)
    .subscribe(
      resp => {
        consola.info('confirmed: %s, height: %d',
          resp.transactionInfo?.hash,
          resp.transactionInfo?.height.compact(),
        )
        consola.info('%s/transactions/confirmed/%s', props.url, signedTx.hash)
        consola.info('%s/transactionStatus/%s', props.url, signedTx.hash)
      },
      resp => {
        consola.info(resp)
        // consola.info('error: %s, address: %s, ',
        //   resp.address.plain(),
        //   resp.code
        // )
        consola.info('%s/transactionStatus/%s', props.url, signedTx.hash)
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
