import { RepositoryFactoryHttp, NetworkType, TransferTransaction, Deadline, Account, PlainMessage, TransactionService } from "symbol-sdk";
import { from } from "rxjs";
import { mergeMap, finalize } from "rxjs/operators";

function byteSize(str: string) { return new Blob([str]).size }

const key = "68742475D10803338970B04BA205F1566E30A90AE82A615849FE633096D9646C"
const account = Account.createFromPrivateKey(key, NetworkType.TEST_NET);
const nodeUrl = 'http://api-01.ap-southeast-1.096x.symboldev.network:3000';
const gen = "1DFB2FAA9E7F054168B0C5FCB84F4DEB62CC2B4D317D861F3168D161F54EA78B"
const rawText = "あ".repeat(341)
const message  = PlainMessage.create(rawText)

console.debug(byteSize(rawText))

Buffer.from(rawText, 'utf-8').toString('hex').toUpperCase()

console.debug(
  message.payload,
  message.payload.length,
)

const repositoryFactory = new RepositoryFactoryHttp(
  nodeUrl, {
    generationHash: gen,
    networkType: NetworkType.TEST_NET
  }
);
const txHttp = repositoryFactory.createTransactionRepository()
const reHttp = repositoryFactory.createReceiptRepository()
const listener = repositoryFactory.createListener()
const txService = new TransactionService(txHttp, reHttp)

const tx = TransferTransaction.create(
  Deadline.create(),
  account.address,
  [],
  message,
  NetworkType.TEST_NET,
).setMaxFee(500) as TransferTransaction

const signed = account.sign(tx, gen)

from(listener.open())
  .pipe(
    mergeMap(() => txService.announce(signed, listener)),
    finalize(() => listener.close())
  )
  .subscribe(
    resp => {
      console.debug({ resp })
    },
    error => {
      console.error({ error })
    },
  )

// txHttp.announce(signed)
//   .subscribe(() => {
//     console.debug("announce!")
//   })
