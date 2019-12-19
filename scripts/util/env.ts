import { NetworkType } from "nem2-sdk"

const {
  PRIVATE_KEY,
  GENERATION_HASH,
  API_URL,
  NETWORK_TYPE
} = process.env

if(PRIVATE_KEY === undefined) {
  throw new Error("You need to be set PRIVATE_KEY")
}
if(GENERATION_HASH === undefined) {
  throw new Error("You need to be set GENERATION_HASH")
}
if(API_URL && !/https?:\/\//.test(API_URL)) {
  throw new Error("You need to be set valid API_URL")
}
if(NETWORK_TYPE && !/(MIJIN_TEST|MIJIN|TEST_NET|MAIN_NET)/.test(NETWORK_TYPE)) {
  throw new Error("You need to be set valid NETWORK_TYPE (MIJIN_TEST|MIJIN|TEST_NET|MAIN_NET)")
}

type nType = "MIJIN_TEST" | "MIJIN" | "TEST_NET" | "MAIN_NET"

export const env = {
  PRIVATE_KEY,
  GENERATION_HASH,
  API_URL: API_URL || "http://localhost:3000",
  NETWORK_TYPE: NETWORK_TYPE && NetworkType[NETWORK_TYPE as nType] || NetworkType.MIJIN_TEST
} as const
