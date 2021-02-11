/**
 * $ ts-node mosaic/create_named_mosaic.ts aaa.bbb.ccc 5000
 */
import {
  Account,
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
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.GATEWAT_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

const namespace = process.argv[2]
const blocks = parseInt(process.argv[4]) || 0 // NOTE: 現在の仕様だと1blockにつき、1nem.xemかかる
const parts = namespace.split(".")

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Blocks:    %s", blocks)
parts.reduce<string[]>((accum, part) => {
  accum.push(part)
  const ns = new NamespaceId(accum.join("."))
  consola.info("Namespace: %s (%s)", ns.fullName, ns.toHex())
  consola.info("Endpoint:  %s/namespace/%s", url, ns.toHex())
  return accum
}, [])
consola.info("")

// register namespaces
const txes = parts.reduce<Transaction[]>((accum, part, idx, array) => {
  const parent = array.slice(0, idx).join(".")
  let registerTx
  if (accum.length === 0) {
    registerTx = NamespaceRegistrationTransaction.createRootNamespace(
      Deadline.create(),
      part,
      UInt64.fromUint(blocks),
      env.NETWORK_TYPE
    )
  } else {
    registerTx = NamespaceRegistrationTransaction.createSubNamespace(
      Deadline.create(),
      part,
      parent,
      env.NETWORK_TYPE
    )
  }
  accum.push(registerTx)
  return accum
}, [])

// create mosaic
const absSupply = parseInt(process.argv[3]) || 10000 * 1000000
const nonce = MosaicNonce.createRandom()
const mosId = MosaicId.createFromNonce(nonce, initiator.publicAccount)
const flags = MosaicFlags.create(
  true, // SupplyMutable
  true, // Transferable
  true  // Restrictable
)

consola.info("Nonce:     %s", nonce)
consola.info("MosaicHex: %s", mosId.toHex())
consola.info("Supply:    %s", absSupply)
consola.info("Endpoint:  %s/mosaic/%s", url, mosId.toHex())
consola.info("")

const definitionTx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  mosId,
  flags,
  0,
  UInt64.fromUint(0),
  env.NETWORK_TYPE
)
txes.push(definitionTx)

const supplyTx = MosaicSupplyChangeTransaction.create(
  Deadline.create(),
  mosId,
  MosaicSupplyChangeAction.Increase,
  UInt64.fromUint(absSupply),
  env.NETWORK_TYPE
)
txes.push(supplyTx)

// link
const nsId = new NamespaceId(namespace)
const aliasTx = MosaicAliasTransaction.create(
  Deadline.create(),
  AliasAction.Link,
  nsId,
  mosId,
  env.NETWORK_TYPE
)
txes.push(aliasTx)

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  txes.map(tx => tx.toAggregate(initiator.publicAccount)),
  env.NETWORK_TYPE,
  [],
  UInt64.fromUint(500000)
)

const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  },
  onConfirmed: (listener, _) => listener.close()
})
