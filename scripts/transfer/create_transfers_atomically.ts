/**
 * $ node transfer/create_transfers_atomically.js 30
 */
import {
  Account,
  PlainMessage,
  NetworkCurrencyMosaic,
  TransferTransaction,
  AggregateTransaction,
  Deadline,
  NetworkType
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

const amount = parseInt(process.argv[2])

console.log('Initiator: %s', initiator.address.pretty())
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain())
console.log('')

// 便宜上宛先として新しいアカウントを生成
const recipients = [...Array(3)].map((_, idx) => {
  const account = Account.generateNewAccount(NetworkType.MIJIN_TEST)
  console.log(`- account${idx + 1} ${'-'.repeat(64)}`)
  console.log('Private:  %s', account.privateKey)
  console.log('Public:   %s', account.publicKey)
  console.log('Address:  %s', account.address.pretty())
  console.log('Endpoint: %s/account/%s', url, account.address.plain())
  return account
})
console.log('')

const mosaics = [NetworkCurrencyMosaic.createRelative(amount)]
const message = PlainMessage.create('Tip for you')
const txes = recipients.map(account => {
  return TransferTransaction.create(
    Deadline.create(),
    account.address,
    mosaics,
    message,
    NetworkType.MIJIN_TEST
  )
})

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
  onConfirmed: (listener) => listener.close()
})
