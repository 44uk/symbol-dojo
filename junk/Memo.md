# 初回セットアップスクリプト


# テストネットとのクロスチェーン









https://docs.google.com/forms/d/e/1FAIpQLSf5x2drnlf-y8YcvZw3rp8JzC3NJCcV-7HLsgZFi_xgIooH9w/viewform

```
▷プログラム：
15:15　受付開始
15:30　開会　本日の次第説明
15:35　「mijin v.2 (Symbol) ハンズオンセミナー：応用編」（85分）
　　　　　　　　講師：株式会社Opening Line　チーフエンジニア　松田 晋一 氏

　　　  ＜主な内容＞
　　　　１）Symbolとは
　　　　　　　ー概要
　　　　　　　ー処理性能
　　　　　　　ーレイヤー構造
　　　　　　　ー新機能
　　　　２）マルチレベル・マルチシグネチャ
　　　　３）アグリゲート・トランザクション
　　　　４）クロスチェーン・トランザクション
　　　　５）Symbolの利用について
　　　　６）ワークショップ
　　　　　　・nem2-cli
　　　　　　　ーアカウント情報の確認
　　　　　　　ーXEMの送金
　　　　　　　ー送金トランザクションの確認
　　　　　　　ー請求トランザクション
　　　　　　・nem2-sdk
　　　　　　　ー請求トランザクション
　　　　７）質疑応答
17:00　閉会
```


-------------

# memo

Core Devs Questions for Active Proposals - Project Proposals
https://forum.nem.io/t/core-devs-questions-for-active-proposals/21955/30

https://docs.google.com/document/d/1QGkulG_QlNPoFolvUVoMDGbN5CLqJDe-OOD2tAZ-Ykg/edit
https://docs.google.com/document/d/1NJiDs2TzEEA1mYu0pTRtwwEou3eIZVeC6b0hE7OZ6iE/edit

http://catapult-test.44uk.net:3000/node/info
http://catapult-test.44uk.net:3000/block/1
http://catapult-test.44uk.net:8000/#/blocks/0
http://catapult-test.44uk.net:4000/


API_URL=http://catapult-test.44uk.net:4000/
PRIVATE_KEY=884A2FE901971E76D1D4483323D81674ACBBFD3996F4A176B372EC73636A4A13



```
http://localhost:3000/account/<ADDRESS>
```

```
http://localhost:3000/account/SAVNAPKNRPIE6H5BB4RD2RVTZQ3YKQ55ECQ56CH
```

```shell
$ nem2-cli mosaic info -u [3646934825,3576016193]
```

```shell
$ node -e "const uint64 = require('nem2-sdk').UInt64; console.log(new uint64([3863990592,95248]).compact())"

$ node -e "let uint64 = require('nem2-sdk').UInt64; console.log(new uint64([3863990592,95248]).compact())"
409090909000000

$ node -e "let nem = require('nem2-sdk'); console.log(nem.Deadline.create(24))"
```








----

### pullfunds トランザクション

[アグリゲートボンドトランザクションを使ったエスクローの作成 — NEM Developer Center](https://nemtech.github.io/ja/guides/transaction/creating-an-escrow-with-aggregate-bonded-transaction.html)

これとやっていることは同じ。

```
$ nem2-cli transaction pullfunds -r SCC3Z7YEUYEDFWBRMSV7OO3IXPIURD65EV2UMB24 -x nem:xem::1000000 -m "Coffee"
connection open
Announce lock funds transaction
Hash:    68B3D216952E893C2D8534A0620AA3F096F00BD7B7875F836A000B720A371903
Signer:  FA736CDAAD55BFB01199D7456C201B6A5FD19170A0D7F4A463074E40FC6ACCFD

Waiting for confirmation to announce pull funds transaction

Pull funds transaction announced
Hash:    4ED18D088CC95F0F693D932D1C1AA291443A2E2A5DFA57692FA79F5129014BD8
Signer:  FA736CDAAD55BFB01199D7456C201B6A5FD19170A0D7F4A463074E40FC6ACCFD
```


```
$ nem2-cli monitor aggregatebonded --profile alice
Monitoring SCC3Z7-YEUYED-FWBRMS-V7OO3I-XPIURD-65EV2U-MB24 using http://localhost:3000
connection open

AggregateTransaction:  InnerTransactions: [ TransferTransaction: Recipient:SCC3Z7-YEUYED-FWBRMS-V7OO3I-XPIURD-65EV2U-MB24 Message:"Coffee" Signer:SAVNAP-KNRPIE-6H5BB4-RD2RVT-ZQ3YKQ-55ECQ5-6CHC Deadline:2019-02-11 TransferTransaction: Recipient:SAVNAP-KNRPIE-6H5BB4-RD2RVT-ZQ3YKQ-55ECQ5-6CHC Mosaics: d525ad41d95fcf29:1000000 Signer:SCC3Z7-YEUYED-FWBRMS-V7OO3I-XPIURD-65EV2U-MB24 Deadline:2019-02-11 ] Signer:SAVNAP-KNRPIE-6H5BB4-RD2RVT-ZQ3YKQ-55ECQ5-6CHC Deadline:2019-02-11 Hash:4ED18D088CC95F0F693D932D1C1AA291443A2E2A5DFA57692FA79F5129014BD8
```

```
nem2-cli account aggregatebonded --profile alice
AggregateTransaction:  InnerTransactions: [ TransferTransaction: Recipient:SCC3Z7-YEUYED-FWBRMS-V7OO3I-XPIURD-65EV2U-MB24 Message:"Coffee" Signer:SAVNAP-KNRPIE-6H5BB4-RD2RVT-ZQ3YKQ-55ECQ5-6CHC Deadline:2019-02-11 TransferTransaction: Recipient:SAVNAP-KNRPIE-6H5BB4-RD2RVT-ZQ3YKQ-55ECQ5-6CHC Mosaics: d525ad41d95fcf29:1000000 Signer:SCC3Z7-YEUYED-FWBRMS-V7OO3I-XPIURD-65EV2U-MB24 Deadline:2019-02-11 ] Signer:SAVNAP-KNRPIE-6H5BB4-RD2RVT-ZQ3YKQ-55ECQ5-6CHC Deadline:2019-02-11 Hash:4ED18D088CC95F0F693D932D1C1AA291443A2E2A5DFA57692FA79F5129014BD8
```


```
$ nem2-cli transaction cosign -h 4ED18D088CC95F0F693D932D1C1AA291443A2E2A5DFA57692FA79F5129014BD8 --profile alice
Transaction cosigned and announced correctly
```

```
$ nem2-cli account info --profile alice
```


```
AggregateTransaction:
  InnerTransactions: [
    TransferTransaction:
      Recipient:SCC3Z7-YEUYED-FWBRMS-V7OO3I-XPIURD-65EV2U-MB24
      Message:"Coffee"
      Signer:SAVNAP-KNRPIE-6H5BB4-RD2RVT-ZQ3YKQ-55ECQ5-6CHC
      Deadline:2019-02-11
    TransferTransaction:
      Recipient:SAVNAP-KNRPIE-6H5BB4-RD2RVT-ZQ3YKQ-55ECQ5-6CHC
      Mosaics: d525ad41d95fcf29:1000000
      Signer:SCC3Z7-YEUYED-FWBRMS-V7OO3I-XPIURD-65EV2U-MB24
      Deadline:2019-02-11
  ]
  Signer:SAVNAP-KNRPIE-6H5BB4-RD2RVT-ZQ3YKQ-55ECQ5-6CHC
  Deadline:2019-02-11
  Hash:E06ED2DBE0394C32FD88CD39086AD423E43DFE334C05D1255E6CDF180E13C1EA
```

`default`から`alice`へメッセージのトランザクションが、`alice`から`default`へ`1 nem:xem`送るトランザクションがアグリゲートボンドされている。



