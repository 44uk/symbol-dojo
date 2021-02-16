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
import { mergeMap, tap } from 'rxjs/operators'

async function main(props: INetworkStaticProps) {
  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)
  const deadline = createDeadline(props.epochAdjustment)

  const nonce = MosaicNonce.createRandom()
  const isSupplyMutable = true
  const isTransferable = true
  const isRestrictable = true
  const divisibility = 0
  const duration = UInt64.fromUint(1000)

  const definitionTx = MosaicDefinitionTransaction.create(
    deadline(),
    nonce,
    MosaicId.createFromNonce(nonce, initiatorAccount.address),
    MosaicFlags.create(isSupplyMutable, isTransferable, isRestrictable),
    divisibility,
    duration,
    props.networkType,
  ).setMaxFee(props.minFeeMultiplier) as MosaicDefinitionTransaction

  // supplyMutableがfalseであっても、初回だけは変更が可能
  const delta = 1000000;
  const supplyChangeTx = MosaicSupplyChangeTransaction.create(
    deadline(),
    definitionTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(delta * Math.pow(10, divisibility)),
    props.networkType,
  ).setMaxFee(props.minFeeMultiplier)

  const signedTx1 = initiatorAccount.sign(definitionTx, props.generationHash)
  const signedTx2 = initiatorAccount.sign(supplyChangeTx, props.generationHash)

  consola.info('announce: %s, signer: %s, maxFee: %d',
    signedTx1.hash,
    signedTx1.getSignerAddress().plain(),
    definitionTx.maxFee
  )
  consola.info('announce: %s, signer: %s, maxFee: %d',
    signedTx2.hash,
    signedTx2.getSignerAddress().plain(),
    supplyChangeTx.maxFee
  )
  const announceUtil = createAnnounceUtil(props.factory)
  consola.info('%s/transactionStatus/%s', props.url, signedTx1.hash)
  announceUtil.announce(signedTx1)
    .pipe(
      tap(() => consola.info('%s/transactionStatus/%s', props.url, signedTx2.hash)),
      mergeMap(() => announceUtil.announce(signedTx2))
    )
    .subscribe(
      resp => {
        consola.success('confirmed: %s, height: %d',
          resp.transactionInfo?.hash,
          resp.transactionInfo?.height.compact(),
        )
        consola.success('%s/transactions/confirmed/%s', props.url, signedTx1.hash)
        consola.success('%s/transactions/confirmed/%s', props.url, signedTx2.hash)
      },
      error => {
        consola.error(error)
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
