/**
 * $ node scripts/multisig/convert_multisig.js
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const minApprovalDelta = 2;
const minRemovalDelta = 2;

console.log('Initiater: %s', initiater.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiater.address.plain());
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
  return nem.Account.generateNewAccount(nem.NetworkType.MIJIN_TEST);
});

// 1つ目のアカウントをマルチシグ候補にする
const toBeMultisig = accounts[0]
// それ以降は連署者候補とする
const cosigners = accounts.slice(1)
// 環境変数にセットしているアカウントも連署者として追加する
cosigners.push(initiater)

// マルチシグアカウントとするアカウント情報を表示
showAccountInfo(toBeMultisig, 'Multisig Account')

// 連署者とするアカウントの公開アカウントの集合を作る
const cosignerPublicAccounts = cosigners.map((account, idx) => {
  showAccountInfo(account, `Cosigner Account${idx+1}:`)
  return account.publicAccount
})

// 連署者の追加定義集合を作る
const cosignatoryModifications = cosignerPublicAccounts.map(publicAccount => {
  return new nem.MultisigCosignatoryModification(
    nem.MultisigCosignatoryModificationType.Add,
    publicAccount
  );
});

const convertIntoMultisigTx = nem.ModifyMultisigAccountTransaction.create(
  nem.Deadline.create(),
  minApprovalDelta,
  minRemovalDelta,
  cosignatoryModifications,
  nem.NetworkType.MIJIN_TEST
);

util.listener(url, toBeMultisig.address, {
  onOpen: () => {
    const signedTx = toBeMultisig.sign(convertIntoMultisigTx);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
