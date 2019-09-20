# Glo Webhooks

## はじめに

GitKraken Glo の webhook です。  
https://app.gitkraken.com/glo/  

## 機能
* タスク追加
  定義された作業中カラムにタスクを追加します。  
  他のカラムに作成した場合は強制的に作業中に移動します。
* カラム移動
  タスクをカラム移動した際に適切なラベルを付与します。
  ユーザーごとに移動可能なカラムを制限します。
* スケジュール連携
  追加されたタスクに期限日が設定してある場合は、アサインされたメンバーのGoogleカレンダーに予定を追加します。

## Running Locally
Prerequisites:
- Node v10


## 環境構築手順

1. 本プロジェクトを clone
2. `$ yarn`

### GitHub

1. GitHub にてタスク管理用のリポジトリを作成
2. 申請中、承認、却下のラベルを追加する

### Glo

1. GitKraken Glo にアクセスしGitHubアカウントでログイン
2. 「Create a synced board」を押下してリポジトリを選択しボードを作成
3. ボードのカラムを作成  
   作業中、申請中、承認、却下を作成する。
4. Personal Access Tokens を発行
   「Manage Account」→「DEVELOPER TOOLS」→「Personal Access Tokens」  
   SCOPE：[board:read] [board:write]
5. webhook を設定  
   「Board Settings」→「Webhooks」→「Add Webhook」  
   Payload URL は適当に…ここではシークレットキーが欲しいだけなので。


### Firebase
1. Firebase Console にてプロジェクトを作成
2. プロジェクトのプランを Spark → Blaze に変更  
   Sparkプランでは外部APIにアクセスできないため。
3. firebase-tools をセットアップ  
   https://firebase.google.com/docs/cli/?hl=ja  
   ログインしてプロジェクトの一覧を表示する
   ```
   $ firebase login
   $ firebase list
   ```  
   表示された Project ID を `.firebaserc` に以下のように記述する
   ```json
   {
     "projects": {
       "default": "project-id-1a34b"
     }
   }
   ```

### Google Cloud Platform

1. Google Cloud Platform にログイン
2. 新しいプロジェクトを作成
3. 新しいAPIとサービスを有効化
4. Google Calendar API を有効にする
5. 「APIとサービス」→「認証情報」→「認証情報を作成」  
   認証情報の種類：OAuth クライアントID  
   アプリケーションの種類：その他
   作成された OAuth 2.0 クライアントIDの認証情報を⬇️マークでダウンロードする


### 設定情報

1. Glo 
   ```
   $ firebase functions:config:set glo.token="personalaccesstoken"
   $ firebase functions:config:set glo.secret="webhooksecret"
   ```
2. GitHub  
   glo の一部の操作で GitHub のアクセストークンが必要となる。
   GitHub のアカウント画面で作成するか、ネットワークコンソール開きながらGloを操作して、  
   リクエストヘッダ内の external-tokens から取得可能。
   ```
   $ firebase functions:config:set github.token="githubaccesstoken"
   ```
3. Google Calendar（OAuth 2.0クライアントの認証情報より以下を取得）
   ```
   $ firebase functions:config:set google.calendar.credentials.client_id="xxxxxx.apps.googleusercontent.com"
   $ firebase functions:config:set google.calendar.credentials.client_secret="googleclientsecret"
   $ firebase functions:config:set google.calendar.credentials.redirect_uri="urn:jetf:xxx:xxx:xxxx:xx:xx"
   ```
4. ローカル用の設定を書き出す
   ```
   $ firebase functions:config:get > .runtimeconfig.json
   ```
5. Google API のリフレッシュトークンを取得するために一発コマンドを叩く
   ```
   $ babel-node misc/calendar
   ```
   プロジェクトノードに token.json ファイルが作成される
   ```
   $ firebase functions:config:set google.calendar.refresh_token="googleapirefreshtoken"
   ```
6. 再度ローカル用の設定を書き出す
   ```
   $ firebase functions:config:get > .runtimeconfig.json
   ```

### Glo 設定情報

1. Glo の各IDを取得する
   ```
   $ yarn gloconfig
   ```
2. src/setting.json を開いてボード、カラム、ラベルの値を埋める  


### ビルド、デバッグ

1. ビルド
   ```
   $ yarn build
   ```
2. ローカルサーバ開始
   ```
   $ yarn start
   ```
   localhost:5000 でローカルサーバ起動
3. 接続確認
   http://localhost:5000/glo-webhook-2a47f/us-central1/configTest 
   ＝＞firebase 設定がコンソール出力される
4. URLを外部公開
   ```
   $ yarn ngrok
   ```
   ＝＞https のURLをコピー
5. Glo Webhook の URL 欄に入れて保存
6. 動作確認（Glo）
   1. カードを追加する（due date をつける）
      ＝＞Github に issues が追加される
   2. カードを申請中に移動する
      ＝＞申請中ラベルが付与される
   3. カードを承認に移動する
      ＝＞承認ラベルが付与される
      ＝＞Google Calendar の当該日に予定が追加される


### デプロイ

1. デプロイ
   ```
   $ yarn deploy
   ```

2. Webhook URL を変更


