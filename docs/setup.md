# 動作環境の構築

このプロジェクトでは次のソフトウェアを利用します。

各ソフトウェアをインストールして、実行可能な状態に準備してください。

このプロジェクトでは次のバージョンのツールを使用しています。

- nodejs
    - 10.15.3
- nem2-cli
    - 0.11.0
- nem2-sdk
    - 0.11.1
- docker(ローカルネットワークを構築する場合)
    - Docker version 18.09.2, build 6247962
- docker-compose(ローカルネットワークを構築する場合)
    - docker-compose version 1.23.2, build 1110ad01

メジャーバージョンから大きくずれていなければ、これらのバージョンでなくても動作すると思われます。

問題が起きるようであれば、参考にしてみてください。

`Windows`/`MacOS`/`Linux`環境下にて、`Node.js`と`ターミナルエミュレータ`が利用できれば進められる内容となっています。


## Node.jsのインストール

`Node.js`がすでにインストール済みである場合、はバージョンを確認してください。

`nem2`関連のソースを動作させるためには最低でも`8.9.x`以上が必要です。

- [Node\.js](https://nodejs.org/ja/)

公式サイトよりインストーラをダウンロードしてインストールを行ってください。

お好みで`nodenv`のような複数バージョンの環境構築ツールを用いたインストールでもよいです。

- [nodenv/nodenv: Manage multiple NodeJS versions\.](https://github.com/nodenv/nodenv)

インストールができたらターミナルを開いて動作の確認を行ってください。

```shell
$ node -v
v10.15.3

$ npm -v
v6.9.0
```


## nem2-cliのインストール

`npm`コマンドによってパッケージのインストールを行います。

```shell
$ npm install nem2-cli@0.11.0 -g
```

`nem2-cli`はコマンドラインツールのため、`-g`オプションをつけて実行できるようにします。

`npm`により、パッケージをインストールし、`nodejs`によりコードが実行できる状態にエディタ等の準備してください。

バージョン`0.11.0`以上が`cow`対応版です。

更新により異なるバージョンがダウンロードされるかもしれないのでバージョン指定をしています。

- [nem2\-cli \- npm](https://www.npmjs.com/package/nem2-cli)

コマンドを実行して動作を確認してください。

```shell
$ nem2-cli
                        ____            _ _
   _ __   ___ _ __ ___ |___ \       ___| (_)
  | '_ \ / _ \ '_ ` _ \  __) |____ / __| | |
  | | | |  __/ | | | | |/ __/_____| (__| | |
  |_| |_|\___|_| |_| |_|_____|     \___|_|_|

  USAGE

    nem2-cli <subcommand>

  SUBCOMMANDS

    account     - Fetch account information
    blockchain  - Fetch blockchain information
    mosaic      - Fetch mosaic information
    namespace   - Fetch namespace information
    transaction - Send transactions
    monitor     - Monitor blocks, transactions and errors
    profile     - Profile management
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
Docker version 18.09.2, build 6247962

$ docker-compose -v
docker-compose version 1.23.2, build 1110ad01
```
