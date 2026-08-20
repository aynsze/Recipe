# Recipe

GitHubリポジトリをレシピDBとして利用する、GitHub Pages向けのレシピ管理アプリ。

レシピの閲覧はログイン不要。
レシピの追加・編集にはGitHub認証を使用する。

---

## 機能

### レシピ一覧

- レシピ一覧表示
- タイトル・カテゴリ・メモ・材料名・事前準備・手順を全文検索
- カテゴリによる絞り込み
- 並び替え
- レシピをクリックして詳細画面へ移動

### レシピ詳細

- レシピ名・画像・カテゴリ・評価・出典を表示
- 材料一覧を表示
- 事前準備を表示
- 調理手順を表示
- メモを表示
- レシピURLを表示
- 分量を変更して表示
  - 通常
  - 1/3
  - 1/2
  - 2倍

### レシピ追加

- GitHubログイン後にレシピを追加
- レシピJSONを自動生成
- `data/index.json` を自動更新
- レシピJSONと`index.json`を1コミットで保存
- ファイル名の重複を保存前にチェック
- 日本語ファイル名に対応
- `.json`拡張子を自動付与
- ファイル名未入力時はタイトルから自動生成

### レシピ編集

- GitHubログイン後に既存レシピを編集
- 既存のJSONファイルをGitHub API経由で更新
- ファイル名は変更しない
- 編集後の内容を詳細画面へ即時反映

### 入力フォーム

- 材料・事前準備・手順を動的に追加
- 最後の行に入力すると次の空行を自動追加
- 1行のみの場合は削除不可
- 1行のみの場合は削除ボタンを非表示
- 事前準備・手順の番号を自動更新
- 材料の分量に`type="number"`を使用
- 材料の単位を選択式で入力
- 材料グループをA〜Dから選択

---

## 使い方

### レシピの閲覧

GitHub Pagesへアクセスすると、`data/index.json`を読み込み、登録されているレシピを一覧表示する。

レシピ一覧からレシピを選択すると、詳細画面へ移動する。

```text
index.html
   ↓
マカロニグラタンをクリック
   ↓
detail.html?file=macaroni-gratin.json
   ↓
data/macaroni-gratin.json
```

### レシピの追加

1. GitHubにログイン
2. 「追加」から入力フォームを開く
3. レシピ情報を入力
4. ファイル名を入力
5. 保存

ファイル名が入力されていない場合は、レシピタイトルから自動生成する。

保存時に以下の2ファイルをGitHubへ1コミットで保存する。

```text
data/
├── index.json
└── macaroni-gratin.json
```

### レシピの編集

1. GitHubにログイン
2. レシピ詳細画面を開く
3. 「編集」を選択
4. 内容を変更
5. 保存

編集では既存のJSONファイルを更新する。

ファイル名は変更しない。

---

## 設定

### PATの作成方法

GitHub APIを使用してレシピを追加・編集するため、Fine-grained Personal Access Token（PAT）を使用する。

1. GitHubの [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens)から新しい`Fine-grained PAT`を作成
2. `Repository access` > `Only select repositories`を選択
3. レシピ用のリポジトリだけ選択
4. `Repository permissions` > `Contents` > `Read and write`

| 項目              | 設定                     |
| ----------------- | ------------------------ |
| Token name        | レシピ                   |
| Expiration        | 90days                   |
| Repository access | ★レシピ用リポジトリ      |
| Permissions       | Contents: Read and write |

### 注意

PATをアプリのコードに直接書かない。

```js
const TOKEN = "github_pat_xxxxxxxxx";
```

PATはGitHub認証処理から入力し、アプリのソースコードやGitHubリポジトリへ直接記載しない。

### GitHub Pagesの設定方法

| 項目   | 設定                     |
| ------ | ------------------------ |
| Source | **Deploy from a branch** |
| Branch | **main**                 |
| Folder | **/ (root)**             |

---

## データ構造

GitHubリポジトリ内のJSONファイルをレシピDBとして使用する。

```text
                 ┌───────────────┐
                 │ GitHub Pages  │
                 └───────┬───────┘
                         │
                ┌────────┴────────┐
                │                 │
              閲覧              編集
                │                 │
                ▼                 ▼
        data/*.json        GitHub認証
        images/*                │
                                ▼
                           GitHub API
                                │
                                ▼
                         data/*.json
                         images/*
```

### index.json

`data/index.json`には、レシピJSONのファイル名を配列として保存する。

```json
["curry.json", "oyakodon.json", "macaroni-gratin.json"]
```

一覧画面では、このファイルを読み込み、記載されたファイルを順番に取得する。

ファイル名は重複させない。

### レシピJSON

```json
{
  "title": "マカロニグラタン",
  "source": "arranged",
  "category": "主食",
  "rating": 4,
  "image": "https://example.com/image.jpg",
  "url": "https://example.com/recipe",
  "ingredients": [
    {
      "group": null,
      "name": "鶏もも肉",
      "amount": 300,
      "unit": "g"
    },
    {
      "group": null,
      "name": "牛乳",
      "amount": 400,
      "unit": "ml"
    }
  ],
  "preparation": ["鶏もも肉を一口大に切る", "オーブンを200℃に予熱する"],
  "steps": [
    "鍋にバターを溶かして、鶏肉を入れる",
    "鶏肉に火が通ったら玉ねぎを加えて炒める"
  ],
  "memo": ""
}
```

---

## レシピJSON仕様

| 項目          | 型     | 内容                  |
| ------------- | ------ | --------------------- |
| `title`       | string | レシピ名              |
| `source`      | string | 出典区分              |
| `category`    | string | カテゴリ              |
| `rating`      | number | 評価                  |
| `image`       | string | 画像URLまたは画像パス |
| `url`         | string | 元レシピURL           |
| `ingredients` | array  | 材料                  |
| `preparation` | array  | 事前準備              |
| `steps`       | array  | 調理手順              |
| `memo`        | string | メモ                  |

### source

| 値          | 表示     |
| ----------- | -------- |
| `original`  | 自作     |
| `arranged`  | アレンジ |
| `reference` | 参考     |

### category

以下のいずれか1つ。

```text
主食
肉類
魚類
副菜
おやつ
他
```

### rating

`0`〜`5`。

- `0` → 未設定
- `1`〜`5` → 評価

### ingredients

各材料は以下の形式。

```json
{
  "group": null,
  "name": "鶏もも肉",
  "amount": 300,
  "unit": "g"
}
```

| 項目     | 型              | 内容                 |
| -------- | --------------- | -------------------- |
| `group`  | string / null   | `A`〜`D`または`null` |
| `name`   | string          | 材料名               |
| `amount` | number / string | 分量                 |
| `unit`   | string / null   | 単位                 |

### unit

以下の単位を使用する。

```text
g
kg
ml
L
個
枚
袋
本
束
大さじ
中さじ
小さじ
適量
少々
```

数値として扱える分量は、詳細画面で倍率変更の対象となる。

文字列の分量はそのまま表示する。

### preparation

事前準備を配列で保存する。

```json
"preparation": [
  "材料を切る",
  "オーブンを予熱する"
]
```

### steps

調理手順を配列で保存する。

```json
"steps": [
  "材料を炒める",
  "調味料を加える"
]
```

### image

外部URL、またはGitHubリポジトリ内の画像パスを指定する。

例：

```text
https://example.com/image.jpg
```

または

```text
images/curry.jpg
```

---

## ファイル名

### 新規追加

「追加」からファイル名を入力する。

ファイル名を入力しない場合は、タイトルをファイル名として使用する。

```text
マカロニグラタン
↓
マカロニグラタン.json
```

`.json`が付いていない場合は自動的に追加する。

日本語ファイル名も使用可能。

### 編集

編集時はファイル名を変更しない。

ファイル名を変更したい場合はGitHub上で手動変更する。

### ファイル名の変更

レシピJSONのファイル名を変更する場合は、以下の2か所を変更する。

1. GitHub上でJSONファイルをリネーム
2. `data/index.json`のファイル名を変更

例：

```text
curry.json
↓
japanese-curry.json
```

`data/index.json`も、

```json
["japanese-curry.json"]
```

に変更する。

### ファイル名の重複

追加時に同じファイル名が存在する場合、GitHub APIへ保存する前に処理を停止する。

---

## GitHub API

GitHub PagesからGitHub APIを使用してレシピデータを取得・更新する。

### 閲覧

ログイン状態に関係なく、GitHub APIからレシピJSONを読み込む。

```text
GitHub Pages
    ↓
GitHub API
    ↓
data/index.json
    ↓
data/*.json
```

### 編集

レシピの追加・編集時のみGitHub認証を使用する。

```text
GitHub Pages
    ↓
GitHub認証
    ↓
GitHub API
    ↓
data/*.json
```

レシピ追加時は、レシピJSONと`index.json`を1コミットで保存する。

---

## ファイル構造

```text
Recipe/
│
├── index.html              # 一覧画面
├── detail.html             # 詳細画面
├── style.css               # スタイル
│
├── src/
│   ├── main.js             # 一覧画面全体を組み合わせる
│   ├── recipe-list.js      # 一覧表示・検索・カテゴリ・並び替え
│   ├── recipe-form.js      # レシピ入力・JSON生成・追加・編集共通化
│   ├── recipe-editor.js    # レシピ編集
│   ├── github-api.js       # GitHub APIとの通信
│   ├── github-auth.js      # GitHub認証
│   ├── github-auth-ui.js   # GitHub認証UI
│   ├── notice.js           # 通知
│   └── auth.js             # GitHub認証情報管理
│
├── data/
│   ├── index.json          # レシピJSON一覧
│   ├── curry.json          # レシピデータ
│   └── oyakodon.json
│
└── images/
    ├── curry.jpg
    └── oyakodon.jpg
```

---

## 注意事項

- レシピの閲覧にはGitHubログイン不要
- レシピの追加・編集にはGitHubログインが必要
- PATをソースコードに直接記載しない
- `data/index.json`に存在しないレシピJSONは一覧に表示されない
- レシピJSONのファイル名を変更した場合、`data/index.json`も変更する
- レシピ編集ではファイル名を変更しない
- レシピ追加時は既存ファイル名との重複をチェックする
- GitHub APIを利用するため、GitHub側のAPI仕様や認証仕様の変更に影響を受ける

---

## 変更履歴

### [1.0.0] - 2026-08-20

- ✨ 初回リリース
