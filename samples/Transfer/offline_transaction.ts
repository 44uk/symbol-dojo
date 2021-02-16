/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  Address,
  PlainMessage,
  TransferTransaction,
} from "symbol-sdk"

import { env } from '../util/env'
import { prettyPrint } from '../util/print'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline } from '../util'

async function main(props: INetworkStaticProps) {
  const deadline = createDeadline(props.epochAdjustment)

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)

  const transferTx = TransferTransaction.create(
    deadline(),
    initiatorAccount.address,
    mosaics,
    PlainMessage.create('Signed with offline.'),
    props.networkType
  ).setMaxFee(props.minFeeMultiplier)

  const signedTx = initiatorAccount.sign(transferTx, props.generationHash)

  consola.info('announce: %s, signer: %s, maxFee: %d',
    signedTx.hash,
    signedTx.getSignerAddress().plain(),
    transferTx.maxFee
  )
  consola.info('%s/transactionStatus/%s', props.url, signedTx.hash)
  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil.announce(signedTx)
    .subscribe(
      resp => {
        prettyPrint(resp)
        consola.success('%s/transactions/confirmed/%s', props.url, signedTx.hash)
      },
      error => {
        consola.error(error)
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))














/**
 * $ ts-node transfer/offline_transfer.ts RECIPIENT_ADDRESS
 */
import {
  Account,
  Address,
  NetworkCurrencyMosaic,
  PlainMessage,
  TransferTransaction,
  Deadline,
  UInt64,
  SignedTransaction,
} from "symbol-sdk"

import * as util from "../util/util"
import { env } from "../util/env"
import "../util/NetworkCurrencyMosaic"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

const recipient = Address.createFromRawAddress(process.argv[2])
const amount = parseInt(process.argv[3]) || 0

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Recipient: %s", recipient.pretty())
consola.info("Endpoint:  %s/account/%s", url, recipient.plain())
consola.info("")

const mosaics = [NetworkCurrencyMosaic.createRelative(amount)]
const message = PlainMessage.create("Ticket fee")

const transferTx = TransferTransaction.create(
  Deadline.create(),
  recipient,
  mosaics,
  message,
  env.NETWORK_TYPE,
  UInt64.fromUint(1000000)
)
consola.info("TxByteSize: %d", transferTx.size)

// 署名済み
const signedTx = initiator.sign(transferTx, env.GENERATION_HASH)

// トランザクションの発信に必要な情報は`payload`のみ
// この値を文字列を印刷したりやQRコードなどの方法でオフラインで共有し、
// 受け取り側でオブジェクトを作り直して、アナウンスすることができます。
const payload = signedTx.payload
//const payload = "C900000000000000D2D62BB8EC6E4DE47666C299FCA4EA20AB7A293A7CA521DC14FE8044BCB90E06023C3F9AF5F74F8998CC4CB4725A3AE0486A9CF800FF681BB36FEB9F84B38D00C142156B53C08C367CCDC2F5AC443B907281191FBE5EA04729B3EB3C1EB7D6E00000000001985441FE1971180200000046E9F7260100000098EC2F0F955096921E30339CFD9D023E229D3DD222AD483122002900000000000065383738643439323332353364663234636637383762306465636438326137666463663632366430"
const txPayload = { payload } as SignedTransaction
consola.info("TxPayload: %o", payload)

util.listener(url, initiator.address, {
  onOpen: () => {
    // 署名済みトランザクションを発信
    util.announce(url, txPayload)
  },
  onConfirmed: (listener) => listener.close()
})
