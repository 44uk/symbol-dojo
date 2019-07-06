# モザイクとは

`nem`ネットワーク上に独自の通貨を定義する機能です。

- [モザイク — NEM Developer Center](https://nemtech.github.io/ja/concepts/mosaic.html)

基軸モザイクである`cat.currency`もモザイクで、定義上は同等な存在となります。

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

モザイクは単なる通貨としてでなく、意味付け次第でいろいろな使い方ができます。

- モザイクは独自のサービス用通貨
- 保有によるフラグ制御や値の表現
- 発行者と受信者間だけでやり取りされる権利の表現

モザイクをどう使うかはそのサービス提供者の手腕が問われます。


## モザイクの作成

`scripts/create_mosaic.js`を実行してください。

このコードはモザイクが有効であるブロック数を引数にとります。

指定しない場合は`duration: undefined`となり無期限のモザイクとなります。

なお、モザイクの定義にはその定義内容にかかわらず`500 cat:currency`が必要です。

```javascript
$ node scripts/mosaic/create_mosaic.js 10000
initiator:    SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
Endpoint:     http://localhost:3000/account/SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4
Mosaic Nonce: 106,164,82,29
Mosaic Hex:   6ffb0f4308e810f6
Blocks:       10000
Endpoint:     http://localhost:3000/mosaic/6ffb0f4308e810f6

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/9F27D1F3ACF54FAAE5A14929109E0BA7F1C08D6128720E58CEEE7E3793AAB03A
Hash:     9F27D1F3ACF54FAAE5A14929109E0BA7F1C08D6128720E58CEEE7E3793AAB03A
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[UNCONFIRMED] SAFPLK...
{"transaction":{"type":16717,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4063214264,23],"signature":"57454E59580739CD46FB79036DE865713895BBF1578C7030F8456AB997063C0C8F63BBA11B59E9D9F67065B0AF76BAB4F83F79A99D28EA045D4BDAD03AE6EE0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","nonce":491955306,"mosaicId":{"id":[149426422,1878724419]},"properties":[{"id":0,"value":[3,0]},{"id":1,"value":[0,0]},{"id":2,"value":[10000,0]}]}}

[CONFIRMED] SAFPLK...
{"transaction":{"type":16717,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4063214264,23],"signature":"57454E59580739CD46FB79036DE865713895BBF1578C7030F8456AB997063C0C8F63BBA11B59E9D9F67065B0AF76BAB4F83F79A99D28EA045D4BDAD03AE6EE0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","nonce":491955306,"mosaicId":{"id":[149426422,1878724419]},"properties":[{"id":0,"value":[3,0]},{"id":1,"value":[0,0]},{"id":2,"value":[10000,0]}]}}
```

承認されたらURLで確認してみましょう。

APIのレスポンスだとすこし見にくいと思うので`nem2-cli`でも確認してみましょう。

```shell
$ nem2-cli mosaic info -h 6ffb0f4308e810f6 --profile alice
Mosaic:	Hex:	6ffb0f4308e810f6
Uint64:		[ 149426422, 1878724419 ]

divisibility:	0
transferable:	true
supply mutable:	true
block height:	788
duration:	10000
owner:		SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
supply:		0
```

この時点ではまだ供給量が設定されていません。

定義だけが存在していてモザイクは発行されていない状態なので`supply 0`と表示されています。

次に`scripts/mutate_mosaic_supply.js`を実行してください。

このコードは第一引数にモザイクIDを、第二引数に供給量を、第三引数に`add`(追加)または`remove`(削除)を指定します。

モザイクIDには直前に作成したモザイクの16進数文字列を指定してください。

```shell
$ node scripts/mosaic/mutate_mosaic_supply.js 6ffb0f4308e810f6 10000 add
initiator:  SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
Endpoint:   http://localhost:3000/account/SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4
Mosaic Hex: 6ffb0f4308e810f6
Supply:     10000
Delta:      add
Endpoint:   http://localhost:3000/mosaic/6ffb0f4308e810f6

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/DA19F9479B3B7623005D6C2D9EC1A460DB5285FA039B9DDE4B5D7DDFA806F9E3
Hash:     DA19F9479B3B7623005D6C2D9EC1A460DB5285FA039B9DDE4B5D7DDFA806F9E3
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[UNCONFIRMED] SAFPLK...
{"transaction":{"type":16973,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4063606945,23],"signature":"E9410E6BDC6B193C1986879ABF1D9ECE50E50F3397AE66087E09BB97B82102A27B87F88D4419D0A3A409EC0B3302A7CA33D800D2253DA22BC09051EF5F280C00","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","mosaicId":{"id":[149426422,1878724419]},"direction":1,"delta":[10000,0]}}

[CONFIRMED] SAFPLK...
{"transaction":{"type":16973,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4063606945,23],"signature":"E9410E6BDC6B193C1986879ABF1D9ECE50E50F3397AE66087E09BB97B82102A27B87F88D4419D0A3A409EC0B3302A7CA33D800D2253DA22BC09051EF5F280C00","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","mosaicId":{"id":[149426422,1878724419]},"direction":1,"delta":[10000,0]}}


```

承認されたらもう一度モザイクのリソースURLを確認するか`nem2-cli`で確認してみましょう。

```shell
$ nem2-cli mosaic info -h 6ffb0f4308e810f6 --profile alice
Mosaic:	Hex:	6ffb0f4308e810f6
Uint64:		[ 149426422, 1878724419 ]

divisibility:	0
transferable:	true
supply mutable:	true
block height:	788
duration:	10000
owner:		SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
supply:		10000
```

今度は`supply`に指定した量が表示され、`alice`が持っているモザイクとしても現れました。

```shell
$ nem2-cli account info  --profile alice
Account:	SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
-------------------------------------------------------

Address:	SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
at height:	298

PublicKey:	A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0
at height:	382

Importance:	0
at height:	0

Mosaics
3f859f237d36c3ae:	9058
6ffb0f4308e810f6:	10000
```

これでモザイクの定義が完了しました。


### コード解説

```javascript
const definitionTx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  mosId,
  MosaicProperties.create({
    duration: blocks ? UInt64.fromUint(blocks) : undefined,
    divisibility: 0,
    transferable: true,
    supplyMutable: true,
    levyMutable: false
  }),
  NetworkType.MIJIN_TEST
);
```

モザイク定義は`MosaicDefinitionTransaction`オブジェクトを作成します。

`MosaicProperties.create`によってモザイクの性質プロパティを設定しています。

`duration`を設定しない、または`undefined`を渡すと、無期限のモザイクとして設定することができます。

続いて、供給量の指定のコードです。

```javascript
const supplyType = delta === 'remove'
  ? MosaicSupplyType.Decrease
  : MosaicSupplyType.Increase

const supplyTx = MosaicSupplyChangeTransaction.create(
  Deadline.create(),
  mosId,
  supplyType,
  UInt64.fromUint(absSupply),
  NetworkType.MIJIN_TEST
);
```

モザイクID、追加または削除の固定値、供給量を指定して`MosaicSupplyChangeTransaction`オブジェクトを作成します。


## モザイク定義と供給量をアトミックに定義する

前述のネームスペースのように、アグリゲートトランザクションでトランザクションをまとめることで、定義と供給量の設定を一括で行うことができます。

`scripts/create_mosaic_with_supply.js`を実行してください。

このコードは第一引数に供給量を絶対値で指定してください。

第二引数にはモザイク有効期間を引数にとりますが、指定しない場合は`duration: undefined`となり無期限のモザイクとなります。

```shell
$ node scripts/mosaic/create_mosaic_with_supply.js 1000
initiator: SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
Endpoint:  http://localhost:3000/account/SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4
Nonce:     202,218,131,213
MosaicHex: 29c7073f2019365f
Blocks:    Infinity
Supply:    1000
Endpoint:  http://localhost:3000/mosaic/29c7073f2019365f

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/1B3EE2AFC0236FE8A64A03AECBEC07253A82A29C8578C0657B60162323D39AC7
Hash:     1B3EE2AFC0236FE8A64A03AECBEC07253A82A29C8578C0657B60162323D39AC7
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[UNCONFIRMED] SAFPLK...
{"transaction":{"type":16705,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4063915490,23],"signature":"1A29846388E6D90E1166B8853FD7F7BC00D3DE3000C60E88D498D46A18AF7D5DB34E707968098C354012CC2A4B8919441FE60046C13486BFAD8FCDF87D1C100B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","transactions":[{"transaction":{"type":16717,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4063915490,23],"signature":"1A29846388E6D90E1166B8853FD7F7BC00D3DE3000C60E88D498D46A18AF7D5DB34E707968098C354012CC2A4B8919441FE60046C13486BFAD8FCDF87D1C100B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","nonce":3582188234,"mosaicId":{"id":[538523231,700909375]},"properties":[{"id":0,"value":[3,0]},{"id":1,"value":[0,0]}]}},{"transaction":{"type":16973,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4063915490,23],"signature":"1A29846388E6D90E1166B8853FD7F7BC00D3DE3000C60E88D498D46A18AF7D5DB34E707968098C354012CC2A4B8919441FE60046C13486BFAD8FCDF87D1C100B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","mosaicId":{"id":[538523231,700909375]},"direction":1,"delta":[1000,0]}}],"cosignatures":[]}}

[CONFIRMED] SAFPLK...
{"transaction":{"type":16705,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4063915490,23],"signature":"1A29846388E6D90E1166B8853FD7F7BC00D3DE3000C60E88D498D46A18AF7D5DB34E707968098C354012CC2A4B8919441FE60046C13486BFAD8FCDF87D1C100B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","transactions":[{"transaction":{"type":16717,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4063915490,23],"signature":"1A29846388E6D90E1166B8853FD7F7BC00D3DE3000C60E88D498D46A18AF7D5DB34E707968098C354012CC2A4B8919441FE60046C13486BFAD8FCDF87D1C100B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","nonce":3582188234,"mosaicId":{"id":[538523231,700909375]},"properties":[{"id":0,"value":[3,0]},{"id":1,"value":[0,0]}]}},{"transaction":{"type":16973,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4063915490,23],"signature":"1A29846388E6D90E1166B8853FD7F7BC00D3DE3000C60E88D498D46A18AF7D5DB34E707968098C354012CC2A4B8919441FE60046C13486BFAD8FCDF87D1C100B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","mosaicId":{"id":[538523231,700909375]},"direction":1,"delta":[1000,0]}}],"cosignatures":[]}}
```

前述の作業をアグリゲートトランザクションを用いて一括で行っているだけなので詳細は省略します。

作成されたモザイクの定義と供給量の存在を確認してみてください。
