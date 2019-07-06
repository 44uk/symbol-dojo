# テスト用ネットワークの環境構築

お手元のマシンにローカルネットワーク環境を構築して学習する場合に行います。

- [ワークステーションのセットアップ — NEM Developer Center](https://nemtech.github.io/ja/getting-started/setup-workstation.html)

既に用意されたネットワークを使用する場合はこの作業をする必要はありません。

外部ネットワークを使用する場合は、以降のドキュメントでは接続するURLのホストとポートは各自の環境で読み替えてください。

APIエンドポイントはデフォルト設定で`http://localhost:3000`です。


## catapult-service-bootstrapの起動

任意の場所にアーカイブを展開してください。(`git`が利用できる場合はクローンしてもよいです)

- https://github.com/tech-bureau/catapult-service-bootstrap/archive/0.5.0.1.zip
- [tech\-bureau/catapult\-service\-bootstrap: Starter project to get developers up and running with a running Catapult Service](https://github.com/tech-bureau/catapult-service-bootstrap)

```shell
$ git clone https://github.com/tech-bureau/catapult-service-bootstrap.git -b 0.5.0.1
```

展開したディレクトリに移動して、`cmds/`以下にあるコマンドファイルの実行でコンテナクラスタを立ち上げます。

```shell
$ cd catapult-service-bootstrap
$ ./cmds/start-all -d
```

`-d`オプションでバックグラウンド動作させます。

初期設定などが動き出すので、ブロック生成が始まるまで1分程度待ちます。


## クラスタの動作確認

### APIの疎通確認

- http://localhost:3000/block/1

ブラウザでアクセスしてください。初期ブロックのレスポンスが得ることで動作を確認できます。

```json
{
  "meta": {
    "hash": "D58DB24EE18D2585A98D00112C67F9FADF75C808B1BCE7FAB5787171B2BD498E",
    "generationHash": "67763DFDA2C6D8FE2E51D8EBBA0F430C06AD07561FA5E565D1A576EA06ABC682",
    "totalFee": [
      0,
      0
    ],
    "subCacheMerkleRoots": [],
    "numTransactions": 29
  },
  "block": {
    "signature": "0DA9D18AD8FB8CFD71991A0EE966528853A7B82880C2F0BBBFAFDFBDDCAAB997AF859F9BB16075E1C711A1E0136693914B7CA49371A89190A6433AEF405F9802",
    "signer": "1E86A389DA753CE14365AB30793D378D648E422E89229AE8B07B69059BD550AE",
    "version": 36867,
    "type": 32835,
    "height": [
      1,
      0
    ],
    "timestamp": [
      0,
      0
    ],
    "difficulty": [
      276447232,
      23283
    ],
    "feeMultiplier": 0,
    "previousBlockHash": "0000000000000000000000000000000000000000000000000000000000000000",
    "blockTransactionsHash": "B9B1AE9D1D49F6CBAA3D71F14EEB08F23B8278C04C999E2A2D3FF3640E9CFF32",
    "blockReceiptsHash": "E9877761762C1FD4FCF2C7A7BCAB57CF2FDE83BE2A49C070E11E748141E31215",
    "stateHash": "43C5EE62FF5ABAC078B4B511F306EEA5C2E2F07CFB8E8BA8C0DA53869E140E3E",
    "beneficiary": "0000000000000000000000000000000000000000000000000000000000000000"
  }
}}
```


## 初期分配の確認

初期分配された基軸モザイクは初期生成アドレスへ分配されています。

初期アドレスは`./build/generated_addresses/address.yml`にあります。

`nemesis_addresses:`という箇所から下が初期アドレスです。以下は一例です。

なお、以降に出てくる`秘密/公開鍵`や`アドレス`はご自分の使用しているものに置き換えて実行してください。

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

初期分配時に使われるファイルを見てみると、前の**20**アカウントへ分配しています。

(現時点での仕様です。今後コードは変更されるかもしれません)

- [catapult\-service\-bootstrap/template\_bindings\.rb at master · tech\-bureau/catapult\-service\-bootstrap](https://github.com/tech-bureau/catapult-service-bootstrap/blob/master/ruby/lib/catapult/config/nemesis_properties_file/template_bindings.rb#L20)

基軸モザイクの発行枚数は`8,999,999,998.000,000`、可分性は`6`なので、4億49百94万9千999.9`cat.currency`(`8,999,999,998.000,000 / 20 = 449,949,999.900,000`)ずつ分配されます。

APIにアクセスして確認してみましょう。

- http://localhost:3000/account/SCMK5YDNUATKIFHBV4Y22VEX3N4YBVBT5YG4AX5V

ここでは整形していますが、次のような`json`レスポンスが得られます。

```json
{
  "meta": {},
  "account": {
    "address": "9098AEE06DA026A414E1AF31AD5497DB7980D433EE0DC05FB5",
    "addressHeight": [
      1,
      0
    ],
    "publicKey": "0000000000000000000000000000000000000000000000000000000000000000",
    "publicKeyHeight": [
      0,
      0
    ],
    "accountType": 0,
    "linkedAccountKey": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    "activityBuckets": [
      {
        "startHeight": "1",
        "totalFeesPaid": "0",
        "beneficiaryCount": 0,
        "rawScore": "3750000"
      }
    ],
    "mosaics": [
      {
        "id": [
          2100741038,
          1065721635
        ],
        "amount": [
          636036448,
          104762
        ]
      },
      {
        "id": [
          33800276,
          1975350734
        ],
        "amount": [
          3750000,
          0
        ]
      }
    ],
    "importance": [
      3750000,
      0
    ],
    "importanceHeight": [
      1,
      0
    ]
  }
}
```

`mosaics`が保有モザイクを表しています。

ここでは2つモザイクを持っていますが、`amount`に`0`が含まれていない方(`[636036448, 104762]`)に注目します。

`mosaics[0].amount`の値を確認すると`[636036448, 104762]`となっています。

これは`JavaScript`で`64bit`の大きな値を扱うために上下位`32bit`ずつに分けた表現です。

(`JavaScript`の言語仕様上`53bit`の整数値までしか扱えません)

(`53bit`以下に収まる)表現可能な数値であれば、整数値として表示することができます。

`scripts`ディレクトリへ移動して、次のワンライナースクリプトを実行してみてください。

```shell
$ cd scripts
$ node -e "let uint64 = require('nem2-sdk').UInt64;console.log(new uint64([636036448,104762]).compact())"
449949999900000 # 絶対値による表現
```

`449,949,999.900,000 cat.currency`が配布されていることが確認できました。


## クラスタの停止

クラスタを停止するには`./cmds/stop-all`を実行してください。

```shell
$ ./cmds/stop-all
Stopping catapult-service-bootstrap_faucet_1            ... done
Stopping catapult-service-bootstrap_peer-node-1_1       ... done
Stopping catapult-service-bootstrap_peer-node-0_1       ... done
Stopping catapult-service-bootstrap_api-node-0_1        ... done
Stopping catapult-service-bootstrap_rest-gateway_1      ... done
Stopping catapult-service-bootstrap_db_1                ... done
Stopping catapult-service-bootstrap_api-node-broker-0_1 ... done
Removing catapult-service-bootstrap_faucet_1                 ... done
Removing catapult-service-bootstrap_peer-node-1_1            ... done
Removing catapult-service-bootstrap_peer-node-0_1            ... done
Removing catapult-service-bootstrap_api-node-0_1             ... done
Removing catapult-service-bootstrap_rest-gateway_1           ... done
Removing catapult-service-bootstrap_init-db_1                ... done
Removing catapult-service-bootstrap_peer-node-0-nemgen_1     ... done
Removing catapult-service-bootstrap_peer-node-1-nemgen_1     ... done
Removing catapult-service-bootstrap_api-node-0-nemgen_1      ... done
Removing catapult-service-bootstrap_db_1                     ... done
Removing catapult-service-bootstrap_setup-network_1          ... done
Removing catapult-service-bootstrap_generate-raw-addresses_1 ... done
Removing catapult-service-bootstrap_api-node-broker-0_1      ... done
Removing catapult-service-bootstrap_store-addresses_1        ... done
Removing network catapult-service-bootstrap_default
```

再開する場合は起動と同様に`./cmds/start-all -d`を実行してください。


## クラスタ立ち上げ時のトラブルシューティング

執筆時点でクラスタを立ち上げる際にブロック生成が進まない問題が発生することがあります。

動作確認でつまづいた場合、以下を試してみてください。

また、解決しない場合に助けを求めたり、詳しい原因を調べたりする場合はログが役に立ちます。

`cd cmds/docker; docker-compose -p catapult-service-bootstrap logs` でログを表示して、エラーの出力を確認してみてください。


### ブロック生成が進まない

ブロック情報の破損、設定ファイルの食い違いなどの問題が発生することがあるようです。

`./cmds/clean-all`というスクリプトを実行すると、環境を初期化できます。

初期化後に`./cmds/start-all`でクラスタを立ち上げ直してみてください。


### レスポンスが帰ってこない

APIサーバの起動に失敗している可能性があります。

`./cmds/clean-all`で環境を初期化後、クラスタを立ち上げ直してみてください。


### クラスタを停止後、動かそうとすると動かない

正しくコンテナが終了しなかったりすると、ロックファイル`server.lock`が残る場合があります。

`./data/{node}/server.lock`を削除してから立ち上げてみてください。


### なんだかおかしい

とにかく`./cmds/clean-all`で環境を(ry


### ブロックチェーンをリセットしたい・消したい

クラスタを停止してから`./cmds/clean-data`を使ってください。

こちらはブロック情報だけを削除します。

削除後に`./cmds/start-all`すれば`1`ブロック目から生成が始まります。


### 何度cleanしても動作しない

`cow`や`dragon`などを過去に動作させていて、過去バージョンのイメージが残っていることで、イメージの組み合わせに齟齬が起きている場合があります。

一度イメージとコンテナもすべて削除してからやり直してみてください。

```shell
docker rmi -f $(docker images -f 'reference=catapult-service-bootstrap_*' --format '{{.Repository}}:{{.Tag}}')
docker rm -f $(docker ps -a  -f 'name=catapult-service-bootstrap' --format '{{.ID}}')
```
