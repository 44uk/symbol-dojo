/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 10
 */
import {
  Account,
  Address,
  PlainMessage,
  TransferTransaction,
  Deadline,
  NetworkType,
  EmptyMessage
} from "symbol-sdk"

const signer = Account.generateNewAccount(NetworkType.TEST_NET)

const tx = TransferTransaction.create(
  Deadline.create(),
  signer.address,
  [],
  EmptyMessage,
  NetworkType.TEST_NET,
)

signer.sign(tx)


