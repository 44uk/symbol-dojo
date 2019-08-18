# アカウント制限

アカウントにトランザクションに関する制限をブロックチェーンレベルで定義する機能です。

- [アカウント制限 — NEM Developer Center](https://nemtech.github.io/ja/concepts/account-restriction.html)

制限に引っかかったトランザクションはエラー扱いになるため、ブロックチェーンネットワークに承認されません。

## アカウント制限の種類

設定できる制限は3種類あります。


### 受信トランザクション制限

アカウントにトランザクションの受信可否をブラック・ホワイトリスト形式で設定する機能です。

- 余計なトランザクションを意図しないアカウントから受け入れたくない
- 特定のアドレスからのトランザクションを受け入れたくない


### 受信モザイク制限

アカウントに、モザイクの受信可否をブラック・ホワイトリスト形式で設定する機能です。

- マーキング用のモザイク以外受け取りたくない
- 既知の不要なモザイクを受け取りたくない


### 送信トランザクション制限

アカウントに、トランザクションの種類ごとに制限をかける機能です。

自分自身が設定することになるので、誤操作によるトランザクションの送信防止が主な目的のようです。


## 指定アドレスからの受信ブロック制限を設定する

`restriction/address.js`を実行してください。

このスクリプトは第一引数にアドレスを指定し、第二引数には`block`または`allow`、第三引数に`add`または`remove`を指定します。

ここでは`alice`のアカウントに`bob`のアカウントアドレスをブロック対象に追加してみます。

```shell
$ node restriction/address.js SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2 block add
Initiator: SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
Endpoint:  http://localhost:3000/account/SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4
Block:     SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2
Property:  block
Modify:    add
Endpoint:  http://localhost:3000/account/A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0/restrictions
Endpoint:  http://localhost:3000/account/SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/F1140B8DDE688B9B922200F89013B22DB3DDE78667F604F8793D934DCBE3F253
Hash:     F1140B8DDE688B9B922200F89013B22DB3DDE78667F604F8793D934DCBE3F253
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[UNCONFIRMED] SAFPLK...
{"transaction":{"type":16720,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4072063080,23],"signature":"19BB91AF24EDF752BA3CD9024AE922F124EAC2945A243F414A69E946CB0F6EC1D5F1DEFC739E1388E0E6D1793B7F052AE736982E5BFF334FCA6C2AE47B905305","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","propertyType":129,"modifications":[{"value":"9093BBB2C844D33E8D05CE150D7EA34630A056E800189B795A"}]}}

[CONFIRMED] SAFPLK...
{"transaction":{"type":16720,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4072063080,23],"signature":"19BB91AF24EDF752BA3CD9024AE922F124EAC2945A243F414A69E946CB0F6EC1D5F1DEFC739E1388E0E6D1793B7F052AE736982E5BFF334FCA6C2AE47B905305","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","propertyType":129,"modifications":[{"value":"9093BBB2C844D33E8D05CE150D7EA34630A056E800189B795A"}]}}
```

承認されたらURLにアクセスしてみて、設定されていることを確認してください。

```json
```

`propertyType`が`129`がブロックです。設定されたことだけを確認してください。

まず`alice`のアカウントの`status`モニターを開始しておきます。

```shell
$ nem2-cli monitor status --profile alice
Monitoring SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4 using http://localhost:3000
connection open
```

次に`bob`のアドレスから`alice`へトランザクションを送ってみてください。

```shell
$ nem2-cli transaction transfer -r SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4 -c @cat.currency::1000000 --profile bob
Transaction announced correctly
Hash:    FFFFC03994FA1DF7583FC8500DC1DECCD51901F264ADD136E3EBE822BB58D9A4
Signer:  97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B
```

このトランザクションが制限にブロックされ、ターミナルにエラーが表示されます。

```shell
Hash: FFFFC03994FA1DF7583FC8500DC1DECCD51901F264ADD136E3EBE822BB58D9A4
Error code: Failure_RestrictionAccount_Signer_Address_Interaction_Not_Allowed
Deadline: 2019-07-05 20:20:38.736
```

送信元のアドレスと送信先のアドレスで残高が変化していないことを確認してみてください。

```shell
$ nem2-cli account info --profile alice
```

```shell
$ nem2-cli account info --profile bob
```

確認後にはブロックを解除するトランザクションを実行しておきます。

```shell
$ node restriction/address.js SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2 block remove
```


## 指定モザイクの受信ブロック制限を設定する

`restriction/mosaic.js`を実行してください。

このスクリプトは第一引数にモザイクIDを指定し、第二引数には`block`または`allow`、第三引数に`add`または`remove`を指定します。

ここでは`alice`のアカウントに`3f859f237d36c3ae (cat.currency)`モザイクをブロック対象に追加してみます。


```shell
$ node restriction/mosaic.js 3f859f237d36c3ae block add
Initiator: SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
Endpoint:  http://localhost:3000/account/SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4
Block:     3f859f237d36c3ae
Property:  block
Modify:    add
Endpoint:  http://localhost:3000/account/A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0/restrictions
Endpoint:  http://localhost:3000/mosaic/3f859f237d36c3ae

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/0057668EBAF127CE2E88D1D2359E03ABDBC9A4F79A1F60C738339C8AE374D9B4
Hash:     0057668EBAF127CE2E88D1D2359E03ABDBC9A4F79A1F60C738339C8AE374D9B4
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[UNCONFIRMED] SAFPLK...
{"transaction":{"type":16976,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4076304657,23],"signature":"8077CEF0701215D2CE6B5887C9DFFA4D11420DEEE7DE408B3FE5414C9C35855B480CDB0B97E158AB2741A2F461D5AAAC8BAA250EE3588AAE6BDC8B1CC6AE920A","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","propertyType":130,"modifications":[{"value":[2100741038,1065721635]}]}}

[CONFIRMED] SAFPLK...
{"transaction":{"type":16976,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4076304657,23],"signature":"8077CEF0701215D2CE6B5887C9DFFA4D11420DEEE7DE408B3FE5414C9C35855B480CDB0B97E158AB2741A2F461D5AAAC8BAA250EE3588AAE6BDC8B1CC6AE920A","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","propertyType":130,"modifications":[{"value":[2100741038,1065721635]}]}}
```

先程同様に`bob`のアドレスから`alice`へ`cat.currency`を含めたトランザクションを送ってみてください。

```shell
$ nem2-cli transaction transfer -r SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4 -c @cat.currency::1000000 --profile bob
Transaction announced correctly
Hash:    F726C13B1C2C2D15634D6EF9DDA08FBF67336E589C97A2C37FE9D972FE4DD152
Signer:  97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B
```

このトランザクションが制限にブロックされ、ターミナルにエラーが表示されます。

```shell
Hash: F726C13B1C2C2D15634D6EF9DDA08FBF67336E589C97A2C37FE9D972FE4DD152
Error code: Failure_RestrictionAccount_Mosaic_Transfer_Not_Allowed
Deadline: 2019-07-05 21:22:53.585
```

確認後にはブロックを解除するトランザクションを実行しておきます。

```shell
$ node restriction/mosaic.js 3f859f237d36c3ae block remove
```


## 指定トランザクションタイプを設定する

`restriction/entity_type.js`を実行してください。

このスクリプトは第一引数にトランザクションのタイプを指定し、第二引数には`block`または`allow`、第三引数に`add`または`remove`を指定します。

ここでは`alice`のアカウントに`TRANSFER`のトランザクションタイプの利用の制限を追加してみます。

```shell
$ node restriction/entity.js TRANSFER block add
Initiator: SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
Endpoint:  http://localhost:3000/account/SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4
Subject:   TRANSFER
Property:  block
Modify:    add
Endpoint:  http://localhost:3000/account/A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0/restrictions

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/63746B7CB2FA226D91E02450A4AC2ED1FD4627266EE45A838382693374711293
Hash:     63746B7CB2FA226D91E02450A4AC2ED1FD4627266EE45A838382693374711293
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[UNCONFIRMED] SAFPLK...
{"transaction":{"type":17232,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4080778083,23],"signature":"076289FAE8AE9586D683986D1A2B500B352F8729A538C54C56AF43056CED91DEA45EA412A14BFC6089A844B67056D7CAF3ABAD907A68DDDAB4BF96C1FCC3B808","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","propertyType":132,"modifications":[{"value":16724}]}}

[CONFIRMED] SAFPLK...
{"transaction":{"type":17232,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4080778083,23],"signature":"076289FAE8AE9586D683986D1A2B500B352F8729A538C54C56AF43056CED91DEA45EA412A14BFC6089A844B67056D7CAF3ABAD907A68DDDAB4BF96C1FCC3B808","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","propertyType":132,"modifications":[{"value":16724}]}}
```

`alice`のアカウントから`bob`へ転送トランザクションを発信してみます。

```shell
$ nem2-cli transaction transfer -r SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2 -c @cat.currency::10000000 -m "Hello, Bob" --profile alice
```

このトランザクションが制限にブロックされ、ターミナルにエラーが表示されます。

```shell
Hash: B5D9D0B30274FFDBDE3226F56FFAE4E45610D438B2FAE75CBA6571FF4E938A68
Error code: Failure_RestrictionAccount_Transaction_Type_Not_Allowed
Deadline: 2019-07-05 22:37:44.433
```

確認後にはブロックを解除するトランザクションを実行しておきます。

```shell
$ node restriction/entity.js TRANSFER block remove
```
