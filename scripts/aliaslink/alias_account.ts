/**
 * $ node alias/alias_account.js namespaceString address
 */
import {
  Account,
  Address,
  Deadline,
  AliasAction,
  NetworkType,
  NamespaceId,
  AddressAliasTransaction
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

const namespace = process.argv[2]
const rawAddress = process.argv[3]

const nsId = new NamespaceId(namespace)
const address = Address.createFromRawAddress(rawAddress)

console.log("Initiator: %s", initiator.address.pretty())
console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
console.log("Namespace: %s", nsId.fullName)
console.log("Endpoint:  %s/namespace/%s", url, nsId.toHex())
console.log("Address:   %s", address.pretty())
console.log("Endpoint:  %s/account/%s", url, address.plain())
console.log("")

const aliasTx = AddressAliasTransaction.create(
  Deadline.create(),
  AliasAction.Link,
  nsId,
  address,
  env.NETWORK_TYPE
)

const signedTx = initiator.sign(aliasTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
