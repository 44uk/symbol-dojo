/**
 * $ ts-node account/fetch_account_info_with_mosaics.ts ADDRESS
 */
import consola from "consola"
import {
  Account,
} from "symbol-sdk"

import { env } from '../util/env'
import { networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { prettyPrint } from '../util'

async function main(props: INetworkStaticProps) {
  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)

  const accountRepo = props.factory.createAccountRepository()

  accountRepo.getAccountInfo(initiatorAccount.address)
    .subscribe(
      resp => {
        prettyPrint(resp)
      },
      error => consola.error(error)
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
