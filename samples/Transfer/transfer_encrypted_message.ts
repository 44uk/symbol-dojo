/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  EncryptedMessage,
  TransferTransaction,
} from "symbol-sdk"

import { env } from '../util/env'
import { prettyPrint } from '../util/print'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline } from '../util'

async function main(props: INetworkStaticProps) {
  const deadline = createDeadline(props.epochAdjustment)

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)
  const aliceAccount = Account.createFromPrivateKey(env.ALICE_KEY, props.networkType)

  // 暗号化メッセージオブジェクトを作成
  const message = EncryptedMessage.create(
    "I’m sick of not having the courage to be an absolute nobody",
    aliceAccount.publicAccount,
    initiatorAccount.privateKey
  )

  const transferTx = TransferTransaction.create(
    deadline(),
    aliceAccount.address,
    [],
    message,
    props.networkType
  ).setMaxFee(props.minFeeMultiplier)

  const signedTx = initiatorAccount.sign(transferTx, props.generationHash)

  consola.info('announce: %s, signer: %s, maxFee: %d',
    signedTx.hash,
    signedTx.getSignerAddress().plain(),
    transferTx.maxFee
  )
  consola.info('%s/transactionStatus/%s', props.url, signedTx.hash)
  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil.announce(signedTx)
    .subscribe(
      resp => {
        prettyPrint(resp)
        consola.success('%s/transactions/confirmed/%s', props.url, signedTx.hash)

        // @ts-ignore
        const encrypted = resp.message as EncryptedMessage
        const decrypted = EncryptedMessage.decrypt(
          encrypted,
          aliceAccount.privateKey,
          initiatorAccount.publicAccount
        )
        prettyPrint(decrypted)
      },
      error => {
        consola.error(error)
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
