import { NetworkType } from "symbol-sdk"
import dotenv from "dotenv"

export interface IEnvVars {
  NODE_ENV: string
  API_URL: string
  NETWORK_TYPE: NetworkType
  GENERATION_HASH: string
  EPOCH_ADJUSTMENT: number
  INITIATOR_KEY: string
}

type INETWORK_TYPE = "MAIN_NET" | "TEST_NET" | "PRIVATE" | "PRIVATE_TEST"

dotenv.config()

const DEFAULT_VARS = {
  API_URL: "http://localhost:3000",
  NETWORK_TYPE: NetworkType.TEST_NET,
} as const

const envVars = process.env

if(envVars.API_URL !== undefined && !/https?:\/\//.test(envVars.API_URL)) {
  throw new Error(`You need to be set valid API_URL: ${envVars.API_URL}`)
}

if(envVars.NETWORK_TYPE_NAME !== undefined && !/(MAIN_NET|TEST_NET|PRIVATE|PRIVATE_TEST)/.test(envVars.NETWORK_TYPE_NAME)) {
  throw new Error(`You need to be set valid NETWORK_TYPE_NAME: ${envVars.NETWORK_TYPE_NAME}`)
}

if(envVars.GENERATION_HASH === undefined) {
  throw new Error(`You need to be set GENERATION_HASH: ${envVars.GENERATION_HASH}`)
}

if(envVars.EPOCH_ADJUSTMENT === undefined) {
  throw new Error(`You need to be set EPOCH_ADJUSTMENT: ${envVars.EPOCH_ADJUSTMENT}`)
}

if(envVars.INITIATOR_KEY === undefined) {
  throw new Error(`You need to be set PRIVATE_KEY: ${envVars.INITIATOR_KEY}`)
}

export const env = {
  NODE_ENV: envVars.NODE_ENV,
  API_URL: envVars.API_URL || DEFAULT_VARS.API_URL,
  NETWORK_TYPE: NetworkType[(envVars.NETWORK_TYPE_NAME || DEFAULT_VARS.NETWORK_TYPE) as INETWORK_TYPE],
  GENERATION_HASH: envVars.GENERATION_HASH,
  EPOCH_ADJUSTMENT: parseInt(envVars.EPOCH_ADJUSTMENT),
  INITIATOR_KEY: envVars.INITIATOR_KEY,
} as IEnvVars
