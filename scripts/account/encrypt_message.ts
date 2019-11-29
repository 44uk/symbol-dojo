/**
 * $ ts-node transfer/create_encrypted_message_transfer.ts MESSAGE
 */
import {
  Account,
  TransferTransaction,
  Deadline,
  UInt64
} from "symbol-sdk"
import { env } from "../util/env"

const url = env.GATEWAT_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)
const plainText = process.argv[2] || "Good luck!"
const encryptedMessage = initiator.encryptMessage(plainText, initiator.publicAccount, env.NETWORK_TYPE)

// 確認用の情報を出力
consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Recipient: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Message:   %s", plainText)
consola.info("Encrypted: %s", encryptedMessage.payload)
consola.info("")

// 暗号化メッセージオブジェクトをトランザクションに渡して使います。
const transferTx = TransferTransaction.create(
  Deadline.create(),
  initiator.address,
  [],
  encryptedMessage,
  env.NETWORK_TYPE,
  UInt64.fromUint(1000000)
)

// const signedTx = initiator.sign(transferTx, env.GENERATION_HASH)

// util.listener(url, initiator.address, {
//   onOpen: () => {
//     util.announce(url, signedTx)
//   },
//   onConfirmed: (listener) => listener.close()
// })
