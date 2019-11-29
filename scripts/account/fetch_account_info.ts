/**
 * $ node account/fetch_account_info.js ADDRESS
 */
import {
  Account,
  NetworkType,
  Address,
  AccountHttp
} from 'nem2-sdk'
import { env } from '../env'

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

const accountHttp = new AccountHttp(url)

accountHttp.getAccountInfo(address)
  .subscribe(accountInfoView => {
    console.log('%o', accountInfoView)
  })

