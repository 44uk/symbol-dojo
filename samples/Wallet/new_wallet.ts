import consola from "consola"
import {
  SimpleWallet,
  Account,
  Password
} from "symbol-sdk"
import { env } from "../util"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)

const pwd = new Password("P@ssW0rd!")

const newWallet = SimpleWallet.create(
  "new-wallet",
  pwd,
  env.NETWORK_TYPE
)

consola.info(newWallet)

const account = newWallet.open(pwd)

consola.info(account)
