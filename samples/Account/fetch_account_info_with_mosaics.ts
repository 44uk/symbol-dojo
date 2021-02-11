/**
 * $ ts-node account/fetch_account_info_with_mosaics.ts ADDRESS
 */
import consola from "consola"
import {
  Account,
  Address,
  MosaicService,
  RepositoryFactoryHttp,
} from "symbol-sdk"
import { env } from "../util/env"
import { forkJoin } from "rxjs"

const url = env.GATEWAT_URL
const factory = new RepositoryFactoryHttp(url, {
  generationHash: env.GENERATION_HASH,
  networkType: env.NETWORK_TYPE,
  epochAdjustment: env.EPOCH_ADJUSTMENT,
})
const accountRepo = factory.createAccountRepository()
const mosaicService = new MosaicService(
  accountRepo,
  factory.createMosaicRepository()
)

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

forkJoin({
  account: accountRepo.getAccountInfo(address),
  mosaics: mosaicService.mosaicsAmountViewFromAddress(address),
})
  .subscribe(resp => {
    consola.info({ resp })
  })
