/**
 * $ ts-node namespace/register_namespace_atomically.ts aaa.bbb.ccc
 */
import {
  Account,
  NamespaceId,
  NamespaceRegistrationTransaction,
  AggregateTransaction,
  UInt64,
  Deadline,
} from "symbol-sdk"
import * as util from "../util/util"
import { env } from "../util/env"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEYEY,
  env.NETWORK_TYPE
)

const namespace = process.argv[2]
const duration = parseInt(process.argv[3]) || 5000 // NOTE: 現在の仕様だと1blockにつき、1nem.xemかかる
const parts = namespace.split(".")

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Duration:  %s", duration.toLocaleString())
parts.reduce<string[]>((accum, part) => {
  accum.push(part)
  const ns = new NamespaceId(accum.join("."))
  consola.info("Namespace: %s (%s)", ns.fullName, ns.toHex())
  consola.info("Endpoint:  %s/namespace/%s", url, ns.toHex())
  return accum
}, [])
consola.info("")

// 各レベルの登録トランザクションを生成
const txes = parts.reduce<NamespaceRegistrationTransaction[]>((accum, part, idx, array) => {
  const parent = array.slice(0, idx).join(".")
  let registerTx
  if (accum.length === 0) {
    registerTx = NamespaceRegistrationTransaction.createRootNamespace(
      Deadline.create(),
      part,
      UInt64.fromUint(duration),
      env.NETWORK_TYPE,
      UInt64.fromUint(1000000)
    )
  } else {
    registerTx = NamespaceRegistrationTransaction.createSubNamespace(
      Deadline.create(),
      part,
      parent,
      env.NETWORK_TYPE,
      UInt64.fromUint(1000000)
    )
  }
  accum.push(registerTx)
  return accum
}, [])

// アグリゲートコンプリートトランザクション組み立て
// トランザクションは前から処理されるので辻褄が合うように順序には気をつける
const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  txes.map(tx => tx.toAggregate(initiator.publicAccount)),
  // [CAUTION] 子から作ろうとするとエラーになる
  // txes.map(tx => tx.toAggregate(initiator.publicAccount)).reverse(),
  env.NETWORK_TYPE,
  [],
  UInt64.fromUint(1000000)
)

const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onStatus: (listener, info) => {
    consola.info(info)
    listener.close()
  },
  onOpen: () => util.announce(url, signedTx),
  onConfirmed: (listener) => listener.close()
})
