/**
 * $ ts-node namespace/register_namespace.ts test
 */
import {
  Account,
  NamespaceId,
  NamespaceRegistrationTransaction,
  UInt64,
  Deadline
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.GATEWAT_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEYEY,
  env.NETWORK_TYPE
)

const namespace = process.argv[2]
const duration = parseInt(process.argv[3]) || 5000 // NOTE: 現在の仕様だと1blockにつき、1nem.xemかかる
const nsId = new NamespaceId(namespace)
const [parent, child] = namespace.split(/\.(?=[^\.]+$)/)
// const [root, sub] = namespace.split(/(?<=^[^.]+)\./)

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Namespace: %s (%s)", nsId.fullName, nsId.toHex())
consola.info("Parent:    %s", parent)
consola.info("Child:     %s", child || "")
consola.info("Duration:  %s", duration.toLocaleString())
consola.info("Endpoint:  %s/namespace/%s", url, nsId.toHex())
consola.info("")

let registerTx: NamespaceRegistrationTransaction
if (child) {
  registerTx = NamespaceRegistrationTransaction.createSubNamespace(
    Deadline.create(),
    child,
    parent,
    env.NETWORK_TYPE,
    UInt64.fromUint(1000000)
  )
} else {
  registerTx = NamespaceRegistrationTransaction.createRootNamespace(
    Deadline.create(),
    parent,
    UInt64.fromUint(duration),
    env.NETWORK_TYPE,
    UInt64.fromUint(1000000)
  )
}
// registerTx = registerTx.setMaxFee(100) as NamespaceRegistrationTransaction

const signedTx = initiator.sign(registerTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onStatus: (listener, info) => {
    consola.info(info)
    listener.close()
  },
  onOpen: () => util.announce(url, signedTx),
  onConfirmed: (listener) => listener.close()
})
