/**
 * $ node namespace/register_namespace_atomically.ts aaa.bbb.ccc
 */
import {
  Account,
  NetworkType,
  NamespaceId,
  NamespaceRegistrationTransaction,
  AggregateTransaction,
  UInt64,
  Deadline,
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

const namespace = process.argv[2]
const blocks = process.argv[3] ? parseInt(process.argv[3]) : 5000 // NOTE: 現在の仕様だと1blockにつき、1cat.currencyかかる
const parts = namespace.split('.')

console.log('Initiator: %s', initiator.address.pretty())
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain())
console.log('Blocks:    %s', blocks.toLocaleString())
parts.reduce<string[]>((accum, part) => {
  accum.push(part)
  const ns = new NamespaceId(accum.join('.'))
  console.log('Namespace: %s (%s)', ns.fullName, ns.toHex())
  console.log('Endpoint:  %s/namespace/%s', url, ns.toHex())
  return accum
}, [])
console.log('')

// 各レベルの登録トランザクションを生成
const txes = parts.reduce<NamespaceRegistrationTransaction[]>((accum, part, idx, array) => {
  const parent = array.slice(0, idx).join('.')
  let registerTx
  if (accum.length === 0) {
    registerTx = NamespaceRegistrationTransaction.createRootNamespace(
      Deadline.create(),
      part,
      UInt64.fromUint(blocks),
      NetworkType.MIJIN_TEST
    )
  } else {
    registerTx = NamespaceRegistrationTransaction.createSubNamespace(
      Deadline.create(),
      part,
      parent,
      NetworkType.MIJIN_TEST
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
  NetworkType.MIJIN_TEST,
  []
)

const signedTx = initiator.sign(aggregateTx, env.GENERATION_HASH)

util.listener(url, initiator.address, {
  onOpen: () => util.announce(url, signedTx),
  onStatus: (listener, info) => { listener.close() console.log(info) },
  onConfirmed: (listener) => listener.close()
})
