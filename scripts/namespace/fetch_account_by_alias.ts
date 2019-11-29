import {
  NamespaceId,
  NamespaceHttp
} from 'nem2-sdk'
import { env } from '../env'

if(env.PRIVATE_KEY === undefined) {
  throw new Error('You need to be set env variable PRIVATE_KEY')
}
if(env.GENERATION_HASH === undefined) {
  throw new Error('You need to be set env variable GENERATION_HASH')
}

const url = env.API_URL || 'http://localhost:3000'
const namespace = process.argv[2]

const nsId = new NamespaceId(namespace)
const nsHttp = new NamespaceHttp(url)

console.log('Namespace: %s (%s)', nsId.fullName, nsId.toHex())
console.log('Endpoint:  %s/namespace/%s', url, nsId.toHex())
console.log('')

nsHttp.getLinkedAddress(nsId).subscribe(
  data => {
    const address = data
    console.log('Namespace: %s', nsId.fullName)
    console.log('Address:   %s', address.pretty())
    console.log('Endpoint:  %s/account/%s', url, address.plain())
  },
  error => console.error('Error: ', error)
)
