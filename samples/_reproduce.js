require("utf8")
const {
    Account,
    Deadline,
    AggregateTransaction,
    TransferTransaction,
    HashLockTransaction,
    CosignatureTransaction,
    EmptyMessage,
    PlainMessage,
    RepositoryFactoryHttp,
    TransactionService,
    UInt64
} = require("symbol-sdk")
const { forkJoin } = require("rxjs")
const { tap, map, mergeMap, finalize } = require("rxjs/operators")
const { inspect } = require('util')

const GATEWAY_URL  = 'http://api-01.ap-northeast-1.testnet.symboldev.network:3000'
const PROVIDER_KEY = '49035383BFB5D8D2DD4D4CEDE0283CDCA4744C67BECFAA8659DBFB897BB39DA1'
// pub:  8B26F80D9F6B943FA4E20764DCD0239D353A63436A1CCDB3A02F51652FB81C7F
// addr: TBQCAS-XNAYHC-S4UB7D-5P4VAX-G4SY46-CE72W7-UBI

function pp(object) {
    console.log(inspect(object, { depth: null }))
}

function createDeadline(adj) {
  return (hour) => Deadline.create(adj, hour)
}

async function main(url) {
  // get properties
  const factory = new RepositoryFactoryHttp(url)
  const networkRepo = factory.createNetworkRepository()
  const props = await forkJoin({
    currency: factory.getCurrencies().pipe(
      map(({ currency }) => currency)
    ),
    epochAdjustment: factory.getEpochAdjustment(),
    generationHash: factory.getGenerationHash(),
    networkType: factory.getNetworkType(),
    nodePublicKey: factory.getNodePublicKey(),
    minFeeMultiplier: networkRepo.getTransactionFees().pipe(
      map(({ minFeeMultiplier }) => minFeeMultiplier)
    )
  }).toPromise()
  pp(props)

  const deadline = createDeadline(props.epochAdjustment)

  // involved accounts
  const providerAccount = Account.createFromPrivateKey(PROVIDER_KEY, props.networkType)
  const aliceAccount = Account.generateNewAccount(props.networkType)
  const bobAccount   = Account.generateNewAccount(props.networkType)

  // P -(xym for fee)-> A -(message)-> B
  const messageTx = TransferTransaction.create(
    deadline(),
    bobAccount.address,
    [],
    PlainMessage.create("A message from Alice to Bob."),
    props.networkType
  ).setMaxFee(props.minFeeMultiplier)

  const transferTx = TransferTransaction.create(
    deadline(),
    aliceAccount.address,
    [], // [ props.currency.createAbsolute(messageTx.maxFee) ], // xym for fee
    EmptyMessage,
    props.networkType,
  )

  // aggregate them
  const aggregateTx = AggregateTransaction.createBonded(
    deadline(),
    [ transferTx.toAggregate(providerAccount.publicAccount),
      messageTx.toAggregate(aliceAccount.publicAccount) ],
    props.networkType
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 1)

  const signedTx = providerAccount.sign(aggregateTx, props.generationHash)

  // for aggregateBonded
  const hashLockTx = HashLockTransaction.create(
    deadline(),
    props.currency.createRelative(10),
    UInt64.fromUint(300),
    signedTx,
    props.networkType
  ).setMaxFee(props.minFeeMultiplier)

  const signedHLTx = providerAccount.sign(hashLockTx, props.generationHash)
  console.info('%s:  %s/transactionStatus/%s', 'HashLock', url, signedHLTx.hash)

  const listener = factory.createListener()
  const transactionRepo = factory.createTransactionRepository()
  const transactionService = new TransactionService(
    transactionRepo,
    factory.createReceiptRepository()
  )

  listener.open()
    .then(() => {
      transactionService.announceHashLockAggregateBonded(signedHLTx, signedTx, listener)
        .pipe(
          tap(resp =>  {
            console.info('%s:  %s/transactions/confirmed/%s', 'HashLock', url, signedHLTx.hash)
            console.info('%s: %s/transactionStatus/%s', 'Aggregate', url, signedTx.hash)
          }),
          mergeMap(aggregateTx => {
            const coTx = CosignatureTransaction.create(aggregateTx)
            const signedCoTx = aliceAccount.signCosignatureTransaction(coTx)
            return transactionRepo.announceAggregateBondedCosignature(signedCoTx)
          }),
          finalize(() => listener.close())
        )
        .subscribe(
          () => {
            console.info('%s: %s/transactions/confirmed/%s', 'Aggregate', url, signedTx.hash)
          }
        )
    })
}

main(GATEWAY_URL).then(() => {})
