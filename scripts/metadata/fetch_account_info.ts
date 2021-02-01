/**
 * $ ts-node account/fetch_account_info.ts ADDRESS
 */
import {
  Account,
  NetworkType,
  Address,
  MetadataHttp
} from "symbol-sdk"
import { env } from "../util/env"

if(env.INITIATOR_KEY === undefined) {
  throw new Error("You need to be set env variable PRIVATE_KEY")
}
if(env.GENERATION_HASH === undefined) {
  throw new Error("You need to be set env variable GENERATION_HASH")
}

const url = env.API_URL
let address: Address
if(env.INITIATOR_KEY) {
  const initiator = Account.createFromPrivateKey(
    env.INITIATOR_KEY,
    env.NETWORK_TYPE
  )
  address = initiator.address
} else {
  address = Address.createFromRawAddress(process.argv[2])
}

const metaHttp = new MetadataHttp(url)

metaHttp.getAccountMetadata(address)
  .subscribe(metadataEntries => {
    consola.info("%o", metadataEntries)
  })

