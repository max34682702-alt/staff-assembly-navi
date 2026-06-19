# 職員参集ナビ

介護施設向けのスマホ対応Webアプリ／PWAです。地震発生時に、職員が参集判断を確認し、施設へ送る報告文を作成・コピーできます。

## 起動方法

```bash
npm install
npm run dev
```

表示されたローカルURLをブラウザで開いて確認してください。

## ビルド

```bash
npm run build
```

## 設定

施設情報は `src/facilityConfig.js` で管理します。

## 災害時に備えた周知

災害時に使用できるよう、職員は平時に一度アプリを開き、必要に応じてスマホのホーム画面に追加してください。事前に読み込まれていない場合、通信圏外ではアプリを開けない可能性があります。

## GitHub Pages公開手順

1. GitHubで新しいリポジトリを作成します。
2. このプロジェクトのファイルをアップロードします。
3. GitHub Actionsまたはgh-pagesを使って公開します。
4. GitHub Actionsを使う場合は、リポジトリのSettings → PagesでSourceを「GitHub Actions」にします。
5. `main`ブランチにpushすると、`.github/workflows/deploy.yml`が自動で`npm install`、`npm run build`、GitHub Pagesへの公開を行います。
6. 公開後、スマホでGitHub PagesのURLを開きます。
7. iPhoneの場合はSafariの共有ボタンから「ホーム画面に追加」を選びます。
8. Androidの場合はChromeのメニューから「ホーム画面に追加」または「アプリをインストール」を選びます。

画面確認だけをしたい場合は、`standalone-preview.html`をダブルクリックして開けます。このファイルはGitHub Pages公開用ではなく、確認用です。
