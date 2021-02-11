import {
  SimpleWallet,
  Account,
  Password,
  NetworkType,
  ISimpleWalletDTO
} from "symbol-sdk"
import { env } from "../util"

const name = "A-Wallet"
const rawPassword = "testtest"

const account = Account.generateNewAccount(NetworkType.TEST_NET)
consola.info(account.privateKey)
const password = new Password(rawPassword)
const wallet = SimpleWallet.createFromPrivateKey(name, password, account.privateKey, NetworkType.TEST_NET)
const jsonWallet = JSON.stringify({
  name: wallet.name,
  network: wallet.network,
  address: wallet.address.toDTO(),
  creationDate: wallet.creationDate.toString(),
  encryptedPrivateKey: wallet.encryptedPrivateKey,
  schema: wallet.schema
} as ISimpleWalletDTO)

consola.info(jsonWallet)

const attrs2 = JSON.parse(jsonWallet)
const wallet2 = SimpleWallet.createFromDTO({ ...attrs2 })

const account2 = wallet2.open(new Password("WRONG_PASSWORD"))

consola.info(account2.privateKey)
