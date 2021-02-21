/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import yargs from 'yargs'

import {
  Account,
  NamespaceRegistrationTransaction,
  Transaction,
  UInt64,
} from "symbol-sdk"

import { env } from '../util/env'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline, prettyPrint, txPrinter } from '../util'

const argv = yargs(process.argv.slice(2))
  .usage('Usage: $0 --fullName [string] -duration [num]')
  .default('fullName', 'mynamespace')
  .default('duration', 172800)
  .argv

async function main(props: INetworkStaticProps, fullName: string, duration = 172800) {
  const txPrint = txPrinter(props.url)
  const deadline = createDeadline(props.epochAdjustment)

  const [ parent, child ] = fullName.split(/\.(?=[^\.]+$)/)

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)

  let registerNSTx: Transaction
  if (child) {
    registerNSTx = NamespaceRegistrationTransaction.createSubNamespace(
      deadline(),
      child,
      parent,
      props.networkType
    ).setMaxFee(props.minFeeMultiplier)
  } else {
    registerNSTx = NamespaceRegistrationTransaction.createRootNamespace(
      deadline(),
      parent,
      UInt64.fromUint(duration),
      props.networkType
    ).setMaxFee(props.minFeeMultiplier)
  }

  const signedTx = initiatorAccount.sign(registerNSTx, props.generationHash)

  txPrint.info(signedTx)
  txPrint.status(signedTx)
  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil.announce(signedTx)
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
  .then(props => main(props, argv.fullName, argv.duration))
