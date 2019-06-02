# モザイクとは

`nem`ネットワーク上に通貨を定義する機能です。

- [モザイク — NEM Developer Center](https://nemtech.github.io/ja/concepts/mosaic.html)

基軸モザイクである`cat.currency`もモザイクで、それと同等の定義となります。

モザイクには作成時に設定できる定義があります。

- 有効ブロック数(未定義の場合は無期限)
- 可分性(少数の最小値)
- 転送許可
- 供給量変更許可
- Levy変更許可

モザイク供給量はモザイク作成後に設定するトランザクションを発信します。

モザイクは`75caa6b686e7e7ba`というようなネットワーク上で一意なIDを持ちます。

先のネームスペースがこのモザイクIDと紐づくことで`test123`という名称のモザイクとして認識されるようになります。

モザイクについて`nem1`の仕様を知っている方は「おや？」と感じたかと思いますが、これについては後の仕様変更にて触れます。


## モザイクの用途

モザイクは独自のサービス用通貨として、保有によるフラグ制御や値の表現として、発行者と受信者間だけでやり取りされる権利の表現としてなど、

モザイクをどう使うかはそのサービス提供者の手腕が問われます。


## モザイクの作成

`scripts/create_mosaic.js`を実行してください。

このコードはモザイクが有効であるブロック数を引数にとります。

指定しない場合は`duration: undefined`となり無期限のモザイクとなります。

なお、モザイクの定義にはその定義内容にかかわらず`cat:currency`が`500.000000`必要です。

```javascript
$ node scripts/mosaic/create_mosaic.js 10000
Initiater:    SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:     http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Mosaic Nonce: 114,2,14,52
Mosaic Hex:   75caa6b686e7e7ba
Endpoint:     http://localhost:3000/mosaic/75caa6b686e7e7ba

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743
Hash:     164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16717,"networkType":144,"version":3,"deadline":{"value":"2019-03-23T14:29:05.013"},"fee":{"lower":0,"higher":0},"signature":"8CC42F39B802038A2D06ADC46C4EFDE17B6C1330779B3AC913D310BCAFC5AA85C2EF35230A4255C37D12079739699EF9E3148F93120B6B94F7F7BE47C0377F03","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743","merkleComponentHash":"164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743"},"nonce":873333362,"mosaicId":{"id":{"lower":2263345082,"higher":1976215222}},"mosaicProperties":{"divisibility":0,"duration":{"lower":10000,"higher":0},"supplyMutable":true,"transferable":true,"levyMutable":false}}

[CONFIRMED] SCGUWZ...
{"type":16717,"networkType":144,"version":3,"deadline":{"value":"2019-03-23T14:29:05.013"},"fee":{"lower":0,"higher":0},"signature":"8CC42F39B802038A2D06ADC46C4EFDE17B6C1330779B3AC913D310BCAFC5AA85C2EF35230A4255C37D12079739699EF9E3148F93120B6B94F7F7BE47C0377F03","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":4653,"higher":0},"hash":"164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743","merkleComponentHash":"164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743"},"nonce":873333362,"mosaicId":{"id":{"lower":2263345082,"higher":1976215222}},"mosaicProperties":{"divisibility":0,"duration":{"lower":10000,"higher":0},"supplyMutable":true,"transferable":true,"levyMutable":false}}
```

承認されたらURLで確認してみましょう。

APIのレスポンスだとすこし見にくいと思うので`nem2-cli`でも確認してみましょう。

```shell
$ nem2-cli mosaic info -h 75caa6b686e7e7ba --profile alice
Mosaic: Hex:    75caa6b686e7e7ba
Uint64:         [ 2263345082, 1976215222 ]

divisibility:   0
transferable:   true
supply mutable: true
block height:   4653
duration:       10000
owner:          SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
supply:         0
```

この時点ではまだ供給量が設定されていません。

定義だけが存在していてモザイクは発行されていない状態なので`supply 0`と表示されています。

次に`scripts/mutate_mosaic_supply.js`を実行してください。

このコードは第一引数にモザイクIDを、第二引数に供給量を、第三引数に`add`(追加)または`remove`(削除)を指定します。

モザイクIDには直前に作成したモザイクの16進数文字列を指定してください。

```shell
$ node scripts/mosaic/mutate_mosaic_supply.js 75caa6b686e7e7ba 10000 add
Initiater:  SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:   http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Mosaic Hex: 75caa6b686e7e7ba
Supply:     10000
Delta:      add
Endpoint:   http://localhost:3000/mosaic/75caa6b686e7e7ba

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7
Hash:     5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16973,"networkType":144,"version":2,"deadline":{"value":"2019-03-23T16:30:59.813"},"fee":{"lower":0,"higher":0},"signature":"2523C329452B031AA2DB767D6FB66D6BF33536789E133ACCCC413FD3BA737502118F7D368F016B6085BF585A8E5FAD6E17155D6DC14FE4F5497FE21361A64E00","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7","merkleComponentHash":"5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7"},"mosaicId":{"id":{"lower":2263345082,"higher":1976215222}},"direction":1,"delta":{"lower":10000,"higher":0}}

[CONFIRMED] SCGUWZ...
{"type":16973,"networkType":144,"version":2,"deadline":{"value":"2019-03-23T16:30:59.813"},"fee":{"lower":0,"higher":0},"signature":"2523C329452B031AA2DB767D6FB66D6BF33536789E133ACCCC413FD3BA737502118F7D368F016B6085BF585A8E5FAD6E17155D6DC14FE4F5497FE21361A64E00","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":4894,"higher":0},"hash":"5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7","merkleComponentHash":"5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7"},"mosaicId":{"id":{"lower":2263345082,"higher":1976215222}},"direction":1,"delta":{"lower":10000,"higher":0}}
```

承認されたらもう一度モザイクのリソースURLを確認するか`nem2-cli`で確認してみましょう。

```shell
$ nem2-cli mosaic info -h 75caa6b686e7e7ba --profile alice
Mosaic: Hex:    75caa6b686e7e7ba
Uint64:         [ 2263345082, 1976215222 ]

divisibility:   0
transferable:   true
supply mutable: true
block height:   4653
duration:       10000
owner:          SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
supply:         10000
```

今度は`supply`に指定した量が表示され、`alice`が持っているモザイクとしても現れました。

```shell
$ nem2-cli account info --profile alice
Account:        SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
-------------------------------------------------------

Address:        SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
at height:      64

PublicKey:      64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0
at height:      77

Importance:     0
at height:      0

Mosaics
75caa6b686e7e7ba:       10000
7d09bf306c0b2e38:       56079.909091
```

これでモザイクの定義は完了です。


### コード解説

```javascript
const definitionTx = nem.MosaicDefinitionTransaction.create(
  nem.Deadline.create(),
  nonce,
  mosId,
  nem.MosaicProperties.create({
    duration: blocks ? nem.UInt64.fromUint(blocks) : undefined,
    divisibility: 0,
    transferable: true,
    supplyMutable: true,
    levyMutable: false
  }),
  nem.NetworkType.MIJIN_TEST
);
```

モザイク定義は`MosaicDefinitionTransaction`オブジェクトを作成します。

`MosaicProperties.create`によってモザイクの性質プロパティを設定しています。

`duration`を設定しない、または`undefined`を渡すと、無期限のモザイクとして設定することができます。

続いて、供給量の指定のコードです。

```javascript
const supplyType = delta === 'remove'
  ? nem.MosaicSupplyType.Decrease
  : nem.MosaicSupplyType.Increase

const supplyTx = nem.MosaicSupplyChangeTransaction.create(
  nem.Deadline.create(),
  mosId,
  supplyType,
  nem.UInt64.fromUint(absSupply),
  nem.NetworkType.MIJIN_TEST
);
```

モザイクID、追加または削除の固定値、供給量を指定して`MosaicSupplyChangeTransaction`オブジェクトを作成します。


## モザイク定義と供給量をアトミックに定義する

前述のネームスペースのように、アグリゲートトランザクションでトランザクションをまとめることで、定義と供給量の設定を一括で行うことができます。

`scripts/create_mosaic_with_supply.js`を実行してください。

このコードは第一引数に供給量を絶対値で指定してください。

第二引数にはモザイク有効期間を引数にとりますが、指定しない場合は`duration: undefined`となり無期限のモザイクとなります。

```shell
$ node mosaic/create_mosaic_with_supply.js 999
Initiater:    SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:     http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Mosaic Nonce: 3,69,180,223
Mosaic Hex:   1d967f35b9c255dc
Blocks:       10000
Supply:       999
Endpoint:     http://localhost:3000/mosaic/1d967f35b9c255dc

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556
Hash:     B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16705,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556","merkleComponentHash":"B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556"},"innerTransactions":[{"type":16717,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"nonce":3753133315,"mosaicId":{"id":{"lower":3116520924,"higher":496402229}},"mosaicProperties":{"divisibility":0,"duration":{"lower":10000,"higher":0},"supplyMutable":true,"transferable":true,"levyMutable":false}},{"type":16973,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"mosaicId":{"id":{"lower":3116520924,"higher":496402229}},"direction":1,"delta":{"lower":999,"higher":0}}],"cosignatures":[]}

[CONFIRMED] SCGUWZ...
{"type":16705,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":9712,"higher":0},"hash":"B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556","merkleComponentHash":"B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556"},"innerTransactions":[{"type":16717,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"nonce":3753133315,"mosaicId":{"id":{"lower":3116520924,"higher":496402229}},"mosaicProperties":{"divisibility":0,"duration":{"lower":10000,"higher":0},"supplyMutable":true,"transferable":true,"levyMutable":false}},{"type":16973,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"mosaicId":{"id":{"lower":3116520924,"higher":496402229}},"direction":1,"delta":{"lower":999,"higher":0}}],"cosignatures":[]}
```

前述の作業を一括で行っているだけなので省略しますが、作成されたモザイクの定義と供給量の存在を確認してみてください。
