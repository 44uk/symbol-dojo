import consola from "consola"
import { inspect } from 'util'
import { Transaction } from 'symbol-sdk'

export function printTx(transaction: Transaction) {
  consola.info(inspect(transaction, {
    depth: null
  }))
}
