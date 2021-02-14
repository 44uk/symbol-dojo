import fs from 'fs'
import { Account } from 'symbol-sdk'
import { INetworkStaticProps, networkStaticPropsUtil } from './announce'

const GATEWAY_URL = 'http://api-01.ap-northeast-1.testnet.symboldev.network:3000'
const ENV_PATH = `${__dirname}/../.env`

if(fs.existsSync(ENV_PATH)) {
  console.warn(`Already exists .env (${ENV_PATH})`)
  process.exit()
}

function main(props: INetworkStaticProps) {
  const generateAccountBlock = (name: string) => {
    const account = Account.generateNewAccount(props.networkType)
    return `
${name}=${account.privateKey}
# publicKey: ${account.publicKey}
# address:   ${account.address.pretty()}`
  }

  fs.writeFileSync(ENV_PATH, `
GATEWAY_URL=${GATEWAY_URL}
${generateAccountBlock('INITIATOR_KEY')}
${generateAccountBlock('ALICE_KEY')}
${generateAccountBlock('BOB_KEY')}
${generateAccountBlock('CAROL_KEY')}
${generateAccountBlock('DAVE_KEY')}
${generateAccountBlock('ELLEN_KEY')}`)
}

networkStaticPropsUtil(GATEWAY_URL).toPromise()
  .then(props => main(props))
