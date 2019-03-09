# テスト用ネットワークの環境構築

ローカル環境にネットワークを構築して学習する場合に行うステップです。

- [ワークステーションのセットアップ — NEM Developer Center](https://nemtech.github.io/ja/getting-started/setup-workstation.html)

既に用意されたネットワークを使用する場合はこの作業をスキップできます。

APIエンドポイントはデフォルト設定で`http://localhost:3000`です。

用意されたネットワークを使用する場合は、以降のドキュメントでは接続するURLのホストとポートは各自の環境で読み替えてください。


## 有志によるプライベートネットワーク

有志によるネットワークが稼働しています。

ローカルにネットワークと立ち上げることが困難である場合は以下のネットワークを利用することができます。

ただし、各ネットワークの管理者の都合により稼働が止まったり、チェーンが初期化される場合があります。


### catapult-test.44uk.net

- [APIエンドポイント](http://catapult-test.44uk.net:3000)
- [エクスプローラ](http://catapult-test.44uk.net:8000)
- [フォーセット](http://catapult-test.44uk.net:4000)

### catapult48gh23s.xyz

- [APIエンドポイント](http://catapult.48gh23s.xyz:3000)
- [エクスプローラ](http://explorer.48gh23s.xyz)
- [フォーセット](https://faucet-cow.azurewebsites.net/)
- [ウォレット](http://wallet.48gh23s.xyz/)


## catapult-service-bootstrapの起動

任意の場所にアーカイブを展開してください。(`git`が利用できる場合はクローンしてもよいです)

- https://github.com/tech-bureau/catapult-service-bootstrap/archive/master.zip
- [tech\-bureau/catapult\-service\-bootstrap: Starter project to get developers up and running with a running Catapult Service](https://github.com/tech-bureau/catapult-service-bootstrap)

```shell
$ git clone https://github.com/tech-bureau/catapult-service-bootstrap.git
```

展開したディレクトリに移動し、`docker-compose`コマンドでコンテナクラスタを立ち上げます。

＊ `docker-compose-with-explorer.yml`はブロックエクスプローラが起動する設定ファイルです。

```shell
$ cd catapult-service-bootstrap
$ docker-compose -f docker-compose-with-explorer.yml up -d
```

初期設定などが動き出し、ブロック生成が始まるまで1分程度待ちます。


## クラスタの動作確認

### APIの疎通を確認

- http://localhost:3000/block/1

ブラウザでアクセスしてください。初期ブロックのレスポンスが得られます。


### エクスプローラの疎通を確認

- http://localhost:8000

ブラウザでアクセスしてください。ブロックチェーンエクスプローラが表示されます。


### ブロック生成を確認

```shell
$ nem2-cli monitor block
```

コマンドを実行してください。ブロックが生成されるたびにブロック情報が流れてきます。


## 初期分配の確認

初期分配された基軸モザイクは初期生成アドレスへ分配されています。
初期アドレスは`./build/generated_addresses/address.yml`にあるので開いてください。

`nemesis_addresses:`という箇所から下が初期アドレスです。以下は一例です。

```yaml
nemesis_addresses:
- private: 57062D8B532D0423B324998E251DD77B972802B6FB3DDB57289BCF9246284AE0
  public: F02D33764A08DEBEF4B9FFD514FE99DFB084879F09C32E183F087610246C8BB2
  address: SBPKTXJYSCHBGHRAFEETGITGW6AS22KX4GI5WZ25
- private: 6BE1AD4D445329D8F1B8DA6662EC1BB1ED7976E1AA8653C25FE1F600778F354E
  public: 6AD9B656ECA8AF93E4EE9F20847DA51FFC7B6DAFD6ACCA88149315AFED1BB245
  address: SATGJWJCHFZTXTUQYZVAXXTXY6KXA3S66ZMQX23T
- private: 00FD5E450984189F9DE396A8B9E4DB038DF7D9AB7612D5197C5011318100CF0E
  public: 196DF14B0C6EF2A9BCB0914E3B249A50301A2058AE962AEA970616F6BD91E393
  address: SCFO5UG43W5KV7HNIGE3BY6ZK6ST2SCDJ5F3O2Q
```

初期分配時に使われるファイルを見てみると、前の**22**アカウントへ分配しています。
(現時点での仕様です。今後コードは変更されるかもしれません)

- [catapult\-service\-bootstrap/template\_bindings\.rb at master · tech\-bureau/catapult\-service\-bootstrap](https://github.com/tech-bureau/catapult-service-bootstrap/blob/master/ruby/lib/catapult/config/nemesis_properties_file/template_bindings.rb#L18)

基軸モザイクの発行枚数は`8,999,999,998.000,000`、可分性は`6`なので、
4億9百9万9百9XEM(`8,999,999,998.000,000 / 22 = 409,090,909.000,000`)ずつ分配されることになります。

実際に確認してみましょう。
`nemesis_addresses:`の前から22件、お好きにアドレスを選んで、以下のコマンドで残高を確認してください。

```shell
$ nem2-cli account info -a SBPKTXJYSCHBGHRAFEETGITGW6AS22KX4GI5WZ25
Account:        SBPKTX-JYSCHB-GHRAFE-ETGITG-W6AS22-KX4GI5-WZ25
-------------------------------------------------------

Address:        SBPKTX-JYSCHB-GHRAFE-ETGITG-W6AS22-KX4GI5-WZ25
at height:      1

PublicKey:      0000000000000000000000000000000000000000000000000000000000000000
at height:      0

Importance:     409090909
at height:      1

Mosaics
7d09bf306c0b2e38:       409090909
```

`409,090,909.000,000`cat.currencyが配布された状態であることが確認できました。


## クラスタ立ち上げ時のトラブルシューティング

執筆時点でクラスタを立ち上げる際にブロック生成が進まない問題が発生することがあります。
動作確認でつまづいた場合、以下を試してみてください。


### ブロック生成が進まない

ブロック情報の破損、設定ファイルの食い違いなどの問題があるようです。
`./clean-all`というスクリプトを実行すると、環境を初期化できます。
初期化後、`docker-compose up`でクラスタを立ち上げ直してみてください。


### レスポンスが帰ってこない

APIサーバの起動に失敗している可能性があります。
`./clean-all`で環境を初期化後、クラスタを立ち上げ直してみてください。


### クラスタを停止後、動かそうとすると動かない

正しくコンテナが終了しなかったりすると、ロックファイル`file.lock`が残る場合があります。
`./data/{node}/file.lock`を削除してから立ち上げてみてください。


### なんだかおかしい

とにかく`./clean-all`で環境を(ry


### ブロックチェーンをリセットしたい・消したい

クラスタを停止してから`./clean-data`を使ってください。
こちらはブロック情報だけを削除します。
削除後に`docker-compose up`すれば`1`ブロック目から生成が始まります。


### 初期キーペア以外をリセットしたい

`./clean-data`を開いて、以下の行をコメントアウトしてください。
次に`docker-compose up`した際に、残した初期キーペアが使用されます。

```bash
#!/bin/bash
find data/* | grep -v "README.md" | xargs rm -rf
find build/nemesis/* | grep -v "README.md" | xargs rm -rf
# この行をコメントアウト
# find build/generated-addresses/* | grep -v "README.md" | xargs rm -rf
find build/catapult-config/* | grep -v "README.md" | xargs rm -rf
find build/state/* | grep -v "README.md" | xargs rm -rf
```
