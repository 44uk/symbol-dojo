import consola from "consola"
import { inspect } from 'util'

export function prettyPrint(object: any) {
  consola.info(inspect(object, {
    depth: null
  }))
}
