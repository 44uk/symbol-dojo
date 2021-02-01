/**
 * $ ts-node transfer/create_deencrypt_message_transfer.ts ENCRYPTED_MESSAGE
 */
import {
  Account,
  EncryptedMessage,
} from "symbol-sdk"
import { env } from "../util/env"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)
const encryptedPayload = process.argv[2]
const encryptedMessage = EncryptedMessage.createFromPayload(encryptedPayload)
const plainMessage = initiator.decryptMessage(encryptedMessage, initiator.publicAccount, env.NETWORK_TYPE)

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/account/%s", url, initiator.address.plain())
consola.info("Payload:   %s", encryptedPayload)
consola.info("Plain  :   %s", plainMessage.payload)
consola.info("")

//       consola.info(incomingWithMessage.message)
//       const publicAccount = PublicAccount.createFromPublicKey("1654BF53393174FA8A5DD5312C17CC61830343594CA776A7CD1822A21F161C81", nem.env.NETWORK_TYPE)
//       consola.info(publicAccount.address)
//       const decodedMessage = initiator.decryptMessage(incomingWithMessage.message, publicAccount, env.NETWORK_TYPE)
//       consola.info(decodedMessage)

// const encrypted = nem.EncryptedMessage.createFromDTO(
//   "36A4AC5810B10793BA0992C5D7CDBA6EB07AB7E110ACCEE2AFFE8B68EF022B737CDBBDCEC02A8220DDEF928E283901B5CB5F81119FCB6DA7444D2FA996327C37"
// )
// const plainMessage = account.decryptMessage(encrypted, publicAccount)
// consola.info(plainMessage)
