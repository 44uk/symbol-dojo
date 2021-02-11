import { TransferTransaction, Deadline, Account, NetworkType, EmptyMessage, SignedTransaction, TransactionHttp, NetworkCurrencyPublic } from "symbol-sdk"
import NODELIST from "./nodelist.json"

type INodeList = typeof NODELIST

const GEN_HASH = '1DFB2FAA9E7F054168B0C5FCB84F4DEB62CC2B4D317D861F3168D161F54EA78B'
const KEY_A = 'E403558E9BA46882C096C2DA99711CAA68A9D864362614C399B40F5C41CAF941'
const KEY_B = 'FE2DC8A0A2C3F1CA85268667F84001C4F8293879980D3450BC27F2BE5826EB91'
const KEY_C = 'C1665EBBF49504C589A2AE88647644539DF6B1C95E90E62A91B9147AC7B20A6E'

const account = {
  A: Account.createFromPrivateKey(KEY_A, NetworkType.TEST_NET),
  B: Account.createFromPrivateKey(KEY_B, NetworkType.TEST_NET),
  C: Account.createFromPrivateKey(KEY_C, NetworkType.TEST_NET),
}

console.debug(
  account.A.privateKey,
  account.B.privateKey,
  account.C.privateKey,
)

function createTx(sender: Account, recipient: Account, amount: number, mul: number): SignedTransaction {
  const tx = TransferTransaction.create(
    Deadline.create(4),
    recipient.address,
    [NetworkCurrencyPublic.createRelative(amount)],
    EmptyMessage,
    NetworkType.TEST_NET,
  ).setMaxFee(mul) as TransferTransaction
  return sender.sign(tx, GEN_HASH)
}

const txes = [
  createTx(account.A, account.B, 100,    100),
  createTx(account.A, account.B, 100, 200000),
  createTx(account.B, account.C,  20, 200000),
  createTx(account.C, account.B,   5, 600000),
] as SignedTransaction[]

const txHttpAnnounceIteration = (nodeList: INodeList) => {
  return () => {
    return new TransactionHttp("http://api-01.ap-northeast-1.096x.symboldev.network:3000")
  }

  let cursor = 0
  const txHttpLists = nodeList.map(n => new TransactionHttp(n.url))
  return () => {
    cursor < txHttpLists.length ? cursor++ : 0
    return txHttpLists[cursor]
  }
}

const txHttpAnnounceIterator = txHttpAnnounceIteration(NODELIST)
for(let i = 0; i < txes.length; i++) {
  txHttpAnnounceIterator().announce(txes[i])
    .toPromise()
    .then(resp => console.debug(resp))
}

export {}
