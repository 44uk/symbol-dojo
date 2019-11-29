/**
 * $ node transfer/create_deencrypt_message_transfer.js
 */
import {
  Account,
  NetworkType,
  TransferTransaction,
  Deadline,
  QueryParams,
  Order,
  PublicAccount,
  AccountHttp
} from 'nem2-sdk'
import * as util from '../util'
import { env } from '../env'
import {
  mergeMap,
  filter,
  map
} from 'rxjs/operators'
import {

} from 'rxjs'

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
const plainMessage = process.argv[3]

const accountHttp = new AccountHttp(url)

accountHttp.incomingTransactions(initiator.address, new QueryParams(100, undefined, Order.DESC))
  .pipe(
    mergeMap(_ => _),
    filter(tx => tx instanceof TransferTransaction && tx.message.payload.length > 0),
    map(_ => _ as TransferTransaction)
  )
  .subscribe(
    incomingWithMessage => {
      console.log(incomingWithMessage.message)
      const publicAccount = PublicAccount.createFromPublicKey('1654BF53393174FA8A5DD5312C17CC61830343594CA776A7CD1822A21F161C81', nem.NetworkType.MIJIN_TEST)
      console.log(publicAccount.address)
      const decodedMessage = initiator.decryptMessage(incomingWithMessage.message, publicAccount, NetworkType.MIJIN_TEST)
      console.log(decodedMessage)
    }
  )


// const encrypted = nem.EncryptedMessage.createFromDTO(
//   '36A4AC5810B10793BA0992C5D7CDBA6EB07AB7E110ACCEE2AFFE8B68EF022B737CDBBDCEC02A8220DDEF928E283901B5CB5F81119FCB6DA7444D2FA996327C37'
// )
// const plainMessage = account.decryptMessage(encrypted, publicAccount)
// console.log(plainMessage)
