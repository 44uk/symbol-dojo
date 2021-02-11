import {
  NamespaceId,
  NamespaceHttp
} from "symbol-sdk"
import { env } from "../util/env"

if(env.INITIATOR_KEY === undefined) {
  throw new Error("You need to be set env variable PRIVATE_KEY")
}
if(env.GENERATION_HASH === undefined) {
  throw new Error("You need to be set env variable GENERATION_HASH")
}

const url = env.GATEWAT_URL
const namespace = process.argv[2]

const nsId = new NamespaceId(namespace)
const nsHttp = new NamespaceHttp(url)

consola.info("Namespace: %s (%s)", nsId.fullName, nsId.toHex())
consola.info("Endpoint:  %s/namespace/%s", url, nsId.toHex())
consola.info("")

nsHttp.getLinkedAddress(nsId).subscribe(
  address => {
    consola.info("Namespace: %s", nsId.fullName)
    consola.info("Address:   %s", address.pretty())
    consola.info("Endpoint:  %s/account/%s", url, address.plain())
  },
  error => consola.error("Error: ", error)
)
