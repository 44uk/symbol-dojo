import {
  Account,
  Deadline,
  EmptyMessage,
  NetworkType,
  TransferTransaction
} from "symbol-sdk"

const account = Account.generateNewAccount(NetworkType.TEST_NET)

const transperTx = TransferTransaction.create(
  Deadline.create(),
  account.address,
  [],
  EmptyMessage,
  NetworkType.MAIN_NET
)

console.debug(transperTx.size)
