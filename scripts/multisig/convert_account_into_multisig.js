/**
 * $ node multisig/convert_account_into_multisig.js
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

const minApprovalDelta = 2; // 2人の承認が必要
const minRemovalDelta = 2; // 連署者を外すには2人に承認が必要

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
  console.log('');
}

// 便宜上連署者として新しいアカウントを生成してマルチシグを構築します。
const accounts = [...Array(3)].map((_, idx) => {
  return Account.generateNewAccount(NetworkType.MIJIN_TEST);
});

// 1つ目のアカウントをマルチシグ候補にする
const toBeMultisig = accounts[0];
// それ以降は連署者候補とする
const cosigners = accounts.slice(1);
// 環境変数にセットしているアカウントも連署者として追加する
cosigners.push(initiator);

// マルチシグアカウントとするアカウント情報を表示
showAccountInfo(toBeMultisig, 'Multisig Account');

// 連署者とするアカウントの公開アカウントの集合を作る
const cosignerPublicAccounts = cosigners.map((account, idx) => {
  showAccountInfo(account, `Cosigner Account${idx+1}:`)
  return account.publicAccount
});

// 連署者の追加定義集合を作る
const cosignatoryModifications = cosignerPublicAccounts.map(publicAccount => {
  return new MultisigCosignatoryModification(
    MultisigCosignatoryModificationType.Add,
    publicAccount
  );
});

const convertIntoMultisigTx = ModifyMultisigAccountTransaction.create(
  Deadline.create(),
  minApprovalDelta,
  minRemovalDelta,
  cosignatoryModifications,
  NetworkType.MIJIN_TEST
);

// 実際はAggregateTransaction.createBondedメソッドを使い連署アカウントに署名を求める。
// 今回は連署アカウントの秘密鍵がわかっているのでそれらを利用して署名してしまう。
const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [ convertIntoMultisigTx.toAggregate(toBeMultisig.publicAccount) ],
  NetworkType.MIJIN_TEST
);

util.listener(url, toBeMultisig.address, {
  onOpen: () => {
    // signTransactionWithCosignatoriesを使う
    const signedTx = toBeMultisig.signTransactionWithCosignatories(
      aggregateTx,
      cosigners,
      process.env.GENERATION_HASH
    );
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
