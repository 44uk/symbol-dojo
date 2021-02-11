/**
 * $ ts-node multisig/convert_multisig.js
 */
const nem = require('symbol-sdk');
const util = require('../util');

const url = env.API_URL || 'http://localhost:3000';

const multisig = nem.Account.generateNewAccount(nem.NetworkType.MIJIN_TEST);
const alice = nem.Account.generateNewAccount(nem.NetworkType.MIJIN_TEST);
const bob = nem.Account.generateNewAccount(nem.NetworkType.MIJIN_TEST);
const carol = nem.Account.generateNewAccount(nem.NetworkType.MIJIN_TEST);
const dave = nem.Account.generateNewAccount(nem.NetworkType.MIJIN_TEST);

const showAccountInfo = (account, label = null) => {
  label && console.log(label);
  console.log('Private:  %s', account.privateKey);
  console.log('Public:   %s', account.publicKey);
  console.log('Address:  %s', account.address.pretty());
  console.log('Endpoint: %s/account/%s', url, account.address.plain());
  console.log('Endpoint: %s/account/%s/multisig', url, account.address.plain());
  console.log('');
}
showAccountInfo(alice, 'Alice')
showAccountInfo(bob, 'Bob')
showAccountInfo(carol, 'Carol')
showAccountInfo(dave, 'Dave')
showAccountInfo(multisig, 'Multisig')
console.log('')

const sleep = new Promise((r, _) => setTimeout(r, 5000));

const cosignatoryModifications1 = [
  new nem.MultisigCosignatoryModification(
    nem.MultisigCosignatoryModificationType.Add,
    alice.publicAccount
  ),
  new nem.MultisigCosignatoryModification(
    nem.MultisigCosignatoryModificationType.Add,
    bob.publicAccount
  ),
  // new nem.MultisigCosignatoryModification(
  //   nem.MultisigCosignatoryModificationType.Add,
  //   carol.publicAccount
  // )
];
const convertIntoMultisigTx1 = nem.ModifyMultisigAccountTransaction.create(
  nem.Deadline.create(),
  1, // minApprovalDelta,
  1, // minRemovalDelta,
  cosignatoryModifications1,
  nem.NetworkType.MIJIN_TEST
);

const cosignatoryModifications2 = [
  new nem.MultisigCosignatoryModification(
    // nem.MultisigCosignatoryModificationType.Add,
    // carol.publicAccount
    nem.MultisigCosignatoryModificationType.Remove,
    bob.publicAccount
  )
];
const convertIntoMultisigTx2 = nem.ModifyMultisigAccountTransaction.create(
  nem.Deadline.create(),
  0, // minApprovalDelta,
  0, // minRemovalDelta,
  cosignatoryModifications2,
  nem.NetworkType.MIJIN_TEST
);

util.listener(url, alice.address, {
});

util.listener(url, multisig.address, {
  onOpen: () => {
    const signedTx = multisig.sign(convertIntoMultisigTx1);
    util.announce(url, signedTx);
  },
  onConfirmed: async (tx) => {
    if(tx.type == nem.TransactionType.MODIFY_MULTISIG_ACCOUNT) {
      const aggregateTx = nem.AggregateTransaction.createComplete(
        nem.Deadline.create(),
        [convertIntoMultisigTx2.toAggregate(multisig.publicAccount)],
        nem.NetworkType.MIJIN_TEST
      )
      const signedMultisigTx = dave.sign(aggregateTx);
      util.announce(url, signedMultisigTx)

      // const aggregateTx = nem.AggregateTransaction.createBonded(
      //   nem.Deadline.create(),
      //   [convertIntoMultisigTx2.toAggregate(multisig.publicAccount)],
      //   nem.NetworkType.MIJIN_TEST
      // )
      // const signedMultisigTx = alice.sign(aggregateTx);

      // const mosId = new nem.MosaicId('7d09bf306c0b2e38');
      // const lockFundMosaic = new nem.Mosaic(mosId, nem.UInt64.fromUint(10000000))
      // const lockFundsTx = nem.LockFundsTransaction.create(
      //   nem.Deadline.create(),
      //   lockFundMosaic,
      //   nem.UInt64.fromUint(480),
      //   signedMultisigTx,
      //   nem.NetworkType.MIJIN_TEST
      // );
      // const signedLockFundsTx = alice.sign(lockFundsTx);
      // util.announce(url, signedLockFundsTx)
    }
  }
});

