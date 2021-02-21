require("utf8")
const {
    Account,
    Deadline,
    SignedTransaction,
    AggregateTransaction,
    TransferTransaction,
    CosignatureTransaction,
    TransactionService,
    TransactionMapping,
    RepositoryFactoryHttp,
    EmptyMessage,
    PlainMessage
} = require("symbol-sdk")
const { forkJoin } = require("rxjs")
const { map, finalize } = require("rxjs/operators")
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

  const deadline = createDeadline(props.epochAdjustment)

  // involved accounts
  const providerAccount = Account.createFromPrivateKey(PROVIDER_KEY, props.networkType)
  const aliceAccount = Account.generateNewAccount(props.networkType)
  const bobAccount   = Account.generateNewAccount(props.networkType)

  // on Provider side -------------------------------------------------------------------------------

  // Alice が送信したいトランザクションを定義するために必要な情報をネットワーク越しに受け取る。
  // 便宜上、オブジェクトを仕様するが、それぞれ文字列の公開鍵・アドレスからオブジェクトを作成できる。
  const requestBody = {
    message: 'A message from Alice to Bob. Alice sent it with no XYM fee.',
    from: aliceAccount.publicKey,
    to: bobAccount.address
  }

  // Provider のサービスがトランザクションを構築する。

  const messageTx = TransferTransaction.create(
    deadline(),
    requestBody.to,
    [],
    PlainMessage.create(requestBody.message),
    props.networkType
  )

  // 署名するトランザクションがないと `Failure_Aggregate_Ineligible_Cosignatories` となってしまう。
  const dummyTx = TransferTransaction.create(
    deadline(),
    providerAccount.address,
    [],
    EmptyMessage,
    props.networkType,
  )

  const aggregateTx = AggregateTransaction.createComplete(
    deadline(),
    [
      // Alice を署名者とする。
      messageTx.toAggregate(aliceAccount.publicAccount),
      dummyTx.toAggregate(providerAccount.publicAccount)
    ],
    props.networkType,
    []
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 1)

  const signedTx = providerAccount.sign(aggregateTx, props.generationHash)

  // Alice へ Provider 署名済みトランザクションを返却。
  // オブジェクトのまま渡せないのでDTO形式にして渡す。
  const signedTxDTO = signedTx.toDTO()

  // on Alice side -------------------------------------------------------------------------------

  // DTO形式でデータを受け取る。
  const restoredAggregateTx = TransactionMapping.createFromPayload(signedTxDTO.payload)

  // 厳密には、Provider によって作られた内容を検証したほうがよい。
  // restoredAggregateTx.innerTransactions

  // 署名済みトランザクションを復元。
  const signedCoTx = CosignatureTransaction.signTransactionPayload(
    aliceAccount,
    signedTxDTO.payload,
    props.generationHash
  )

  // Alice が追加で連署名する。
  const collectedSignedTx = providerAccount.signTransactionGivenSignatures(
    restoredAggregateTx,
    [ signedCoTx ],
    props.generationHash
  )

  // Provider へ署名トランザクションを返却。
  const collectedSignedTxDTO = collectedSignedTx.toDTO()

  // on Provider side -------------------------------------------------------------------------------

  // DTO形式でデータを受け取り、復元する。
  const restoredCollectionSignedTx = new SignedTransaction(
    collectedSignedTxDTO.payload,
    collectedSignedTxDTO.hash,
    collectedSignedTxDTO.signerPublicKey,
    collectedSignedTxDTO.type,
    collectedSignedTxDTO.networkType
  )

  // 以下、署名収集済みアグリゲートコンプリートをアナウンスする処理。
  const listener = factory.createListener()
  const transactionRepo = factory.createTransactionRepository()
  const transactionService = new TransactionService(
    transactionRepo,
    factory.createReceiptRepository()
  )

  console.info('%s: %s/transactionStatus/%s', 'Aggregate', url, signedTx.hash)
  listener.open()
    .then(() => {
      transactionService.announce(restoredCollectionSignedTx, listener)
        .pipe(
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
