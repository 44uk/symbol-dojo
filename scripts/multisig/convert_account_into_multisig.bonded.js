/**
 * $ node scripts/multisig/convert_account_into_multisig.bonded.js __TO_BE_MULTIGIS_PRIVATE_KEY__
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

// 引数の秘密鍵のアカウントをマルチシグ候補にする
const toBeMultisig = nem.Account.createFromPrivateKey(
  process.argv[2],
  nem.NetworkType.MIJIN_TEST
);

const minApprovalDelta = 2; // 2人の承認が必要
const minRemovalDelta = 2; // 連署者を外すには2人に承認が必要

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
  console.log('');
}

// 便宜上連署者として新しいアカウントを生成してマルチシグを構築します。
const cosigners = [...Array(2)].map((_, idx) => {
  return nem.Account.generateNewAccount(nem.NetworkType.MIJIN_TEST);
});
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

// 連署アカウントになることを承認するために署名が要求される。
const aggregateTx = nem.AggregateTransaction.createBonded(
  nem.Deadline.create(),
  [ convertIntoMultisigTx.toAggregate(toBeMultisig.publicAccount) ],
  nem.NetworkType.MIJIN_TEST
);

const signedTx = toBeMultisig.sign(aggregateTx, process.env.GENERATION_HASH);

cosigners.forEach(cosigner => {
  util.listener(url, cosigner.address);
});

util.listener(url, toBeMultisig.address, {
  onOpen: () => {
    const hashLockTx = nem.HashLockTransaction.create(
      nem.Deadline.create(),
      nem.NetworkCurrencyMosaic.createRelative(10),
      nem.UInt64.fromUint(480),
      signedTx,
      nem.NetworkType.MIJIN_TEST
    );
    const signedHashLockTx = toBeMultisig.sign(hashLockTx, process.env.GENERATION_HASH);
    util.announce(url, signedHashLockTx)
  },
  onConfirmed: (tx, listener) => {
    if(tx.type === nem.TransactionType.LOCK) {
      util.announceAggregateBonded(url, signedTx);
    } else {
      listener.close()
    }
  },
  onAggregateBondedAdded: (aggTx) => {
    // 各連署アカウントに署名要求を署名させる
    const cosignatureTx = nem.CosignatureTransaction.create(aggTx)
    cosigners.forEach(cosigner => {
      const signedCosignatureTx = cosigner.signCosignatureTransaction(cosignatureTx)
      util.announceAggregateBondedCosignature(url, signedCosignatureTx)
    });
  }
});
