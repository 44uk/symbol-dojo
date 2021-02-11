/**
 * $ ts-node alias/alias_mosaic.ts namespaceString mosaicHex
 */
import {
  Account,
  MosaicId,
  NamespaceId,
  AliasAction,
  MosaicAliasTransaction,
  Deadline,
  UInt64
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.GATEWAT_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

const namespace = process.argv[2]
const mosaicHex = process.argv[3]

const nsId = new NamespaceId(namespace)
const mosId = new MosaicId(mosaicHex)

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Namespace: %s", nsId.fullName)
consola.info("Endpoint:  %s/namespace/%s", url, nsId.toHex())
consola.info("MosaicHex: %s", mosId.toHex())
consola.info("Endpoint:  %s/mosaic/%s", url, mosId.toHex())
consola.info("")

const aliasTx = MosaicAliasTransaction.create(
  Deadline.create(),
  AliasAction.Link,
  nsId,
  mosId,
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
