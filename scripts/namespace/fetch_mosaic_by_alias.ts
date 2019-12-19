import {
  NamespaceId,
  NamespaceHttp
} from "nem2-sdk"
import { env } from "../util/env"

if(env.PRIVATE_KEY === undefined) {
  throw new Error("You need to be set env variable PRIVATE_KEY")
}
if(env.GENERATION_HASH === undefined) {
  throw new Error("You need to be set env variable GENERATION_HASH")
}

const url = env.API_URL
const namespace = process.argv[2]

const nsId = new NamespaceId(namespace)
const nsHttp = new NamespaceHttp(url)

console.log("Namespace: %s (%s)", nsId.fullName, nsId.toHex())
console.log("Endpoint:  %s/namespace/%s", url, nsId.toHex())
console.log("")

nsHttp.getLinkedMosaicId(nsId).subscribe(
  data => {
    const mosId = data
    console.log("Namespace: %s", nsId.fullName)
    console.log("MosaicId:  %s [%s, %s]",
      mosId.id.toHex(),
      mosId.id.lower,
      mosId.id.higher
    )
  },
  error => console.error("Error: ", error)
)
