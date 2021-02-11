import { NetworkType, Account, PublicAccount, TransferTransaction, Deadline, UInt64, Mosaic, PlainMessage, AggregateTransaction, MosaicId, HashLockTransaction, Listener, TransactionService,
  RepositoryFactoryHttp,
} from "symbol-sdk";

// replace with network type
const networkType = NetworkType.TEST_NET;
// replace with alice private key
const alicePrivateKey = 'CFA930155E0C59940F1C84506579B9270AC763DE8C06EF1EA6853F8E4255BC6B';
const aliceAccount = Account.createFromPrivateKey(alicePrivateKey, networkType);
// replace with ticket distributor public key
const ticketDistributorPublicKey = 'D32941E452555F1FD90E789F2EA6B122BE2D1528A7AEC8313C61E84F50A61BCC';
const ticketDistributorPublicAccount = PublicAccount.createFromPublicKey(ticketDistributorPublicKey, networkType);
// replace with ticket mosaic id
const ticketMosaicId = new MosaicId('5B6EA2463449B855');
// replace with ticket mosaic id divisibility
const ticketDivisibility = 0;
// replace with nem.xem id
const networkCurrencyMosaicId = new MosaicId('75AF035421401EF0');
// replace with network currency divisibility
const networkCurrencyDivisibility = 6;

const aliceToTicketDistributorTx = TransferTransaction.create(
    Deadline.create(),
    ticketDistributorPublicAccount.address,
    [new Mosaic (networkCurrencyMosaicId,
        UInt64.fromUint(100 * Math.pow(10, networkCurrencyDivisibility)))],
    PlainMessage.create('send 100 nem.xem to distributor'),
    networkType);

const ticketDistributorToAliceTx = TransferTransaction.create(
    Deadline.create(),
    aliceAccount.address,
    [new Mosaic(ticketMosaicId,
        UInt64.fromUint(1 * Math.pow(10, ticketDivisibility)))],
    PlainMessage.create('send 1 museum ticket to customer'),
    networkType);



const aggregateTransaction = AggregateTransaction.createBonded(Deadline.create(),
  [aliceToTicketDistributorTx.toAggregate(aliceAccount.publicAccount),
    ticketDistributorToAliceTx.toAggregate(ticketDistributorPublicAccount)],
  networkType,
  [],
  UInt64.fromUint(2000000));

// replace with meta.generationHash (nodeUrl + '/block/1')
const networkGenerationHash = 'CC42AAD7BD45E8C276741AB2524BC30F5529AF162AD12247EF9A98D6B54A385B';
const signedTransaction = aliceAccount.sign(aggregateTransaction, networkGenerationHash);
console.log('Aggregate Transaction Hash:', signedTransaction.hash);



const hashLockTransaction = HashLockTransaction.create(
  Deadline.create(),
  new Mosaic (networkCurrencyMosaicId,
      UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))),
  UInt64.fromUint(480),
  signedTransaction,
  networkType,
  UInt64.fromUint(2000000));

const signedHashLockTransaction = aliceAccount.sign(hashLockTransaction, networkGenerationHash);

// replace with node endpoint
const nodeUrl = 'http://api-harvest-20.us-west-1.nemtech.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl, networkType, networkGenerationHash);
const listener = repositoryFactory.createListener();
const receiptHttp = repositoryFactory.createReceiptRepository();
const transactionHttp = repositoryFactory.createTransactionRepository();
const transactionService = new TransactionService(transactionHttp, receiptHttp);

listener.open().then(() => {
  transactionService.announceHashLockAggregateBonded(signedHashLockTransaction, signedTransaction, listener);
  listener.close();
});
