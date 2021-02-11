# 動作環境の構築

このプロジェクトで使用しているバージョンは次のとおりです

- Node.js 10.15.3
- nem2-cli 0.13.0
- nem2-sdk 0.13.0
- catapult-service-bootstrap 0.6.0.1

- (ローカルネットワークを構築する場合)
    - Docker version 18.09.3, build 74b1e89
    - docker-compose version 1.24.1, build 4667896b

メジャーバージョンが大きく異なっていなければ、これらのバージョン以外でも動作すると思われますが、問題が発生する場合は上記に合わせてください。

特に`nem2-cli`,`nem2-sdk`,`catapult-service-bootstrap`の組み合わせについて、APIノードのレスポンススキーマの差異によって正常に動作しない場合があります。

`macOS`上で動作させた内容のため、`Windows`や`Linux`環境で行う場合はコマンドライン操作が異なる場合があります。

適宜読み替えて操作してください。


## Node.jsのインストール

`Node.js`のインストールは公式のインストーラや`nodenv`などのバージョンマネージャなどを用いてインストールしてください。

- [Node\.js](https://nodejs.org/ja/)
- [nodenv/nodenv: Manage multiple NodeJS versions\.](https://github.com/nodenv/nodenv)

コマンドパスが通っており、バージョンが確認できる状態にしてください。

```shell
$ node -v
v10.15.3

$ npm -v
v6.9.0
```


## nem2-cliのインストール

`nem2-cli`はnemネットワークからアカウントやトランザクションの情報を取得したり、トランザクションを発信するコマンドラインツールです。

- [nem2\-cli \- npm](https://www.npmjs.com/package/nem2-cli)

グローバルインストールをして、パスが通っていることを確認してください。

```shell
$ npm install nem2-cli@0.13.0 -g
$ nem2-cli
                        ____            _ _
   _ __   ___ _ __ ___ |___ \       ___| (_)
  | '_ \ / _ \ '_ ` _ \  __) |____ / __| | |
  | | | |  __/ | | | | |/ __/_____| (__| | |
  |_| |_|\___|_| |_| |_|_____|     \___|_|_|

                                     v0.13.0
```


## nem2-sdkのインストール

`nem2-sdk`はAPIとの疎通を`JavaScript`で行うことのできるラッパーライブラリです。

サンプルコードは`nem2-sdk`を使用しています。

`scripts/`に移動して、モジュールのインストールを行ってください。

```shell
$ cd scripts
$ npm install
```

- [nem2\-sdk \- npm](https://www.npmjs.com/package/nem2-sdk)


## Docker/docker-composeのセットアップ(ローカル環境を用意する場合)

前述のとおり、ローカル環境にネットワークを構築する場合は`catapult-service-bootstrap`を動かすための環境が必要です。

すでに用意されたネットワークを使用する場合はセットアップをスキップできます。

- [Get Started with Docker \| Docker](https://www.docker.com/get-started)
- [Install Docker Compose \| Docker Documentation](https://docs.docker.com/compose/install/)

`Windows`/`Mac OSX`/`Linux`それぞれの環境に応じたインストール方法でセットアップを行ってください。

インストールできたら、それぞれのコマンドが実行できることを確認してください。

```shell
$ docker -v
Docker version 19.03.1, build 74b1e89
$ docker-compose -v
docker-compose version 1.24.1, build 4667896b
```
