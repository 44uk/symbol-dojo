/**
 * 0. Install `symbol-sdk`
 * 1. Prepare an account with some `nem.xem`.
 * 2. Run this script.
 * 3. See outgoings.
 *
 * Ex)
 * PRIVATE_KEY=AAAA... API_URL=http://13.114.200.132:3000 node reproduce.js
 */
const nem = require('symbol-sdk');
const crypto = require('crypto');

const url = env.API_URL || 'http://localhost:3000';
const privateKey = env.INITIATOR_KEY;
const initiator = nem.Account.createFromPrivateKey(privateKey, nem.NetworkType.MIJIN_TEST)
const recipient = nem.Account.generateNewAccount(nem.NetworkType.MIJIN_TEST)
const nsString = crypto.randomBytes(8).toString('hex') // get random string for namespace
const nsId = new nem.NamespaceId(nsString);

console.log('Initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Outgoing:  %s/account/%s/transactions/outgoing', url, initiator.publicKey);

console.log('Recipient: %s', recipient.address.pretty());
console.log('Endpoint:  %s/account/%s', url, recipient.address.plain());
console.log('incoming:  %s/account/%s/transactions/incoming', url, recipient.publicKey);

console.log('Namespace: %s', nsString);
console.log('Endpoint:  %s/namespace/%s', url, nsId.toHex());
console.log('');

// recognize recipient address
const transfer0Tx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  recipient.address,
  [],
  nem.PlainMessage.create('Recognize recipient address for network.'),
  nem.NetworkType.MIJIN_TEST
);

// register namespace
const nsRegisterTx = nem.RegisterNamespaceTransaction.createRootNamespace(
  nem.Deadline.create(),
  nsString,
  nem.UInt64.fromUint(10),
  nem.NetworkType.MIJIN_TEST
)

// alias account
const aliasTx = nem.AddressAliasTransaction.create(
  nem.Deadline.create(),
  nem.AliasActionType.Link,
  nsId,
  recipient.address,
  nem.NetworkType.MIJIN_TEST
);

// set Address as recipient
const transfer1Tx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  recipient.address,
  [nem.NetworkCurrencyMosaic.createRelative(1)],
  nem.PlainMessage.create('Send to myself via address.'),
  nem.NetworkType.MIJIN_TEST
);

// set NamespaceId as recipient
const transfer2Tx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  nsId,
  [nem.NetworkCurrencyMosaic.createRelative(1)],
  nem.PlainMessage.create('Send to myself via namespace.'),
  nem.NetworkType.MIJIN_TEST
);

const nsHttp = new nem.NamespaceHttp(url);
const txHttp = new nem.TransactionHttp(url)
const listener = new nem.Listener(url)
let counter = 0
listener.open().then(() => {
  listener.status(initiator.address).subscribe(res => console.log(res))
  listener.confirmed(initiator.address).subscribe(tx => {
    switch (tx.type) {
      case nem.TransactionType.TRANSFER:
        console.log('Transferred.')
        counter++
        break;
      case nem.TransactionType.REGISTER_NAMESPACE:
        console.log('Namespace registered.')
        txHttp.announce(initiator.sign(aliasTx)).subscribe()
        break;
      case nem.TransactionType.ADDRESS_ALIAS:
        console.log('Address aliased.')
        txHttp.announce(initiator.sign(transfer1Tx)).subscribe()
        txHttp.announce(initiator.sign(transfer2Tx)).subscribe()
        break;
      default:
        console.log(tx)
        break;
    }
    if (counter === 1) {
      txHttp.announce(initiator.sign(nsRegisterTx)).subscribe()
    }

    if (counter >= 3) {
      nsHttp.getLinkedAddress(nsId).subscribe(address => {
          console.log('')
          console.log('Namespace: %s', nsId.fullName);
          console.log('Aliased:   %s', address.pretty());
          console.log('')
        },
        err => console.error('Error: ', err)
      );

      console.log('')
      console.log('See transfer transactions.')
      //listener.close()
    }
  })
  txHttp.announce(initiator.sign(transfer0Tx)).subscribe()
})
