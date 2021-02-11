import dotenv from "dotenv"

export interface IEnvVars {
  NODE_ENV: string
  GATEWAY_URL: string
  INITIATOR_KEY: string
}

dotenv.config()

const DEFAULT_VARS = {
  GATEWAY_URL: "http://localhost:3000"
} as const

const envVars = process.env

if(envVars.GATEWAY_URL !== undefined && !/https?:\/\//.test(envVars.GATEWAY_URL)) {
  throw new Error(`You need to be set valid GATEWAT_URL: ${envVars.GATEWAY_URL}`)
}

if(envVars.INITIATOR_KEY === undefined) {
  throw new Error(`You need to be set PRIVATE_KEY: ${envVars.INITIATOR_KEY}`)
}

export const env = {
  NODE_ENV: envVars.NODE_ENV,
  GATEWAY_URL: envVars.GATEWAY_URL || DEFAULT_VARS.GATEWAY_URL,
  INITIATOR_KEY: envVars.INITIATOR_KEY,
} as IEnvVars
