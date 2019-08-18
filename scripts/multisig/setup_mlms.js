/**
 * $ node multisig/setup_mlms.js
 */
const {
  Account,
  NetworkType,
  MultisigCosignatoryModification,
  MultisigCosignatoryModificationType,
  ModifyMultisigAccountTransaction,
  AggregateTransaction,
  Deadline,
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);

console.log('Initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('');

const showAccountInfo = (account, label = null) => {
  label && console.log(label);
  console.log('Private:  %s', account.privateKey);
  console.log('Public:   %s', account.publicKey);
  console.log('Address:  %s', account.address.pretty());
  console.log('Endpoint: %s/account/%s', url, account.address.plain());
  console.log('Endpoint: %s/account/%s/multisig', url, account.address.plain());
  console.log('Endpoint: %s/account/%s/multisig/graph', url, account.address.plain());
  console.log('');
}

// 便宜上連署者として新しいアカウントを生成してマルチシグを構築します。
const accounts = [...Array(7)].map((_, idx) => {
  return Account.generateNewAccount(NetworkType.MIJIN_TEST);
});

// 1つ目のアカウントを最上位のマルチシグ候補にする
const toBeMultisig = accounts[0];
// 2,3つ目のアカウントをMLMS候補にする
const toBeLeftMultisig = accounts[1];
const toBeRightMultisig = accounts[2];
// 左辺の連署者候補
const leftCosigners = accounts.slice(3, 5);
// 右辺の連署者候補
const rightCosigners = accounts.slice(5, 7);

// マルチシグアカウントとするアカウント情報を表示
showAccountInfo(toBeMultisig, 'Root Multisig Account');
showAccountInfo(toBeLeftMultisig, 'Left Multisig Account');
showAccountInfo(toBeRightMultisig, 'Right Multisig Account');

// -----------------------------------------------------------------------------

// Leftをマルチシグにする
const leftCosignatoryModifications = leftCosigners.map((account, idx) => {
  showAccountInfo(account, `Left Cosigner Account${idx+1}:`)
  return new MultisigCosignatoryModification(
    MultisigCosignatoryModificationType.Add,
    account.publicAccount
  );
});

// いずれかの連署者が署名すれば承認とみなすため、`minApprovalDelta`は`1`とする
const convertLeftIntoMultisigTx = ModifyMultisigAccountTransaction.create(
  Deadline.create(),
  1, // minApprovalDelta
  2, // minRemovalDelta
  leftCosignatoryModifications,
  NetworkType.MIJIN_TEST
);

// -----------------------------------------------------------------------------

// Rightをマルチシグにする
const rightCosignatoryModifications = rightCosigners.map((account, idx) => {
  showAccountInfo(account, `Right Cosigner Account${idx+1}:`)
  return new MultisigCosignatoryModification(
    MultisigCosignatoryModificationType.Add,
    account.publicAccount
  );
});

// 2人が署名して承認とみなすため、`minApprovalDelta`は`2`とする
const convertRightIntoMultisigTx = ModifyMultisigAccountTransaction.create(
  Deadline.create(),
  2, // minApprovalDelta
  2, // minRemovalDelta
  rightCosignatoryModifications,
  NetworkType.MIJIN_TEST
);

// -----------------------------------------------------------------------------

// Rootをマルチシグにする
const cosignatoryModifications = [
  new MultisigCosignatoryModification(
    MultisigCosignatoryModificationType.Add,
    toBeLeftMultisig.publicAccount
  ),
  new MultisigCosignatoryModification(
    MultisigCosignatoryModificationType.Add,
    toBeRightMultisig.publicAccount
  )
];

// 2つのマルチシグアカウントが承認して承認とみなすため、`minApprovalDelta`は`2`とする
const convertIntoMultisigTx = ModifyMultisigAccountTransaction.create(
  Deadline.create(),
  2, // minApprovalDelta
  2, // minRemovalDelta
  cosignatoryModifications,
  NetworkType.MIJIN_TEST
);

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [
    convertLeftIntoMultisigTx.toAggregate(toBeLeftMultisig.publicAccount),
    convertRightIntoMultisigTx.toAggregate(toBeRightMultisig.publicAccount),
    convertIntoMultisigTx.toAggregate(toBeMultisig.publicAccount)
  ],
  NetworkType.MIJIN_TEST
);

util.listener(url, toBeMultisig.address, {
  onOpen: () => {
    const signedTx = toBeMultisig.signTransactionWithCosignatories(
      aggregateTx,
      [ toBeLeftMultisig, ...leftCosigners,
        toBeRightMultisig, ...rightCosigners ],
      process.env.GENERATION_HASH
    );
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
