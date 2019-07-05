/**
 * $ node scripts/multisig/initiate_from_cosigner.js COSIGNATOR_PRIVATE_KEY MULTISIG_PUBLIC_KEY RECIPIENT_ADDRESS AMOUNT
 */
const {
  Account,
  PublicAccount,
  NetworkType,
  Address,
  NetworkCurrencyMosaic,
  PlainMessage,
  TransferTransaction,
  AggregateTransaction,
  LockFundsTransaction,
  CosignatureTransaction,
  UInt64,
  Deadline
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);
const cosignator = Account.createFromPrivateKey(
  process.argv[2],
  NetworkType.MIJIN_TEST
);
const multisig = PublicAccount.createFromPublicKey(
  process.argv[3],
  NetworkType.MIJIN_TEST
);
const recipient = Address.createFromRawAddress(process.argv[4]);
const amount = parseInt(process.argv[5] || '0');

console.log('Initiator:  %s', initiator.address.pretty());
console.log('Endpoint:   %s/account/%s', url, initiator.address.plain());
console.log('Cosignator: %s', cosignator.address.pretty());
console.log('Endpoint:   %s/account/%s', url, cosignator.address.plain());
console.log('Multisig:   %s', multisig.address.pretty());
console.log('Endpoint:   %s/account/%s', url, multisig.address.plain());
console.log('Amount:     %d', amount);
console.log('Recipient:  %s', recipient.pretty());
console.log('Endpoint:   %s/account/%s', url, recipient.plain());
console.log('');

const transferTx = TransferTransaction.create(
  Deadline.create(),
  recipient,
  [NetworkCurrencyMosaic.createRelative(amount)],
  new PlainMessage('Transaction from multisig account signed by cosigner.'),
  NetworkType.MIJIN_TEST
);

// マルチシグトランザクションはアグリゲートボンドトランザクションとして行う
const multisigTx = AggregateTransaction.createBonded(
  Deadline.create(),
  [ transferTx.toAggregate(multisig) ],
  NetworkType.MIJIN_TEST
);
const signedMultisigTx = initiator.sign(multisigTx, process.env.GENERATION_HASH);

util.listener(url, initiator.address, {
  onOpen: () => {
    const lockFundsTx = LockFundsTransaction.create(
      Deadline.create(),
      NetworkCurrencyMosaic.createRelative(10),
      UInt64.fromUint(480),
      signedMultisigTx,
      NetworkType.MIJIN_TEST
    );
    const signedLockFundsTx = initiator.sign(lockFundsTx, process.env.GENERATION_HASH);
    util.announce(url, signedLockFundsTx)
  },
  onConfirmed: () => {
    // LockFundが承認されたらアグリゲートトランザクションを発信
    util.announceAggregateBonded(url, signedMultisigTx);
  },
  onAggregateBondedAdded: (aggregateTx) => {
    // 連署者が署名することでマルチシグアカウントからのモザイク送信を承認する
    const cosignatureTx = CosignatureTransaction.create(aggregateTx)
    const signedCosignatureTx = cosignator.signCosignatureTransaction(cosignatureTx)
    util.announceAggregateBondedCosignature(url, signedCosignatureTx)
  }
});
