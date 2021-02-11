/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import {
  Account,
  NetworkCurrencyMosaic,
  PlainMessage,
  TransferTransaction,
  Deadline,
  UInt64,
  Mosaic,
  MosaicDefinitionTransaction,
  MosaicNonce,
  MosaicId,
  MosaicFlags,
  NamespaceRegistrationTransaction,
  NamespaceId,
  Convert
} from "symbol-sdk"
import * as util from "./util/util"
import { env } from "./util/env"
import "./util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

//const namespace = process.argv[2]
//const duration = parseInt(process.argv[3]) || 0
//const [parent, child] = namespace.split(/\.(?=[^\.]+$)/)
//console.debug(parent, child)
//console.debug(duration)
//let tx: NamespaceRegistrationTransaction
//if (child) {
//  tx = NamespaceRegistrationTransaction.createSubNamespace(
//    Deadline.create(),
//    child,
//    parent,
//    env.NETWORK_TYPE,
//    UInt64.fromUint(100000000)
//  )
//} else {
//  tx = NamespaceRegistrationTransaction.createRootNamespace(
//    Deadline.create(),
//    parent,
//    UInt64.fromUint(duration),
//    env.NETWORK_TYPE,
//    UInt64.fromUint(100000000)
//  )
//}
// tx = tx.setMaxFee(5649) as NamespaceRegistrationTransaction

const duration = parseInt(process.argv[2]) || 0 // NOTE: 現在の仕様だと1blockにつき、1nem.xemかかる
// const nonce = MosaicNonce.createRandom() // ネットワーク上で一意なIDをもたせるためのランダム値
const nonce = MosaicNonce.createFromHex("7738AE52")
// const nonce = new MosaicNonce()
console.log("Nonce:     %s", Convert.uint8ToHex(nonce.nonce))

const mosId = MosaicId.createFromNonce(nonce, initiator.publicAccount)
const flags = MosaicFlags.create(
  true, // SupplyMutable
  true, // Transferable
  true  // Restrictable
)
const tx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  mosId,
  flags,
  0,
  UInt64.fromUint(duration),
  env.NETWORK_TYPE,
).setMaxFee(5649)

// const recipient = Account.generateNewAccount(env.NETWORK_TYPE).address
// const amount = parseInt(process.argv[2]) || 0
// const mosaics: Mosaic[] = [
//   // NetworkCurrencyMosaic.createRelative(amount)
// ]
// const message = PlainMessage.create("")
// const tx = TransferTransaction.create(
//   Deadline.create(23),
//   recipient,
//   mosaics,
//   message,
//   env.NETWORK_TYPE,
// ).setMaxFee(5649)

console.log("TxByteSize: %d", tx.size)
console.log("TxFee: %d", tx.maxFee)
console.log("")
const signedTx = initiator.sign(tx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
