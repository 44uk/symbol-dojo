/**
 * $ node account/fetch_account_info.js ADDRESS
 */
import {
  Account,
  NetworkType,
  Address,
  MetadataHttp
} from 'nem2-sdk'
import { env } from '../env'

if(env.PRIVATE_KEY === undefined) {
  throw new Error('You need to be set env variable PRIVATE_KEY')
}
if(env.GENERATION_HASH === undefined) {
  throw new Error('You need to be set env variable GENERATION_HASH')
}

const url = env.API_URL || 'http://localhost:3000'
let address: Address
if(env.PRIVATE_KEY) {
  const initiator = Account.createFromPrivateKey(
    env.PRIVATE_KEY,
    NetworkType.MIJIN_TEST
  )
  address = initiator.address
} else {
  address = Address.createFromRawAddress(process.argv[2])
}

const metaHttp = new MetadataHttp(url)

metaHttp.getAccountMetadata(address)
  .subscribe(metadataEntries => {
    console.log('%o', metadataEntries)
  })

