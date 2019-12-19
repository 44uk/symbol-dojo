/**
 * $ node namespace/register_namespace.ts test
 */
import {
  Account,
  NetworkType,
  NamespaceId,
  NamespaceRegistrationTransaction,
  UInt64,
  Deadline
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
const blocks = process.argv[3] ? parseInt(process.argv[3]) : 5000 // NOTE: 現在の仕様だと1blockにつき、1cat.currencyかかる
const nsId = new NamespaceId(namespace)

console.log("Initiator: %s", initiator.address.pretty())
console.log("Endpoint:  %s/account/%s", url, initiator.address.plain())
console.log("Namespace: %s (%s)", nsId.fullName, nsId.toHex())
console.log("Blocks:    %s", blocks.toLocaleString())
console.log("Endpoint:  %s/namespace/%s", url, nsId.toHex())
console.log("")

// const [root, sub] = namespace.split(/(?<=^[^.]+)\./)
const [parent, child] = namespace.split(/\.(?=[^\.]+$)/)

let registerTx
if (child) {
  registerTx = NamespaceRegistrationTransaction.createSubNamespace(
    Deadline.create(),
    child,
    parent,
    env.NETWORK_TYPE
  )
} else {
  registerTx = NamespaceRegistrationTransaction.createRootNamespace(
    Deadline.create(),
    parent,
    UInt64.fromUint(blocks),
    env.NETWORK_TYPE
  )
}

const signedTx = initiator.sign(registerTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => util.announce(url, signedTx),
  onStatus: (listener, info) => { listener.close() console.log(info) },
  onConfirmed: (listener) => listener.close()
})
