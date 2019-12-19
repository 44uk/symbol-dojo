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
} from "nem2-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

if(env.PRIVATE_KEY === undefined) {
  throw new Error("You need to be set env variable PRIVATE_KEY")
}
if(env.GENERATION_HASH === undefined) {
  throw new Error("You need to be set env variable GENERATION_HASH")
}

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.PRIVATE_KEY,
  env.NETWORK_TYPE
)
const remote = Account.generateNewAccount(env.NETWORK_TYPE)

const nodePublicKey = process.argv[2]
const nodeAccount = PublicAccount.createFromPublicKey(
  nodePublicKey,
  env.NETWORK_TYPE
)

console.log("Initiator:  %s", initiator.address.pretty())
console.log("Endpoint:   %s/account/%s", url, initiator.address.plain())
console.log("RemoteAddr: %s", remote.address.pretty())
console.log("RemoteKey:  %s", remote.publicKey)
console.log("Endpoint:   %s/account/%s", url, remote.address.plain())
console.log("NodeKey:    %s", nodeAccount.publicKey)
console.log("Endpoint:   %s/account/%s", url, nodeAccount.address.plain())
console.log("")

const accountLinkTx = AccountLinkTransaction.create(
  Deadline.create(),
  remote.publicKey,
  LinkAction.Link,
  env.NETWORK_TYPE
)

const message = PersistentHarvestingDelegationMessage.create(
  remote.privateKey,
  initiator.privateKey,
  nodePublicKey,
  env.NETWORK_TYPE
)

const persistentDelegationRequestTx = PersistentDelegationRequestTransaction.create(
  Deadline.create(),
  nodeAccount.address,
  [],
  message,
  env.NETWORK_TYPE
)

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [accountLinkTx, persistentDelegationRequestTx].map(tx => tx.toAggregate(initiator.publicAccount)),
  env.NETWORK_TYPE,
  []
)
const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => util.announce(url, signedTx)
})
