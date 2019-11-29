/**
 * $ node mosaic/create_mosaic.js 10000
 */
import {
  Account,
  MosaicNonce,
  MosaicId,
  MosaicFlags,
  MosaicDefinitionTransaction,
  UInt64,
  Deadline
} from 'nem2-sdk'
import * as util from '../util'
import { env } from '../env'

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  env.NETWORK_TYPE
)

const blocks = process.argv[2] ? parseInt(process.argv[2]) : 0 // NOTE: 現在の仕様だと1blockにつき、1cat.currencyかかる
const nonce = MosaicNonce.createRandom()
const mosId = MosaicId.createFromNonce(nonce, initiator.publicAccount)
const flags = MosaicFlags.create(
  true, // SupplyMutable
  true, // Transferable
  true  // Restrictable
)

console.log('Initiator:    %s', initiator.address.pretty())
console.log('Endpoint:     %s/account/%s', url, initiator.address.plain())
console.log('Mosaic Nonce: %s', nonce)
console.log('Mosaic Hex:   %s', mosId.toHex())
console.log('Blocks:       %s', blocks !== 0 ? blocks : 'Infinity ∞')
console.log('Endpoint:     %s/mosaic/%s', url, mosId.toHex())
console.log('')

const definitionTx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  mosId,
  flags,
  0,
  UInt64.fromUint(blocks),
  env.NETWORK_TYPE
)

const signedTx = initiator.sign(definitionTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  },
  onConfirmed: (listener, _) => listener.close()
})
