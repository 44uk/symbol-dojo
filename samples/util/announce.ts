import consola from 'consola'
import { forkJoin, from, Observable } from "rxjs"
import { finalize, map, mergeMap, tap } from "rxjs/operators"
import { CosignatureSignedTransaction, Currency, NetworkType, RepositoryFactoryHttp, SignedTransaction, TransactionService, TransactionType } from "symbol-sdk"
import { humanReadable as hr } from "../util"

export function createAnnounceUtil(factory: RepositoryFactoryHttp) {
  const transactionRepo = factory.createTransactionRepository()
  const transactionService = new TransactionService(
    transactionRepo,
    factory.createReceiptRepository()
  )

  function cosign(signedCoTx: CosignatureSignedTransaction) {
    const listener = factory.createListener()
    return from(listener.open())
      .pipe(
        mergeMap(() => transactionRepo.announceAggregateBondedCosignature(signedCoTx)),
        finalize(() => listener.close())
      )
  }

  function announce(signedTx: SignedTransaction, hashLockSignedTx?: SignedTransaction) {
    const listener = factory.createListener()
    return from(listener.open())
      .pipe(
        mergeMap(() => {
          if(signedTx.type === TransactionType.AGGREGATE_BONDED) {
            if(hashLockSignedTx) {
              return transactionService.announceHashLockAggregateBonded(hashLockSignedTx, signedTx, listener)
            } else {
              return transactionService.announceAggregateBonded(signedTx, listener)
            }
          }
          return transactionService.announce(signedTx, listener)
        }),
        finalize(() => listener.close())
      )
  }

  return { announce, cosign }
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
    ),
    configuration: networkRepo.getNetworkProperties()
  })
    .pipe(
      map(props => ({ ...props,
        url,
        factory,
      })),
      tap(props => {
        props.configuration.chain
        consola.info('-- [NetworkStaticProps] %s', '-'.repeat(56))
        consola.info('URL: %s', props.url)
        consola.info('NetworkType: %s(%d)',
          hr.networkType(props.networkType),
          props.networkType
        )
        consola.info('Currency: %s(%s)',
          props.currency.namespaceId?.fullName,
          props.currency.mosaicId?.toHex()
        )
        consola.info('EpochAdj: %d', props.epochAdjustment)
        consola.info('GenHash: %s', props.generationHash)
        consola.info('MinFeeMul: %s', props.minFeeMultiplier)
        consola.info('NodePubKey: %s', props.nodePublicKey)
        consola.info('%s', '-'.repeat(80))
      })
    )
}
