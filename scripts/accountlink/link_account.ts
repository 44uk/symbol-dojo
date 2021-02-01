/**
 * $ ts-node account-link/link_account.ts NODE_ACCOUNT_KEY
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
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

if(env.INITIATOR_KEY === undefined) {
  throw new Error("You need to be set env variable PRIVATE_KEY")
}
if(env.GENERATION_HASH === undefined) {
  throw new Error("You need to be set env variable GENERATION_HASH")
}

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)
const remote = Account.generateNewAccount(env.NETWORK_TYPE)

const nodePublicKey = process.argv[2]
const nodeAccount = PublicAccount.createFromPublicKey(
  nodePublicKey,
  env.NETWORK_TYPE
)

consola.info("Initiator:  %s", initiator.address.pretty())
consola.info("Endpoint:   %s/account/%s", url, initiator.address.plain())
consola.info("RemoteAddr: %s", remote.address.pretty())
consola.info("RemoteKey:  %s", remote.publicKey)
consola.info("Endpoint:   %s/account/%s", url, remote.address.plain())
consola.info("NodeKey:    %s", nodeAccount.publicKey)
consola.info("Endpoint:   %s/account/%s", url, nodeAccount.address.plain())
consola.info("")

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
