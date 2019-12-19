import {
  Address,
  Listener,
  TransactionHttp,
  SignedTransaction,
  CosignatureSignedTransaction,
  TransactionAnnounceResponse,
} from "nem2-sdk"
import { Observable } from "rxjs"

type IHookFunc = (listener: Listener, info?: any) => any
interface IHook {
  onOpen?: IHookFunc
  onStatus?: IHookFunc
  onUnconfirmed?: IHookFunc
  onConfirmed?: IHookFunc
  onAggregateBondedAdded?: IHookFunc
  onCosignatureAdded?: IHookFunc
}

export const listener = (url: string, address: Address, hooks: IHook = {}) => {
  const excerptAddress = address.plain().slice(0,6)
  const nextObserver = (label: string, hook?: IHookFunc) => (info: any) => {
    try {
      console.log("[%s] %s...\n%s\n", label, excerptAddress, JSON.stringify(info))
    }  catch (error) {
      // console.error({error})
    }
    finally {
      typeof hook === "function" && hook(listener, info)
    }
  }
  const errorObserver = (error: any) => console.error(error)
  // リスナーオブジェクトを用意
  const listener = new Listener(url)
  // リスナーを開いて接続を試みる
  listener.open().then(() => {
    hooks.onOpen && hooks.onOpen(listener)
    // 接続されたら各アクションの監視を定義
    listener
      .status(address)
      .subscribe(nextObserver("STATUS", hooks.onStatus), errorObserver)
    listener
      .unconfirmedAdded(address)
      .subscribe(nextObserver("UNCONFIRMED", hooks.onUnconfirmed), errorObserver)
    listener
      .confirmed(address)
      .subscribe(nextObserver("CONFIRMED", hooks.onConfirmed), errorObserver)
    listener
      .aggregateBondedAdded(address)
      .subscribe(nextObserver("AGGREGATE_BONDED_ADDED", hooks.onAggregateBondedAdded), errorObserver)
    listener
      .cosignatureAdded(address)
      .subscribe(nextObserver("COSIGNATURE_ADDED", hooks.onCosignatureAdded), errorObserver)
  })
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
  observable: Observable<TransactionAnnounceResponse>,
  url: string,
  tx: SignedTransaction | CosignatureSignedTransaction,
  ...subscriber: any[]
) => {
  if (0 < subscriber.length && subscriber.length <= 3) {
    return observable.subscribe(...subscriber)
  }
  // `announce`メソッドに署名済みトランザクションオブジェクトを渡す
  // `subscribe`メソッドで処理が開始される
  return observable.subscribe(
    () => {
      // 流れてくるレスポンスは常に成功しか返さないので、
      // `tx`の情報を出力する。
      console.log("[Transaction announced]")
      if(tx instanceof SignedTransaction) {
        console.log("Endpoint: %s/transaction/%s", url, tx.hash)
        console.log("Type:     %s", tx.type)
        console.log("Hash:     %s", tx.hash)
        console.log("Signer:   %s", tx.signerPublicKey)
      } else {
        console.log("Endpoint:   %s/transaction/%s", url, tx.parentHash)
        console.log("Type:       %s", "CosignatureSigned")
        console.log("ParentHash: %s", tx.parentHash)
        console.log("Signer:     %s", tx.signerPublicKey)
      }
      console.log("")
    },
    error => {
      console.log(
        "Error: %s",
        error.response !== undefined ? error.response.text : error
      )
    }
  )
}

export const p = console.log.bind(console)
