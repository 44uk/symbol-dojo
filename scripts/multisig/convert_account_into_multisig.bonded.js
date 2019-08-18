/**
 * $ node multisig/convert_account_into_multisig.bonded.js __TO_BE_MULTIGIS_PRIVATE_KEY__
 */
const {
  Account,
  NetworkType,
  MultisigCosignatoryModification,
  MultisigCosignatoryModificationType,
  ModifyMultisigAccountTransaction,
  NetworkCurrencyMosaic,
  TransactionType,
  AggregateTransaction,
  CosignatureTransaction,
  Deadline
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);

// 引数の秘密鍵のアカウントをマルチシグ候補にする
const toBeMultisig = Account.createFromPrivateKey(
  process.argv[2],
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
const cosigners = [...Array(2)].map((_, idx) => {
  return Account.generateNewAccount(NetworkType.MIJIN_TEST);
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

// 連署アカウントになることを承認するために署名が要求される。
const aggregateTx = AggregateTransaction.createBonded(
  Deadline.create(),
  [ convertIntoMultisigTx.toAggregate(toBeMultisig.publicAccount) ],
  NetworkType.MIJIN_TEST
);

const signedTx = toBeMultisig.sign(aggregateTx, process.env.GENERATION_HASH);

cosigners.forEach(cosigner => {
  util.listener(url, cosigner.address);
});

util.listener(url, toBeMultisig.address, {
  onOpen: () => {
    const hashLockTx = HashLockTransaction.create(
      Deadline.create(),
      NetworkCurrencyMosaic.createRelative(10),
      UInt64.fromUint(480),
      signedTx,
      NetworkType.MIJIN_TEST
    );
    const signedHashLockTx = toBeMultisig.sign(hashLockTx, process.env.GENERATION_HASH);
    util.announce(url, signedHashLockTx)
  },
  onConfirmed: (tx, listener) => {
    if(tx.type === TransactionType.LOCK) {
      util.announceAggregateBonded(url, signedTx);
    } else {
      listener.close()
    }
  },
  onAggregateBondedAdded: (aggTx) => {
    // 各連署アカウントに署名要求を署名させる
    const cosignatureTx = CosignatureTransaction.create(aggTx)
    cosigners.forEach(cosigner => {
      const signedCosignatureTx = cosigner.signCosignatureTransaction(cosignatureTx)
      util.announceAggregateBondedCosignature(url, signedCosignatureTx)
    });
  }
});
