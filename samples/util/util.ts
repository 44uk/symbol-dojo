import consola from "consola"
import { from, Observable } from "rxjs"
import { ChronoUnit } from '@js-joda/core'
import {
  Address,
  Listener,
  TransactionHttp,
  SignedTransaction,
  CosignatureSignedTransaction,
  TransactionAnnounceResponse,
  TransactionType,
  NamespaceHttp,
  RepositoryFactoryHttp,
  RepositoryFactoryConfig,
  AccountService,
  BlockService,
  CurrencyService,
  MosaicService,
  NamespaceService,
  StateProofService,
  TransactionService,
  MetadataTransactionService,
  AggregateTransactionService,
  MosaicRestrictionTransactionService,
  Deadline
} from "symbol-sdk"

function createRepositoryFactory(url: string, config?: RepositoryFactoryConfig) {
  const factory = new RepositoryFactoryHttp(url, config)
  const repo = {
    account: factory.createAccountRepository(),
    block: factory.createBlockRepository(),
    chain: factory.createChainRepository(),
    finalization: factory.createFinalizationRepository(),
    hashLock: factory.createHashLockRepository(),
    listener: factory.createListener(),
    metadata: factory.createMetadataRepository(),
    mosaic: factory.createMosaicRepository(),
    multisig: factory.createMultisigRepository(),
    namespace: factory.createNamespaceRepository(),
    network: factory.createNetworkRepository(),
    node: factory.createNodeRepository(),
    receipt: factory.createReceiptRepository(),
    restrictionAccount: factory.createRestrictionAccountRepository(),
    restrictionMosaic: factory.createRestrictionMosaicRepository(),
    secretLock: factory.createSecretLockRepository(),
    transaction: factory.createTransactionRepository(),
    transactionStatus: factory.createTransactionStatusRepository(),
  }
  const service = {
    account: new AccountService(factory),
    aggregateTransaction: new AggregateTransactionService(factory),
    block: new BlockService(factory),
    currency: new CurrencyService(factory),
    metadataTransaction: new MetadataTransactionService(repo.metadata),
    mosaicRestrictionTransaction: new MosaicRestrictionTransactionService(repo.restrictionMosaic, repo.namespace),
    mosaic: new MosaicService(repo.account, repo.mosaic),
    namespace: new NamespaceService(repo.namespace),
    stateProof: new StateProofService(factory),
    transaction: new TransactionService(repo.transaction, repo.receipt),
  }
  return {
    factory,
    repo,
    service
  }
}

export function createDeadline(epochAdjustment: number) {
  return function(deadline?: number, chronoUnit?: ChronoUnit) {
    return Deadline.create(epochAdjustment, deadline, chronoUnit)
  }
}






type IHookFunc = (listener: Listener, info?: any) => any
interface IHook {
  onOpen?: IHookFunc
  onStatus?: IHookFunc
  onCosignatureAdded?: IHookFunc
  onUnconfirmed?: IHookFunc
  onConfirmed?: IHookFunc
  onAggregateBondedAdded?: IHookFunc
}

export const listener = (url: string, address: Address, hooks: IHook = {}) => {
  const excerptAddress = address.plain().slice(0,6)
  const nextObserver = (label: string, hook?: IHookFunc) => (info: any) => {
    try {
      consola.info("[%s] %s...\n%s\n", label, excerptAddress, JSON.stringify(info))
    }  catch (error) {
      // consola.error({error})
    }
    finally {
      typeof hook === "function" && hook(listener, info)
    }
  }
  const errorObserver = (error: any) => consola.error(error)

  // リスナーオブジェクトを用意
  const listener = new Listener(url, new NamespaceHttp(url))
  // リスナーを開いて接続を試みる
  listener.open()
    .then(() => {
      hooks.onOpen && hooks.onOpen(listener)
      // 接続されたら各アクションの監視を定義
      listener
        .status(address)
        .subscribe(nextObserver("STATUS", hooks.onStatus), errorObserver)
      listener
        .cosignatureAdded(address)
        .subscribe(nextObserver("COSIGNATURE_ADDED", hooks.onCosignatureAdded), errorObserver)
      listener
        .unconfirmedAdded(address)
        .subscribe(nextObserver("UNCONFIRMED", hooks.onUnconfirmed), errorObserver)
      listener
        .confirmed(address)
        .subscribe(nextObserver("CONFIRMED", hooks.onConfirmed), errorObserver)
      listener
        .aggregateBondedAdded(address)
        .subscribe(nextObserver("AGGREGATE_BONDED_ADDED", hooks.onAggregateBondedAdded), errorObserver)
    })
    .catch(error => consola.error({ error }))
  return listener
}

// 以下は発信時に呼び出す`transactionHttp`のメソッドが異なるだけです。
export const announce = (url: string, tx: SignedTransaction, ...subscriber: any[]) => {
  const transactionHttp = new TransactionHttp(url)
  const observable = transactionHttp.announce(tx)
  announceUtil(observable, url, tx, ...subscriber)
}

export const announceAggregateBonded = (url: string, tx: SignedTransaction, ...subscriber: any[]) => {
  const transactionHttp = new TransactionHttp(url)
  const observable = transactionHttp.announceAggregateBonded(tx)
  announceUtil(observable, url, tx, ...subscriber)
}

export const announceAggregateBondedCosignature = (url: string, tx: CosignatureSignedTransaction, ...subscriber: any[]) => {
  const transactionHttp = new TransactionHttp(url)
  const observable = transactionHttp.announceAggregateBondedCosignature(tx)
  announceUtil(observable, url, tx, ...subscriber)
}

// 発信用の便利関数
const announceUtil = (
  observable$: Observable<TransactionAnnounceResponse>,
  url: string,
  tx: SignedTransaction | CosignatureSignedTransaction,
  ...subscriber: any[]
) => {
  if (0 < subscriber.length && subscriber.length <= 3) {
    return observable$.subscribe(...subscriber)
  }
  // `announce`メソッドに署名済みトランザクションオブジェクトを渡す
  // `subscribe`メソッドで処理が開始される
  return observable$.subscribe(
    resp => {
      // 流れてくるレスポンスは常に成功しか返さないので`tx`の情報を出力する。
      consola.info("[Transaction announced]")
      if(tx instanceof SignedTransaction) {
        consola.info("Endpoint: %s/transaction/%s", url, tx.hash)
        consola.info("Type:     %s", TransactionType[tx.type])
        consola.info("Hash:     %s", tx.hash)
        consola.info("Signer:   %s", tx.signerPublicKey)
        consola.info("Payload:  %s", tx.payload)
      } else {
        consola.info("Endpoint:   %s/transaction/%s", url, tx.parentHash)
        consola.info("Type:       %s", "COSIGNATURE_SIGNED")
        consola.info("ParentHash: %s", tx.parentHash)
        consola.info("Signer:     %s", tx.signerPublicKey)
      }
      consola.info("")
    },
    error => {
      consola.info(
        "Error: %s",
        error.response !== undefined ? error.response.text : error
      )
    }
  )
}
