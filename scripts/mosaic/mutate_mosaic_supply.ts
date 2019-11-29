/**
 * $ node mosaic/mutate_mosaic.js deadbeefcafebabe 1000000 add|remove
 */
import {
  Account,
  MosaicId,
  NetworkType,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  Deadline,
  UInt64
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

const mosIdent = process.argv[2]
const absSupply = process.argv[3] ? parseInt(process.argv[3]) : 10000 * 1000000
const action = process.argv[4] || 'add'
const mosId = new MosaicId(mosIdent)

console.log('Initiator: %s', initiator.address.pretty())
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain())
console.log('MosaicHex: %s', mosId.toHex())
console.log('Supply:    %s', absSupply)
console.log('Action:    %s', action)
console.log('Endpoint:  %s/mosaic/%s', url, mosId.toHex())
console.log('')

const supplyAction = action === 'remove'
  ? MosaicSupplyChangeAction.Decrease
  : MosaicSupplyChangeAction.Increase

const supplyTx = MosaicSupplyChangeTransaction.create(
  Deadline.create(),
  mosId,
  supplyAction,
  UInt64.fromUint(absSupply),
  NetworkType.MIJIN_TEST
)

const signedTx = initiator.sign(supplyTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
