/**
 * $ node scripts/multisig/setup_mlms.js PUBLIC_KEY
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);
const cosignerPublicAccount = nem.PublicAccount.createFromPublicKey(
  process.argv[2],
  nem.NetworkType.MIJIN_TEST
)

console.log('initiator: %s', initiator.address.pretty());
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
  return nem.Account.generateNewAccount(nem.NetworkType.MIJIN_TEST);
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
  return new nem.MultisigCosignatoryModification(
    nem.MultisigCosignatoryModificationType.Add,
    account.publicAccount
  );
});

// いずれかの連署者が署名すれば承認とみなすため、`minApprovalDelta`は`1`とする
const convertLeftIntoMultisigTx = nem.ModifyMultisigAccountTransaction.create(
  nem.Deadline.create(),
  1, // minApprovalDelta
  2, // minRemovalDelta
  leftCosignatoryModifications,
  nem.NetworkType.MIJIN_TEST
);

// -----------------------------------------------------------------------------

// Rightをマルチシグにする
const rightCosignatoryModifications = rightCosigners.map((account, idx) => {
  showAccountInfo(account, `Right Cosigner Account${idx+1}:`)
  return new nem.MultisigCosignatoryModification(
    nem.MultisigCosignatoryModificationType.Add,
    account.publicAccount
  );
});

// 2人が署名して承認とみなすため、`minApprovalDelta`は`2`とする
const convertRightIntoMultisigTx = nem.ModifyMultisigAccountTransaction.create(
  nem.Deadline.create(),
  2, // minApprovalDelta
  2, // minRemovalDelta
  rightCosignatoryModifications,
  nem.NetworkType.MIJIN_TEST
);

// -----------------------------------------------------------------------------

// Rootをマルチシグにする
const cosignatoryModifications = [
  new nem.MultisigCosignatoryModification(
    nem.MultisigCosignatoryModificationType.Add,
    toBeLeftMultisig.publicAccount
  ),
  new nem.MultisigCosignatoryModification(
    nem.MultisigCosignatoryModificationType.Add,
    toBeRightMultisig.publicAccount
  )
];

// 2つのマルチシグアカウントが承認して承認とみなすため、`minApprovalDelta`は`2`とする
const convertIntoMultisigTx = nem.ModifyMultisigAccountTransaction.create(
  nem.Deadline.create(),
  2, // minApprovalDelta
  2, // minRemovalDelta
  cosignatoryModifications,
  nem.NetworkType.MIJIN_TEST
);

const aggregateTx = nem.AggregateTransaction.createComplete(
  nem.Deadline.create(),
  [
    convertLeftIntoMultisigTx.toAggregate(toBeLeftMultisig.publicAccount),
    convertRightIntoMultisigTx.toAggregate(toBeRightMultisig.publicAccount),
    convertIntoMultisigTx.toAggregate(toBeMultisig.publicAccount)
  ],
  nem.NetworkType.MIJIN_TEST
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
