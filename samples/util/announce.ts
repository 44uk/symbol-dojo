import { forkJoin, from, Observable } from "rxjs"
import { finalize, map, mergeMap } from "rxjs/operators"
import { Currency, NetworkType, RepositoryFactoryHttp, SignedTransaction, TransactionService } from "symbol-sdk"

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

export interface INetworkStaticProps {
  url: string
  factory: RepositoryFactoryHttp
  currency: Currency
  epochAdjustment: number
  generationHash: string
  networkType: NetworkType
  nodePublicKey: string | undefined
  minFeeMultiplier: number
}

export function networkStaticPropsUtil(url: string): Observable<INetworkStaticProps> {
  const factory = new RepositoryFactoryHttp(url)
  const networkRepo = factory.createNetworkRepository()
  return forkJoin({
    currency: factory.getCurrencies().pipe(
      map(({ currency }) => currency)
    ),
    epochAdjustment: factory.getEpochAdjustment(),
    generationHash: factory.getGenerationHash(),
    networkType: factory.getNetworkType(),
    nodePublicKey: factory.getNodePublicKey(),
    minFeeMultiplier: networkRepo.getTransactionFees().pipe(
      map(({ minFeeMultiplier }) => minFeeMultiplier)
    )
  })
    .pipe(
      map(props => ({ ...props,
        url,
        factory,
      }))
    )
}
