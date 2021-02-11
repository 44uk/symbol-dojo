import { getHashes, createHash } from "crypto"
import { sha3_256 } from "js-sha3"
import * as base32 from "hi-base32"
import { NetworkType, Account, Address } from "symbol-sdk"

const newAccount = Account.generateNewAccount(NetworkType.TEST_NET)

console.log("privateKey:\t%s", newAccount.privateKey)
console.log("publicKey:\t%s", newAccount.publicKey)
console.log("Address:\t%s", newAccount.address.plain())

console.log("Address:\t%s", Address.createFromPublicKey(newAccount.publicKey, NetworkType.TEST_NET).plain())

// console.log(getHashes())

const key = newAccount.publicKey
console.log("key:\t%s", key)

console.log("hash:\t%s", sha3_256.hex(key))
const publicKeyHash = sha3_256.arrayBuffer(key);
console.log("publicKeyHash: %s", Buffer.from(new Uint8Array(publicKeyHash)).toString("hex"))
const digest1 = createHash("sha3-256").update(key).digest("hex")
console.log("digest:\t%s", digest1)

const ripemd160 = createHash("ripemd160").update(digest1).digest("hex")
console.log("ripemd160:\t%s", ripemd160)
// 前20Byte取り出す

const network = NetworkType.TEST_NET.toString(16)
console.log("network:\t%s", network)

const joined1 = network + ripemd160
console.log("joined:\t%s", joined1)

const digest2 = createHash("sha3-256").update(joined1).digest("hex")
console.log("digest2:\t%s", digest2)

const checksum = digest2.slice(0, 6)
console.log("checksum:\t%s", checksum)

const joined2 = joined1 + checksum
console.log("joined2:\t%s", joined2)

const address = base32.encode(joined2)
console.log("address:\t%s", address)


// return this.address.match(/.{1,6}/g)!.join('-');
