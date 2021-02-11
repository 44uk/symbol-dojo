import { mergeMap, tap } from "rxjs/operators"
import { Account, NetworkType, AggregateTransaction, TransferTransaction, MultisigAccountModificationTransaction, Deadline, EmptyMessage, HashLockTransaction, UInt64, RepositoryFactoryHttp, NetworkCurrencies, TransactionService, Currency, MosaicId } from "symbol-sdk"

async function main() {

// const url = "http://sym-coreall-trace-dev.opening-line.jp:3000"
// const gen = "9810B9385466107D29F2756781DF34FEB87B10877981D20CF3B871B8C262B99E"
// const epoch = 1573430400

const url = "http://api-01.ap-northeast-1.testnet.symboldev.network:3000"
const gen = "45FBCF2F0EA36EFA7923C9BC923D6503169651F7FA4EFC46A8EAF5AE09057EBD"
const epoch = 1573430400

// TAXDG42TFE6X3QDFX75T35P2YFU3FCMGCDYCHSI
// A81D221D8CF4BB913472F120C7E8A7813E67F3613A597473327629713100C655
const key = "1E8D0554D28645109E8A53B7B64F5CAB1D51EC9A0CF10501F33BFC721284EC36"
const networkType = NetworkType.TEST_NET
const NetworkCurrencyLocal = Currency.PUBLIC
// const NetworkCurrencyLocal = new Currency({
//   mosaicId: new MosaicId('138B9F3E3EBF6928'),
//   divisibility: 6,
//   transferable: true,
//   supplyMutable: false,
//   restrictable: false,
// })

const factory = new RepositoryFactoryHttp(url, {
  // epochAdjustment: epoch,
  generationHash: gen,
  networkType: networkType,
})

// const epoch = await factory.getEpochAdjustment().toPromise()

const trace = Account.createFromPrivateKey(key, networkType)
const initiator = Account.generateNewAccount(networkType)
const cosign1 = Account.generateNewAccount(networkType)
const cosign2 = Account.generateNewAccount(networkType)

const recordTx = TransferTransaction.create(
  Deadline.create(epoch),
  trace.address,
  [],
  EmptyMessage,
  networkType
)
const maModTx = MultisigAccountModificationTransaction.create(
  Deadline.create(epoch),
  2, 2,
  [ cosign1.address, cosign2.address ], [],
  networkType
)
const aggBondedTx = AggregateTransaction.createBonded(
  Deadline.create(epoch),
  [ recordTx.toAggregate(initiator.publicAccount),
    maModTx.toAggregate(trace.publicAccount) ],
  networkType,
  []
).setMaxFeeForAggregate(500, 3)

const signedAggBondedTx = trace.signTransactionWithCosignatories(
  aggBondedTx, [
    initiator,
  ], gen
)

const hashLockTx = HashLockTransaction.create(
  Deadline.create(epoch),
  NetworkCurrencyLocal.createRelative(10),
  UInt64.fromUint(5000), // NOTE: 特に根拠はない数値です
  signedAggBondedTx,
  networkType
).setMaxFee(500)
const signedHLTx = trace.sign(hashLockTx, gen)

const txRepo = factory.createTransactionRepository()
const receiptRepo = factory.createReceiptRepository()
const listener = factory.createListener()
const txService = new TransactionService(txRepo, receiptRepo)

listener.open()
  .then(() => {
    console.debug("open")
    console.debug(signedHLTx.hash)
    console.debug(signedAggBondedTx.hash)

    listener.status(trace.address)
      .subscribe(
        data => console.debug("status %o", data)
      )
    listener.aggregateBondedAdded(trace.address)
      .subscribe(
        data => console.debug("aggregateBondedAdded %o", data)
      )
    listener.aggregateBondedAdded(cosign1.address)
      .subscribe(
        data => console.debug("aggregateBondedAdded %o", data)
      )

    listener.confirmed(trace.address)
      .pipe(
        tap(_ => console.debug("confirmed: %o", _)),
        mergeMap(() => txService.announceAggregateBonded(signedAggBondedTx, listener))
      )
      .subscribe(
        data => {
          console.debug("agg bonded confirmed %o", data)
        }
      )

    txService.announce(signedHLTx, listener)
      .pipe(
        tap(_ => console.debug("announce: %o", _))
      )
      .subscribe(
        data => {} // console.debug(data)
        // data => console.debug(data)
      )
  })
  .catch(_ => console.log("caught %o", _))
}

main()
