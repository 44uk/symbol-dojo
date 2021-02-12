/**
 * $ ts-node account/fetch_account_info_with_mosaics.ts ADDRESS
 */
import consola from "consola"
import {
  Account,
  MosaicService,
} from "symbol-sdk"
import { forkJoin } from "rxjs"

import { env } from '../util/env'
import { networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'

async function main(props: INetworkStaticProps) {
  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)

  const accountRepo = props.factory.createAccountRepository()
  const mosaicService = new MosaicService(
    accountRepo,
    props.factory.createMosaicRepository()
  )

  forkJoin({
    account: accountRepo.getAccountInfo(initiatorAccount.address),
    mosaics: mosaicService.mosaicsAmountViewFromAddress(initiatorAccount.address),
  })
    .subscribe(
      resp => {
        consola.info(resp)
      },
      error => consola.error(error)
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
