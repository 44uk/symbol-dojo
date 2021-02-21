/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import yargs from 'yargs'

import {
  Account,
  AggregateTransaction,
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
  const nameParts = fullName.split(".")

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)

  const txes = nameParts.reduce<Transaction[]>((accum, part, idx, array) => {
    const parent = array.slice(0, idx).join(".")
    let registerNSTx: Transaction
    if (accum.length === 0) {
      registerNSTx = NamespaceRegistrationTransaction.createRootNamespace(
        deadline(),
        part,
        UInt64.fromUint(duration),
        props.networkType,
      )
    } else {
      registerNSTx = NamespaceRegistrationTransaction.createSubNamespace(
        deadline(),
        part,
        parent,
        props.networkType,
      )
    }
    accum.push(registerNSTx)
    return accum
  }, [])

  // トランザクションは前から処理されるので上位ネームスペースほど前に配置する
  // 下位ネームスペースから作ろうとするとエラーになります
  const aggregateTx = AggregateTransaction.createComplete(
    deadline(),
    txes.map(tx => tx.toAggregate(initiatorAccount.publicAccount)),
    props.networkType,
    [],
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 0)

  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)

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
