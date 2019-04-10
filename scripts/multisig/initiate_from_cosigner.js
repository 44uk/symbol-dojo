/**
 * $ node scripts/multisig/initiate_from_cosigner.js COSIGNATOR_PRIVATE_KEY MULTISIG_PUBLIC_KEY RECIPIENT_ADDRESS AMOUNT
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
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
const amount = parseInt(process.argv[5] || '10');

console.log('Initiater:  %s', initiater.address.pretty());
console.log('Endpoint:   %s/account/%s', url, initiater.address.plain());
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
  nem.EmptyMessage,
  nem.NetworkType.MIJIN_TEST
);

// マルチシグトランザクションはアグリゲートボンドトランザクションとして行う
const multisigTx = nem.AggregateTransaction.createBonded(
  nem.Deadline.create(),
  [transferTx.toAggregate(multisig)],
  nem.NetworkType.MIJIN_TEST
);
const signedMultisigTx = initiater.sign(multisigTx);

util.listener(url, initiater.address, {
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

;(async () => {
  // `cat.currency`のモザイクIDがわかるなら直接でも可能
  // const mosId = new nem.MosaicId('7d09bf306c0b2e38');
  const mosId = await new nem.NamespaceHttp(url)
    .getLinkedMosaicId(new nem.NamespaceId('cat.currency'))
    .toPromise();
  const lockFundMosaic = new nem.Mosaic(mosId, nem.UInt64.fromUint(10000000))
  const lockFundsTx = nem.LockFundsTransaction.create(
    nem.Deadline.create(),
    lockFundMosaic,
    nem.UInt64.fromUint(480),
    signedMultisigTx,
    nem.NetworkType.MIJIN_TEST
  );
  const signedLockFundsTx = initiater.sign(lockFundsTx);
  util.announce(url, signedLockFundsTx)
})();
