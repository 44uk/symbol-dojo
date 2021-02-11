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
  MosaicGlobalRestrictionTransaction,
  MosaicId,
  MosaicNonce,
  MosaicRestrictionTransactionService,
  MosaicRestrictionType,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  RepositoryFactoryHttp,
  UInt64,
} from 'symbol-sdk'
import { forkJoin, from } from 'rxjs'

import { env } from '../util/env'
import { createAnnounceUtil } from '../util/announce'

async function main() {
  const url = env.GATEWAY_URL
  const repoFactory = new RepositoryFactoryHttp(url)

  const props = await forkJoin({
    currencies: repoFactory.getCurrencies(),
    epochAdjustment: repoFactory.getEpochAdjustment(),
    generationHash: repoFactory.getGenerationHash(),
    networkType: repoFactory.getNetworkType(),
    nodePublicKey: repoFactory.getNodePublicKey(),
    transactionFees: repoFactory.createNetworkRepository().getTransactionFees().toPromise()
  }).toPromise()

  const deadline = (hour  = 2) => Deadline.create(props.epochAdjustment, hour)

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

  const key = KeyGenerator.generateUInt64Key('KYC'.toLowerCase())
  const mosaicGlobalRestrictionTx = MosaicGlobalRestrictionTransaction.create(
    deadline(),
    mosaicDefinitionTx.mosaicId,
    key,
    UInt64.fromUint(0),
    MosaicRestrictionType.NONE,
    UInt64.fromUint(1),
    MosaicRestrictionType.EQ,
    props.networkType
  )

  const mosaicRestrictionService = new MosaicRestrictionTransactionService(
    repoFactory.createRestrictionMosaicRepository(),
    repoFactory.createNamespaceRepository()
  )

  const mosaicGlobalRestrictionTx2 = await mosaicRestrictionService.createMosaicGlobalRestrictionTransaction(
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
      mosaicGlobalRestrictionTx2 ].map(tx => tx.toAggregate(initiatorAccount.publicAccount)),
    props.networkType,
    [],
  ).setMaxFeeForAggregate(props.transactionFees.minFeeMultiplier, 0)

  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)

  const announceUtil = createAnnounceUtil(repoFactory)

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
        consola.info('%s/transactions/confirmed/%s', env.GATEWAY_URL, signedTx.hash)
        consola.info('%s/transactionStatus/%s', env.GATEWAY_URL, signedTx.hash)
      },
      resp => {
        consola.info(resp)
        // consola.info('error: %s, address: %s, ',
        //   resp.address.plain(),
        //   resp.code
        // )
        consola.info('%s/transactionStatus/%s', env.GATEWAY_URL, signedTx.hash)
      }
    )
}

main()
