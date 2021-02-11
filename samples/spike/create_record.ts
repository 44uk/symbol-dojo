import { mergeMap, tap } from "rxjs/operators"
import { Account, AggregateTransaction, Deadline, EmptyMessage, HashLockTransaction, Mosaic, MosaicId, MultisigAccountModificationTransaction, NetworkCurrencyPublic, PlainMessage, RepositoryFactoryHttp, Transaction, TransactionService, TransactionType, TransferTransaction, UInt64 } from "symbol-sdk"

import config from "./config"
import { createHttpRepository, showAccount } from "./util"

const repo = createHttpRepository(config)
const listener = repo.createListener()
const txRepo = repo.createTransactionRepository()
const receiptRepo = repo.createReceiptRepository()
const txService = new TransactionService(
  txRepo, receiptRepo
)

const banker    = Account.createFromPrivateKey('CDA5E04F1A81CE9C0A8AF2214A2F881177203D877DFBD0EDE90430DD5FBE6DA6', config.networkType)

const document  = Account.generateNewAccount(config.networkType)
const initiator = Account.createFromPrivateKey('1DF64CD72FE8FD1E4B4FAB6F9F2EAEA863B4479480FDBFDEFC327B908B2B59B8', config.networkType)
const cosigner1 = Account.createFromPrivateKey('7FD7D991B797A7EAB6A452D651A42729361B3FB58E3AF7410F4A8B005D783648', config.networkType)
const cosigner2 = Account.createFromPrivateKey('EAB6A452D651A42729361B3F7D7D991B797A7FB58E3AF7410F4A8B005D783648', config.networkType)

showAccount(document)
showAccount(initiator)
showAccount(cosigner1)
showAccount(cosigner2)

const message = PlainMessage.create(JSON.stringify({
  fileHash: 'XXXXXXXXXXXXX'
}))

const recordTx = TransferTransaction.create(
  Deadline.create(),
  document.address,
  [],
  message,
  config.networkType,
)
const maModTx = MultisigAccountModificationTransaction.create(
  Deadline.create(),
  1,
  1,
  [
    initiator.address,
    cosigner1.address,
    cosigner2.address,
  ],
  [],
  config.networkType
)

const aggBondedTx = AggregateTransaction.createBonded(
  Deadline.create(),
  [
    recordTx.toAggregate(initiator.publicAccount),
    maModTx.toAggregate(document.publicAccount),
  ],
  config.networkType,
  []
)

const signedAggBondedTx = document.signTransactionWithCosignatories(
  aggBondedTx, [
    initiator,
    // cosigner1,
    // cosigner2,
  ], config.generationHash
)

const hashLockTx = HashLockTransaction.create(
  Deadline.create(),
  NetworkCurrencyPublic.createRelative(20),
  // new Mosaic(new MosaicId("5B66E76BECAD0860"), UInt64.fromUint(15 * 1000000)),
  UInt64.fromUint(5000),
  signedAggBondedTx,
  config.networkType
)

const signedHLTx = document.sign(hashLockTx, config.generationHash)

const transferTx = TransferTransaction.create(
  Deadline.create(),
  document.address,
  [],
  // [new Mosaic(new MosaicId("613F1DEB05C90BB0"), UInt64.fromUint(10000000))],
  EmptyMessage,
  config.networkType
)
const signedTrTx = banker.sign(transferTx, config.generationHash)

// txRepo.announce(signedTrTx)
//   .subscribe(
//     resp => {
//       console.debug(resp)
//     },
//     (error) => console.error(error)
//   )

listener.open()
  .then(() => {
    console.debug("Opened listener")
    const obs$ = txService.announce(signedTrTx, listener)
    obs$
      .subscribe(
        resp => {
          console.debug(resp)
        },
        (error) => console.error(error)
      )
    // txService.announce(signedTrTx, listener)
    //   .pipe(
    //     tap(() => console.debug("Announced for Hashlock")),
    //     tap(() => console.debug("Announce for HashlockAggregateBonded")),
    //     mergeMap(() => txService.announceHashLockAggregateBonded(signedHLTx, signedAggBondedTx, listener)),
    //     tap(() => console.debug("done")),
    //     // mergeMap(() => txService.announce(signedHLTx, listener)),
    //     // mergeMap(() => txService.announceAggregateBonded(signedAggBondedTx, listener)),
    //   )
    //   .subscribe(
    //     resp => {
    //       console.debug(resp)
    //     },
    //     (error) => console.error(error)
    //   )
  })
  .catch(_ => console.error(_))

// listener.open()
//   .then(() => {
//     txService.announce(signedTrTx, listener)
//       .pipe(
//         mergeMap(() => txService.announceHashLockAggregateBonded(
//           signedHLTx,
//           signedAggBondedTx,
//           listener
//         )),
//       )
//       .subscribe(
//         resp => {
//           console.debug(resp)
//         },
//         (error) => console.error(error)
//       )
//   })
//   .catch(_ => console.error(_))

// listener.open()
//   .then(() => {
//     listener.confirmed(document.address)
//       .subscribe(
//         resp => {
//           switch(resp.type) {
//             case TransactionType.TRANSFER:
//               console.debug("got mosaic")
//               console.debug(resp.transactionInfo?.hash)
//               break;
//             case TransactionType.HASH_LOCK:
//               console.debug("got hash lock")
//               console.debug(resp.transactionInfo?.hash)
//               txRepo.announceAggregateBonded(signedAggBondedTx)
//               break;
//             default:
//               console.debug(resp)
//               listener.close()
//               break;
//           }
//         }
//       )
//     listener.status(document.address)
//       .subscribe(
//         resp => {
//           console.debug(resp)
//           listener.close()
//         }
//       )
//
//     listener.confirmed(banker.address)
//       .subscribe(
//         resp => {
//           console.debug("banker")
//           const tx = resp as HashLockTransaction
//           console.debug(tx.hasMissingSignatures())
//           txRepo.announce(signedHLTx)
//         }
//       )
//   })
//   .catch(_ => _)
//
// txRepo.announce(signedTrTx)
