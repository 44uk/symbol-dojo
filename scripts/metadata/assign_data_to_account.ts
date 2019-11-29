/**
 * $ ts-node metadata/account.ts
 */
import {
  Account,
  NetworkType,
  Deadline,
  AccountMetadataTransaction,
  KeyGenerator,
  AggregateTransaction
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

const target = Account.generateNewAccount(NetworkType.MIJIN_TEST)
const key = KeyGenerator.generateUInt64Key('KeyName')
// sha3_256のハッシュ値をUInt64にした値
// const buf = js_sha3_1.sha3_256.arrayBuffer(input)
// const result = new Uint32Array(buf)
// return new UInt64_1.UInt64([result[0], (result[1] | 0x80000000) >>> 0])
// const value 'http://placehold.jp/100x100.png'
const value = 'KeyValueA'

console.log('Initiator: %s', initiator.address.pretty())
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain())
console.log('Endpoint:  %s/metadata/account/%s', url, initiator.address.plain())
console.log('')

const metaTx = AccountMetadataTransaction.create(
  Deadline.create(),
  initiator.publicKey,
  key,
  value.length,
  value,
  NetworkType.MIJIN_TEST
)

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [metaTx.toAggregate(initiator.publicAccount)],
  NetworkType.MIJIN_TEST,
  []
)
const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => util.announce(url, signedTx),
  onStatus: (listener, info) => { listener.close() console.log(info) },
  onConfirmed: (listener) => listener.close()
})
