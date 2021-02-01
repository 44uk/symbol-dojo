/**
 * $ ts-nodeode alias/alias_account.ts namespaceString address
 */
import {
  Account,
  Address,
  Deadline,
  AliasAction,
  NamespaceId,
  AddressAliasTransaction,
  UInt64
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

const namespace = process.argv[2]
const rawAddress = process.argv[3]

const nsId = new NamespaceId(namespace)
const address = Address.createFromRawAddress(rawAddress)

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Namespace: %s", nsId.fullName)
consola.info("Endpoint:  %s/namespace/%s", url, nsId.toHex())
consola.info("Address:   %s", address.pretty())
consola.info("Endpoint:  %s/account/%s", url, address.plain())
consola.info("")

const aliasTx = AddressAliasTransaction.create(
  Deadline.create(),
  AliasAction.Link,
  nsId,
  address,
  env.NETWORK_TYPE,
  UInt64.fromUint(50000)
)

const signedTx = initiator.sign(aliasTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => {
    util.announce(url, signedTx)
  },
  onConfirmed: (listener) => listener.close()
})
