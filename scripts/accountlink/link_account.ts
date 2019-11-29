/**
 * $ node account-link/link_account.ts NODE_ACCOUNT_KEY
 */
import {
  Account,
  AccountLinkTransaction,
  AggregateTransaction,
  Deadline,
  LinkAction,
  NetworkType,
  PersistentDelegationRequestTransaction,
  PersistentHarvestingDelegationMessage,
  PublicAccount,
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
const remote = Account.generateNewAccount(NetworkType.MIJIN_TEST)

const nodePublicKey = process.argv[2]
const nodeAccount = PublicAccount.createFromPublicKey(
  nodePublicKey,
  NetworkType.MIJIN_TEST
)

console.log('Initiator:  %s', initiator.address.pretty())
console.log('Endpoint:   %s/account/%s', url, initiator.address.plain())
console.log('RemoteAddr: %s', remote.address.pretty())
console.log('RemoteKey:  %s', remote.publicKey)
console.log('Endpoint:   %s/account/%s', url, remote.address.plain())
console.log('NodeKey:    %s', nodeAccount.publicKey)
console.log('Endpoint:   %s/account/%s', url, nodeAccount.address.plain())
console.log('')

const accountLinkTx = AccountLinkTransaction.create(
  Deadline.create(),
  remote.publicKey,
  LinkAction.Link,
  NetworkType.MIJIN_TEST
)

const message = PersistentHarvestingDelegationMessage.create(
  remote.privateKey,
  initiator.privateKey,
  nodePublicKey,
  NetworkType.MIJIN_TEST
)

const persistentDelegationRequestTx = PersistentDelegationRequestTransaction.create(
  Deadline.create(),
  nodeAccount.address,
  [],
  message,
  NetworkType.MIJIN_TEST
)

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [accountLinkTx, persistentDelegationRequestTx].map(tx => tx.toAggregate(initiator.publicAccount)),
  NetworkType.MIJIN_TEST,
  []
)
const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => util.announce(url, signedTx)
})
