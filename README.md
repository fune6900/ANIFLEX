# ANIFLEX

NetflixのUI/UXを模倣したアニメ・声優発見プラットフォームです。「アニメ」+「Netflix」を組み合わせたネーミングで、日本語UIで構築されています。

---

## 技術スタック

| 分野 | 技術 |
|------|------|
| フレームワーク | Next.js 15.3.8 (App Router) |
| UI | React 19 + TypeScript 5 |
| スタイリング | Tailwind CSS 3.4.1 |
| データソース | TMDb API (映画・TVデータベース) |
| デプロイ | Docker / Docker Compose |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx      # ルートレイアウト（Navbar・Footer含む）
│   ├── page.tsx        # ホームページ（ハードコードされたアニメデータ）
│   └── globals.css     # グローバルスタイル
├── components/
│   ├── Navbar.tsx      # ナビゲーション・検索バー
│   ├── HeroSection.tsx # メインビジュアル（進撃の巨人）
│   └── ContentRow.tsx  # 横スクロールのアニメカード列
├── lib/
│   └── tmdb.ts         # TMDb APIクライアント
└── types/
    └── tmdb.ts         # TypeScript型定義
```

---

## 主な機能

- **Navbar** - 赤いロゴ、検索ボックス、プロフィールドロップダウン
- **HeroSection** - 進撃の巨人をフィーチャーした大型バナー（再生・詳細ボタン付き）
- **ContentRow** - 横スクロール可能なアニメカード（ホバーで詳細パネル表示）
- **ホームページ** - Top 10人気アニメ、ANIFLEXオリジナル、新着トレンド、人気声優など5セクション

---

## デザインの特徴

- メインカラー: `#141414`（黒）、`#E50914`（Netflixレッド）
- フォント: Netflix Sans / Helvetica Neue
- ホバーエフェクト、スムーズスクロール、カスタムスクロールバー非表示
- レスポンシブ対応（モバイル・タブレット・デスクトップ）

---

## 現状

- UIは完全実装済み（Netflix風のダークテーマ、レスポンシブ対応）
- アニメデータはハードコード（鬼滅の刃、僕のヒーローアカデミア、ワンピースなど）
- TMDb APIの統合フレームワークは準備済みだが、実際のAPIコール未実装
- 検索機能はUIのみ（機能未実装）
- 言語設定: `lang="ja"`、日本語コンテンツ中心

---

## セットアップ

### 環境変数

`.env.local.example` を参考に `.env.local` を作成してください。

```env
TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

TMDb APIキーは [https://www.themoviedb.org/](https://www.themoviedb.org/) から取得できます。

### ローカル開発

```bash
npm install
npm run dev
```

### Docker

```bash
docker-compose up
```

アプリケーションは `http://localhost:3000` で起動します。

### NPMスクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLintによるコード検査 |

---

## ライセンス

© 2025 ANIFLEX
