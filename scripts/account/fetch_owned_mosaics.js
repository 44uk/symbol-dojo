/**
 * $ node scripts/account/fetch_owned_mosaics.js ADDRESS
 */
const {
  Account,
  NetworkType,
  Address,
  AccountHttp,
  MosaicHttp,
  MosaicService
} = require('nem2-sdk');
const {
  mergeMap,
  toArray
} = require('rxjs/operators')

const url = process.env.API_URL || 'http://localhost:3000';

let address = '';
if(process.env.PRIVATE_KEY) {
  const initiator = Account.createFromPrivateKey(
    process.env.PRIVATE_KEY,
    NetworkType.MIJIN_TEST
  );
  address = initiator.address;
} else {
  address = Address.createFromRawAddress(process.argv[2]);
}

const accountHttp = new AccountHttp(url);
const mosaicHttp = new MosaicHttp(url);
const mosaicService = new MosaicService(accountHttp, mosaicHttp);

// アカウントが保有するモザイクを取得する
mosaicService.mosaicsAmountViewFromAddress(address)
  .pipe(
    mergeMap(_ => _),
    toArray()
  )
  .subscribe(mosaicAmountViews => {
    console.log('%o', mosaicAmountViews);
  })
;
