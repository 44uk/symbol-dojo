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
  MosaicService,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  TransactionService,
  UInt64,
} from 'symbol-sdk'

import { env } from '../util/env'
import { createDeadline } from '../util'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'

const MOSAIC_HEX = ''

async function main(props: INetworkStaticProps, mosaicHex: string) {
  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)
  const deadline = createDeadline(props.epochAdjustment)

  const mosaicId = new MosaicId(mosaicHex)
  const mosaicInfo = await props.factory.createMosaicRepository().getMosaic(mosaicId).toPromise()

  const delta = 1000000
  const supplyChangeTx = MosaicSupplyChangeTransaction.create(
    deadline(),
    mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(delta * Math.pow(10, mosaicInfo.divisibility)),
    props.networkType,
  ).setMaxFee(props.minFeeMultiplier)

  const signedTx = initiatorAccount.sign(supplyChangeTx, props.generationHash)

  consola.info('announce: %s, signer: %s, maxFee: %d',
    signedTx.hash,
    signedTx.getSignerAddress().plain(),
    supplyChangeTx.maxFee
  )
  consola.info('%s/transactionStatus/%s', props.url, signedTx.hash)
  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil.announce(signedTx)
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
  .then(props => main(props, MOSAIC_HEX))