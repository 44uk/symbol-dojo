/**
 * PRIVATE_KEY=AAAA... API_URL=http://13.114.200.132:3000 GENERATION_HASH=BBBB... node supply_mutable_is_not_working.js
 */
const {
  Account,
  NetworkType,
  TransactionType,
  MosaicSupplyType,
  Mosaic,
  MosaicNonce,
  MosaicId,
  MosaicProperties,
  MosaicDefinitionTransaction,
  MosaicSupplyChangeTransaction,
  AggregateTransaction,
  TransferTransaction,
  TransactionHttp,
  MosaicHttp,
  EmptyMessage,
  Listener,
  UInt64,
  Deadline
} = require('symbol-sdk');
const {
  mergeMap
} = require('rxjs/operators');

const genHash = env.GENERATION_HASH;
const url = env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  NetworkType.MIJIN_TEST
);
const recipient = Account.generateNewAccount(
  NetworkType.MIJIN_TEST
);

const txHttp = new TransactionHttp(url);
const mosaicHttp = new MosaicHttp(url);
const listener = new Listener(url);

// 1. create a mosaic.
const supply = process.argv[2] || 1000000;
const blocks = 10000;
const nonce = MosaicNonce.createRandom();
const mosId = MosaicId.createFromNonce(nonce, initiator.publicAccount);

console.log('Initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Nonce:     %s', nonce.toDTO());
console.log('MosaicHex: %s', mosId.toHex());
console.log('Blocks:    %s', blocks ? blocks : 'Infinity');
console.log('Supply:    %s', supply);
console.log('Endpoint:  %s/mosaic/%s', url, mosId.toHex());
console.log('');

const definitionTx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  mosId,
  MosaicProperties.create({
    duration: UInt64.fromUint(blocks),
    divisibility: 0,
    supplyMutable: false, // <- set supply mutable `FALSE`
    transferable: true,
    levyMutable: false
  }),
  NetworkType.MIJIN_TEST
);

const supplyTx1 = MosaicSupplyChangeTransaction.create(
  Deadline.create(),
  mosId,
  MosaicSupplyType.Increase,
  UInt64.fromUint(supply),
  NetworkType.MIJIN_TEST
);

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [
    definitionTx.toAggregate(initiator.publicAccount),
    supplyTx1.toAggregate(initiator.publicAccount)
  ],
  NetworkType.MIJIN_TEST,
  []
);

const supplyTx2 = MosaicSupplyChangeTransaction.create(
  Deadline.create(),
  mosId,
  MosaicSupplyType.Increase,
  UInt64.fromUint(supply),
  NetworkType.MIJIN_TEST
);

const transferTx = TransferTransaction.create(
  Deadline.create(),
  recipient.address,
  [new Mosaic(mosId, UInt64.fromUint(1))],
  EmptyMessage,
  NetworkType.MIJIN_TEST
)

listener.open().then(() => {
  listener.status(initiator.address).subscribe(error => console.error({ error }))
  listener.confirmed(initiator.address).subscribe(tx => {
    switch (tx.type) {
      case TransactionType.AGGREGATE_COMPLETE:
        console.log('confirmed: AGGREGATE_COMPLETE')

        // waiting for sync API cache
        setTimeout(() => {
          txHttp.announce(initiator.sign(transferTx, genHash))
            .pipe(
              mergeMap(_ => mosaicHttp.getMosaic(mosId))
            )
            .subscribe(
              mosaic => {
                console.log('Supply:  ', mosaic.supply.compact());
                console.log('Mutable: ', mosaic.isSupplyMutable());
                // REVIEW: Expected: *10000*
                console.log('Duration:', mosaic.duration.compact());
                console.log('Height:  ', mosaic.height.compact());
                console.log('Revision:', mosaic.revision);
                console.log('');
                // REVIEW: Expected: *Failure_Mosaic_Supply_Immutable*
                txHttp.announce(initiator.sign(supplyTx2, genHash)).subscribe();
              },
              error => console.log({ error })
            )
          ;

          // mosaicHttp.getMosaic(mosId).subscribe(
          //   mosaic => {
          //     console.log('Supply:  ', mosaic.supply.compact());
          //     console.log('Mutable: ', mosaic.isSupplyMutable());
          //     // REVIEW: Expected: *10000*
          //     console.log('Duration:', mosaic.duration.compact());
          //     console.log('Height:  ', mosaic.height.compact());
          //     console.log('Revision:', mosaic.revision);
          //     console.log('');
          //     // REVIEW: Expected: *Failure_Mosaic_Supply_Immutable*
          //     txHttp.announce(initiator.sign(supplyTx2, genHash)).subscribe();
          //   },
          //   error => console.log({ error })
          // )
        }, 1000);
        break;
      case TransactionType.MOSAIC_SUPPLY_CHANGE:
        console.log('confirmed: MOSAIC_SUPPLY_CHANGE')
        // waiting for sync API cache
        setTimeout(() => {
          mosaicHttp.getMosaic(mosId).subscribe(
            mosaic => {
              console.log('Supply:  ', mosaic.supply.compact());
              console.log('Mutable: ', mosaic.isSupplyMutable());
              // REVIEW: Expected: *10000*
              console.log('Duration:', mosaic.duration.compact());
              console.log('Height:  ', mosaic.height.compact());
              console.log('Revision:', mosaic.revision);
              console.log('');
              listener.close();
            },
            error => console.log({ error })
          )
        }, 1000);
        break;
      default:
        // console.log('%o', tx);
        break;
    }
  })

  const signedTx = initiator.sign(aggregateTx, genHash);
  txHttp.announce(signedTx).subscribe();
});
