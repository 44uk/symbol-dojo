import { Account, AggregateTransaction, CosignatureSignedTransaction, NetworkType, RepositoryFactoryHttp } from "symbol-sdk"

export function createHttpRepository(config: { url: string, generationHash: string, networkType: NetworkType }) {
  return new RepositoryFactoryHttp(config.url, {
    generationHash: config.generationHash,
    networkType: config.networkType,
  })
}

export function showAccount(account: Account) {
  console.debug("priv:\t%s\npub: \t%s\naddr:\t%s",
    account.privateKey,
    account.publicKey,
    account.address.plain()
  )
}

//export function buildRecordTx(): AggregateTransaction {
//
//}

// export function buildSignTx(): CosignatureSignedTransaction{
//
// }
