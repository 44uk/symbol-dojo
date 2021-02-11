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

const fromKeyWallet = SimpleWallet.createFromPrivateKey(
  "from-key-wallet",
  pwd,
  initiator.privateKey,
  env.NETWORK_TYPE
)

consola.info(fromKeyWallet.encryptedPrivateKey)

const account = fromKeyWallet.open(pwd)

consola.info(account)
