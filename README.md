# JibungotoPlanet-API

じぶんごとプラネットのカーボンフットプリント公開APIです。

## 概要

[Code for Japan](https://www.code4japan.org/) と[国立環境研究所](https://www.nies.go.jp/)の共同プロジェクトです。個人のカーボンフットプリント算出と脱炭素アクション提案のためのAPIを提供します。

公式サイト: https://jibungoto-planet.jp

## API サーバー

| 環境 | URL |
|------|-----|
| Production | https://public-api.jibungoto-planet.jp/ |
| Development | https://dev-api.jibungoto-planet.jp/ |

## API エンドポイント

### Footprints API（カーボンフットプリントデータ）

地域・都市別のカーボンフットプリントデータを取得します。

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/footprints/{type}` | タイプ別一覧（City, Region, Metropolitan など） |
| GET | `/footprints/{type}/{city_name}` | 都市別データ |
| GET | `/footprints/{type}/{city_name}/{domain}` | ドメイン別（Housing, Mobility, Food など） |
| GET | `/footprints/{type}/{city_name}/{domain}/{component}` | 詳細コンポーネント |

**パラメータ:**
- `type`: City, Region, Metropolitan, Class, Country
- `city_name`: Tokyo, Osaka, Nagoya など
- `domain`: Housing, Mobility, Food, Goods, Leisure, Services

### ChangeImpacts API（ライフスタイル変更の削減効果）

ライフスタイル変更による CO2 削減ポテンシャルを取得します。

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/changeImpacts/{type}` | タイプ別一覧 |
| GET | `/changeImpacts/{type}/{city_name}` | 都市別データ |
| GET | `/changeImpacts/{type}/{city_name}/{domain}` | ドメイン別（Housing, Mobility, Food, Other） |
| GET | `/changeImpacts/{type}/{city_name}/{domain}/{group}` | アクショングループ別 |
| GET | `/changeImpacts/{type}/{city_name}/{domain}/{group}/{options}` | 具体的なオプション |

**アクショングループ例:**
- Renewable Energy, Eco House, Modal Shift, Food Loss, Protein Shift など

### Calculates API（カーボンフットプリント計算）

ユーザーの回答に基づいてカーボンフットプリントを計算します。

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| POST | `/calculates` | 新規プロファイル作成 |
| GET | `/calculates/{id}` | プロファイル取得 |
| PUT | `/calculates/{id}` | プロファイル更新・再計算 |

## リクエスト/レスポンス例

### Footprints API

```bash
# 東京のカーボンフットプリントを取得
curl https://public-api.jibungoto-planet.jp/footprints/City/Tokyo
```

**レスポンス例:**
```json
[
  {
    "city_name": "Tokyo",
    "CarbonFootprints": 7.8,
    "Domain": "Housing",
    "Component": "Electricity",
    "Type": "City"
  },
  ...
]
```

### Calculates API

```bash
# プロファイル作成
curl -X POST https://public-api.jibungoto-planet.jp/calculates \
  -H "Content-Type: application/json" \
  -d '{"estimate": true}'
```

```bash
# プロファイル更新（回答に基づく計算）
curl -X PUT https://public-api.jibungoto-planet.jp/calculates/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "estimate": true,
    "mobilityAnswer": {
      "hasPrivateCar": true,
      "privateCarAnnualMileage": 10000,
      "carIntensityFactorFirstKey": "gasoline"
    },
    "housingAnswer": {
      "residentCount": 3,
      "electricityMonthlyConsumption": 300
    }
  }'
```

## API 仕様書

詳細な API 仕様は OpenAPI 形式で提供しています。

- [OpenAPI 仕様書](docs/openapi.yaml)

## 技術スタック

- **言語**: TypeScript 5.9
- **ランタイム**: Node.js 22.x
- **フレームワーク**: Express 5.x
- **インフラ**: AWS CDK / Lambda / DynamoDB / API Gateway
- **AWS SDK**: v3 (@aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb)

## 開発

### 必要要件

- Node.js 22.x 以上
- Yarn
- AWS CLI（デプロイ時）

### セットアップ

```bash
# 依存関係のインストール
yarn install

# ビルド
yarn build

# テスト
yarn test

# リント
yarn lint
yarn lint:fix
```

### CDK コマンド

```bash
# 差分確認
yarn cdk diff

# デプロイ
yarn cdk deploy

# CloudFormation テンプレート生成
yarn cdk synth
```

## データモデル

カーボンフットプリントは4つのドメインで構成されています。

| ドメイン | 説明 |
|---------|------|
| Housing | 住居（電気、ガス、灯油など） |
| Mobility | 移動（自家用車、公共交通機関、航空機など） |
| Food | 食（肉類、乳製品、外食など） |
| Other | モノとサービス（衣類、家電、レジャーなど） |

**計算式:**
```
カーボンフットプリント = amount × intensity
```

## 関連プロジェクト

- [JibungotoPlanet-backend](https://github.com/codeforjapan/JibungotoPlanet-backend) - バックエンドロジック実装
- [Footprint-Jibungoto](https://github.com/codeforjapan/Footprint-Jibungoto) - フロントエンド

## ライセンス

[MIT License](LICENSE.md)
