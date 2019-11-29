/**
 * $ node mosaic/create_named_mosaic.js aaa.bbb.ccc 5000
 */
import {
  Account,
  NetworkType,
  MosaicNonce,
  MosaicId,
  NamespaceId,
  MosaicSupplyChangeAction,
  NamespaceRegistrationTransaction,
  MosaicFlags,
  MosaicDefinitionTransaction,
  MosaicAliasTransaction,
  MosaicSupplyChangeTransaction,
  AggregateTransaction,
  UInt64,
  Deadline,
  AliasAction
} from 'nem2-sdk'
import * as util from '../util'
import { env } from '../env'

if(env.PRIVATE_KEY === undefined) {
  throw new Error('You need to be set env variable PRIVATE_KEY')
}
if(env.GENERATION_HASH === undefined) {
  throw new Error('You need to be set env variable GENERATION_HASH')
}

const url = env.API_URL || 'http://localhost:3000'
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
)

const namespace = process.argv[2]
const blocks = process.argv[4] ? parseInt(process.argv[4]) : 5000 // NOTE: 現在の仕様だと1blockにつき、1cat.currencyかかる
const parts = namespace.split('.')

console.log('Initiator: %s', initiator.address.pretty())
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain())
console.log('Blocks:    %s', blocks)
parts.reduce<string[]>((accum, part) => {
  accum.push(part)
  const ns = new NamespaceId(accum.join('.'))
  console.log('Namespace: %s (%s)', ns.fullName, ns.toHex())
  console.log('Endpoint:  %s/namespace/%s', url, ns.toHex())
  return accum
}, [])
console.log('')

// register namespaces
const txes = parts.reduce<Transaction[]>((accum, part, idx, array) => {
  const parent = array.slice(0, idx).join('.')
  let registerTx
  if (accum.length === 0) {
    registerTx = NamespaceRegistrationTransaction.createRootNamespace(
      Deadline.create(),
      part,
      UInt64.fromUint(blocks),
      NetworkType.MIJIN_TEST
    )
  } else {
    registerTx = NamespaceRegistrationTransaction.createSubNamespace(
      Deadline.create(),
      part,
      parent,
      NetworkType.MIJIN_TEST
    )
  }
  accum.push(registerTx)
  return accum
}, [])

// create mosaic
const absSupply = process.argv[3] ? parseInt(process.argv[3]) : 10000 * 1000000
const nonce = MosaicNonce.createRandom()
const mosId = MosaicId.createFromNonce(nonce, initiator.publicAccount)
const flags = MosaicFlags.create(
  true, // SupplyMutable
  true, // Transferable
  true  // Restrictable
)

console.log('Mosaic Nonce: %s', nonce)
console.log('Mosaic Hex:   %s', mosId.toHex())
console.log('Supply:       %s', absSupply)
console.log('Endpoint:     %s/mosaic/%s', url, mosId.toHex())
console.log('')

const definitionTx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  mosId,
  flags,
  0,
  UInt64.fromUint(0),
  NetworkType.MIJIN_TEST
)
txes.push(definitionTx)

const supplyTx = MosaicSupplyChangeTransaction.create(
  Deadline.create(),
  mosId,
  MosaicSupplyChangeAction.Increase,
  UInt64.fromUint(absSupply),
  NetworkType.MIJIN_TEST
)
txes.push(supplyTx)

// link
const nsId = new NamespaceId(namespace)
const aliasTx = MosaicAliasTransaction.create(
  Deadline.create(),
  AliasAction.Link,
  nsId,
  mosId,
  NetworkType.MIJIN_TEST
)
txes.push(aliasTx)

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  txes.map(tx => tx.toAggregate(initiator.publicAccount)),
  NetworkType.MIJIN_TEST,
  []
)

const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  },
  onConfirmed: (listener, _) => listener.close()
})
