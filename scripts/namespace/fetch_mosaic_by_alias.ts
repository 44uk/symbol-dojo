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

const url = env.API_URL
const namespace = process.argv[2]

const nsId = new NamespaceId(namespace)
const nsHttp = new NamespaceHttp(url)

consola.info("Namespace: %s (%s)", nsId.fullName, nsId.toHex())
consola.info("Endpoint:  %s/namespace/%s", url, nsId.toHex())
consola.info("")

nsHttp.getLinkedMosaicId(nsId).subscribe(
  mosaicId => {
    consola.info("Namespace: %s", nsId.fullName)
    consola.info("MosaicId:  %s [%s, %s]",
      mosaicId.id.toHex(),
      mosaicId.id.lower,
      mosaicId.id.higher
    )
  },
  error => consola.error("Error: ", error)
)
