/**
 * $ node scripts/multisig/initiate_from_cosigner.js COSIGNATOR_PRIVATE_KEY MULTISIG_PUBLIC_KEY RECIPIENT_ADDRESS AMOUNT
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);
const cosignator = nem.Account.createFromPrivateKey(
  process.argv[2],
  nem.NetworkType.MIJIN_TEST
);
const multisig = nem.PublicAccount.createFromPublicKey(
  process.argv[3],
  nem.NetworkType.MIJIN_TEST
);
const recipient = nem.Address.createFromRawAddress(process.argv[4]);
const amount = parseInt(process.argv[5] || '0');

console.log('initiator:  %s', initiator.address.pretty());
console.log('Endpoint:   %s/account/%s', url, initiator.address.plain());
console.log('Cosignator: %s', cosignator.address.pretty());
console.log('Endpoint:   %s/account/%s', url, cosignator.address.plain());
console.log('Multisig:   %s', multisig.address.pretty());
console.log('Endpoint:   %s/account/%s', url, multisig.address.plain());
console.log('Amount:     %d', amount);
console.log('Recipient:  %s', recipient.pretty());
console.log('Endpoint:   %s/account/%s', url, recipient.plain());
console.log('');

const transferTx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  recipient,
  [nem.NetworkCurrencyMosaic.createRelative(amount)],
  new nem.PlainMessage('Send from multisig.'),
  nem.NetworkType.MIJIN_TEST
);

// マルチシグトランザクションはアグリゲートボンドトランザクションとして行う
const multisigTx = nem.AggregateTransaction.createBonded(
  nem.Deadline.create(),
  [ transferTx.toAggregate(multisig) ],
  nem.NetworkType.MIJIN_TEST
);
const signedMultisigTx = initiator.sign(multisigTx, process.env.GENERATION_HASH);

util.listener(url, initiator.address, {
  onOpen: () => {
    const lockFundsTx = nem.LockFundsTransaction.create(
      nem.Deadline.create(),
      nem.NetworkCurrencyMosaic.createRelative(10),
      nem.UInt64.fromUint(480),
      signedMultisigTx,
      nem.NetworkType.MIJIN_TEST
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
    const cosignatureTx = nem.CosignatureTransaction.create(aggregateTx)
    const signedCosignatureTx = cosignator.signCosignatureTransaction(cosignatureTx)
    util.announceAggregateBondedCosignature(url, signedCosignatureTx)
  }
});
