/**
 * $ node scripts/account/fetch_account_info_with_mosaics.js ADDRESS
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
  map,
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

// アカウント情報と保有モザイク情報を組み合わせる
accountHttp.getAccountInfo(address)
  .pipe(
    mergeMap(account => mosaicService.mosaicsAmountViewFromAddress(account.address)
      .pipe(
        mergeMap(_ => _),
        toArray(),
        map(mosaics => ({ account, mosaics }))
      ),
    )
  )
  .subscribe(accountInfoWithMosaicInfoView => {
    // getAccountInfoの情報
    console.log('%o', accountInfoWithMosaicInfoView.account)
    // mosaicsAmountViewFromAddressの情報
    console.log('%o', accountInfoWithMosaicInfoView.mosaics)
  })
;
