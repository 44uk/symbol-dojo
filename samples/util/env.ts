import dotenv from "dotenv"

export interface IEnvVars {
  NODE_ENV: string
  GATEWAY_URL: string
  INITIATOR_KEY: string
  ALICE_KEY: string
  BOB_KEY:   string
  CAROL_KEY: string
  DAVE_KEY:  string
  ELLEN_KEY: string
  FRANK_KEY: string
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
  ALICE_KEY: envVars.ALICE_KEY,
  BOB_KEY:   envVars.BOB_KEY,
  CAROL_KEY: envVars.CAROL_KEY,
  DAVE_KEY:  envVars.DAVE_KEY,
  ELLEN_KEY: envVars.ELLEN_KEY,
  FRANK_KEY: envVars.FRANK_KEY,
} as IEnvVars
