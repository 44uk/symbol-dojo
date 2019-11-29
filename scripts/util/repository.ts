import {
  RepositoryFactoryHttp,
  RepositoryFactoryConfig
} from "symbol-sdk"

export const repositoryFactory = (url: string, config: RepositoryFactoryConfig = {}) => {
  const repo = new RepositoryFactoryHttp(url, config)

  const props = {
    repositoryFactory: repo,
    account: repo.createAccountRepository(),
    block: repo.createBlockRepository(),
    chain: repo.createChainRepository(),
    listener: repo.createListener(),
    metadada: repo.createMetadataRepository(),
    mosaic: repo.createMosaicRepository(),
    multisig: repo.createMultisigRepository(),
    namespace: repo.createNamespaceRepository(),
    network: repo.createNetworkRepository(),
    node: repo.createNodeRepository(),
    receipt: repo.createReceiptRepository(),
    restrictionAccount: repo.createRestrictionAccountRepository(),
    restrictionMosaic: repo.createRestrictionMosaicRepository(),
    transaction: repo.createTransactionRepository(),
    transactionStatus: repo.createTransactionStatusRepository(),
    generationHash: repo.getGenerationHash,
    networkType: repo.getNetworkType,
  }

  return props
}
