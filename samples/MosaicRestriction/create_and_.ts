/**
 */
import consola from 'consola'
import {
  Account,
  AggregateTransaction,
  KeyGenerator,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicNonce,
  MosaicRestrictionTransactionService,
  MosaicRestrictionType,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  UInt64,
} from 'symbol-sdk'

import { env } from '../util/env'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline } from '../util'

async function main(props: INetworkStaticProps) {
  const deadline = createDeadline(props.epochAdjustment)

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

  const mosaicRestrictionService = new MosaicRestrictionTransactionService(
    props.factory.createRestrictionMosaicRepository(),
    props.factory.createNamespaceRepository()
  )

  const key = KeyGenerator.generateUInt64Key('KYC'.toLowerCase())
  const mosaicGlobalRestrictionTx = await mosaicRestrictionService.createMosaicGlobalRestrictionTransaction(
    deadline(),
    props.networkType,
    mosaicDefinitionTx.mosaicId,
    key,
    '1',
    MosaicRestrictionType.EQ,
  ).toPromise()

  const aggregateTx = AggregateTransaction.createComplete(
    deadline(),
    [ mosaicDefinitionTx,
      mosaicSupplyChangeTx,
      mosaicGlobalRestrictionTx ].map(tx => tx.toAggregate(initiatorAccount.publicAccount)),
    props.networkType,
    [],
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 0)

  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)

  consola.info('announce: %s, signer: %s',
    signedTx.hash,
    signedTx.getSignerAddress().plain(),
  )
  consola.info('%s/transactionStatus/%s', props.url, signedTx.hash)
  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil(signedTx)
    .subscribe(
      resp => {
        consola.info('confirmed: %s, height: %d',
          resp.transactionInfo?.hash,
          resp.transactionInfo?.height.compact(),
        )
        consola.info('%s/transactions/confirmed/%s', props.url, signedTx.hash)
      },
      resp => {
        consola.error(resp)
        // consola.info('error: %s, address: %s, ',
        //   resp.address.plain(),
        //   resp.code
        // )
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
