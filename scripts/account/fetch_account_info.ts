/**
 * $ ts-node account/fetch_account_info.ts
 */
import consola from "consola"
import {
  Account,
  AccountHttp,
  RepositoryFactoryHttp,
} from "symbol-sdk"
import { env } from "../util/env"

const url = env.API_URL
const factory = new RepositoryFactoryHttp(url, {
  generationHash: env.GENERATION_HASH,
  networkType: env.NETWORK_TYPE,
  epochAdjustment: env.EPOCH_ADJUSTMENT,
})
const accountRepo = factory.createAccountRepository()
const accountHttp = new AccountHttp(url)

const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

accountRepo.getAccountInfo(initiator.address)
  .subscribe(accountInfo => {
    consola.info("%o", accountInfo)
  })
