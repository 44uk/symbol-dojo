import { inspect } from 'util'
import consola from 'consola'
import { SignedTransaction, TransactionMapping } from 'symbol-sdk'
import hr from './humanReadable'

export function txPrinter(url: string) {
  return {
    info: function(signedTx: SignedTransaction) {
      const tx = TransactionMapping.createFromPayload(signedTx.payload)
      consola.info('%s > hash: %s maxFee: %s signer: %s',
        hr.transactionType(tx.type),
        signedTx.hash.slice(0, 8) + '...',
        tx.maxFee,
        signedTx.getSignerAddress().pretty()
      )
    },
    status: function(signedTx: SignedTransaction) {
      consola.info('%s > %s/transactionStatus/%s',
        hr.transactionType(signedTx.type),
        url,
        signedTx.hash
      )
    },
    url: function(signedTx: SignedTransaction) {
      consola.success('%s > %s/transactions/confirmed/%s',
        hr.transactionType(signedTx.type),
        url,
        signedTx.hash
      )
    }
  }
}

export function prettyPrint(object: any) {
  consola.info(inspect(object, {
    depth: null
  }))
}
