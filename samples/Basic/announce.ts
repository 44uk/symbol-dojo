/**
 */
import consola from "consola"
import {
  Account,
  Deadline,
  PlainMessage,
  RepositoryFactoryHttp,
  TransferTransaction,
} from "symbol-sdk"
import { forkJoin } from "rxjs"
import { map } from "rxjs/operators"

import { env } from "../util/env"

async function main() {
  const url = env.GATEWAY_URL
  const repoFactory = new RepositoryFactoryHttp(url)

  const props = await forkJoin({
      currency: repoFactory.getCurrencies().pipe(map(currencies => currencies.currency)),
      epochAdjustment: repoFactory.getEpochAdjustment(),
      generationHash: repoFactory.getGenerationHash(),
      networkType: repoFactory.getNetworkType(),
      transactionFees: repoFactory.createNetworkRepository().getTransactionFees().toPromise()
  }).toPromise()

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)

  const transfer = TransferTransaction.create(
    Deadline.create(props.epochAdjustment),
    initiatorAccount.address,
    [],
    PlainMessage.create("Hello! Symbol."),
    props.networkType
  ).setMaxFee(props.transactionFees.minFeeMultiplier)

  const signedTx = initiatorAccount.sign(transfer, props.generationHash)

  const listener = repoFactory.createListener()
  await listener.open()

  listener.status(signedTx.getSignerAddress(), signedTx.hash)
    .subscribe(
      resp => {
        consola.info("error: %s, address: %s, ",
          resp.address.plain(),
          resp.code
        )
        consola.info("%s/transactionStatus/%s", env.GATEWAY_URL, signedTx.hash)
        listener.close()
      }
    )
  listener.confirmed(signedTx.getSignerAddress(), signedTx.hash)
    .subscribe(
      resp => {
        consola.info("confirmed: %s, height: %d",
          resp.transactionInfo?.hash,
          resp.transactionInfo?.height.compact(),
        )
        consola.info("%s/transactions/confirmed/%s", env.GATEWAY_URL, signedTx.hash)
        consola.info("%s/transactionStatus/%s", env.GATEWAY_URL, signedTx.hash)
        listener.close()
      }
    )

  const transactionRepo = repoFactory.createTransactionRepository()
  consola.info("announce: %s, signer: %s",
    signedTx.hash,
    signedTx.getSignerAddress().plain(),
  )
  transactionRepo.announce(signedTx)
    .subscribe(
      resp => {
        consola.info("message: %s", resp.message)
      }
    )
}

main()
