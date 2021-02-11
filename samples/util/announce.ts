import { from } from "rxjs"
import { finalize, mergeMap } from "rxjs/operators"
import { RepositoryFactoryHttp, SignedTransaction, TransactionService } from "symbol-sdk"

export function createAnnounceUtil(factory: RepositoryFactoryHttp) {
  const transactionService = new TransactionService(
    factory.createTransactionRepository(),
    factory.createReceiptRepository()
  )
  const listener = factory.createListener()
  return function(signedTx: SignedTransaction) {
    signedTx.type
    return from(listener.open())
      .pipe(
        mergeMap(() => transactionService.announce(signedTx, listener)),
        finalize(() => listener.close())
      )
  }
}

