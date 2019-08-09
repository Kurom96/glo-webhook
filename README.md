# Glo Webhooks

## はじめに

GitKraken Glo の webhook です。  
https://app.gitkraken.com/glo/  


## Running Locally
Prerequisites:
- Node v6 or greater
- [ngrok](https://ngrok.com/)


前提:
* GitKraken Glo にて Personal Access Tokens を発行済
* Github 連携ボードを作成済
* webhook シークレット（適当な文字列）決めておく

環境構築手順：
* `yarn` or `npm i`  
* config.json の glo トークンとシークレットを設定
```
  "glo": {
       "secret": "glowebhooksecret",
       "token": "glowebapipersonalaccesstoken",
```
* サーバー実行
```
$ yarn start
```
* サービスを外部公開 
```
$ yarn ngrok
```
* GitKraken Glo にて webhook を追加し、シークレット、URLを設定
* カードの追加、ラベル付与、カラム移動等を行いログを見ながら config.json のID値を埋める
  * board, columns, labels, users
  * columns は web インスペクタで id 取得できたが他はログから拾うしか…ない？
  * GitHub トークンはネットワークタブから external-tokens
* 設定値が埋まったらサーバー再起動

