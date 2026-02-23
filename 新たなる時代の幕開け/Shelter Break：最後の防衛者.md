
## 2Dキャラクター単体防衛型タワーディフェンス 仕様書

---

## 1. ゲームタイトル

**『Shelter Break：最後の防衛者』**

---

## 2. ゲームジャンル・基本情報

|項目|内容|
|---|---|
|ジャンル|**2D 防衛型タワーディフェンス（単体キャラ操作）**|
|視点|2D 上から見下ろし|
|操作対象|主人公1キャラのみ|
|攻撃|自動攻撃|
|強化|プレイヤーが選択|
|プラットフォーム|Webブラウザ（HTML / CSS / JavaScript）|
|描画方式|Canvas（2D）|
|想定プレイ時間|5〜10分|
|セーブ|なし|

---

## 3. ストーリー

西暦2000年。  
魔王、女神、佐藤武志の戦いの余波によって異世界は崩壊した。
その余波により、爆発的なエネルギーが現実世界に流れ込み、現実世界にも影響が出始める。
謎の生命体ガイザーが現実世界に出現し始める。

都市の一角に設けられた小さな**避難所**。
混乱する人々の中で、その前に立つのは、ただ一人の防衛者。 
頼れるのは、己の身体と、進化する戦闘能力のみ。

> 「ここは、俺が守る」

ただ一人、とある若者が立ち上がったのだった。

---

## 4. ゲームの流れ

### 4.1 タイトル画面

- タイトル表示
- STARTボタン
### 4.2 プレイ画面

- 中央付近に **避難所**
    
- 主人公は **自由に移動可能**
    
- 敵は上下左右・斜めすべての方向から出現
    
- 主人公は **自動で最も近い敵を攻撃**
    

↓

### 4.3 強化選択

- 敵を一定数倒すと一時停止
    
- **攻撃強化を3択で選択**
    

↓

### 4.4 終了

- 避難所HPが0 → ゲームオーバー
    
- 規定Wave生存 → クリア
    

---

## 5. 勝敗条件

### 勝利条件

- 最終Wave（例：Wave10）を防衛
    

### 敗北条件

- 避難所HPが0
    

---

## 6. 操作方法

### PC

|操作|内容|
|---|---|
|WASD / 矢印キー|主人公移動|
|マウス|UI操作（強化選択）|

### スマホ

|操作|内容|
|---|---|
|仮想スティック|主人公移動|
|タップ|強化選択|

※ 攻撃操作は存在しない（完全自動）

---

## 7. 主人公仕様

|項目|内容|
|---|---|
|HP|100|
|移動速度|初期 3px / frame|
|攻撃範囲|円形（例：半径120px）|
|攻撃間隔|1秒|
|ターゲット|最も近い敵|

---

## 8. 攻撃システム（自動）

### 攻撃ロジック

1. 攻撃範囲内の敵を探索
    
2. 最短距離の敵を選択
    
3. 攻撃タイプに応じて弾・エフェクト生成
    
4. 命中時にダメージ計算
    

---

## 9. 攻撃タイプ（切替・成長）

※ 初期は1種類のみ  
※ 強化選択で増加・進化

|攻撃|内容|
|---|---|
|通常弾|直線弾、単体|
|貫通弾|複数ヒット|
|拡散弾|扇状に発射|
|レーザー|即時ヒット|
|爆発弾|範囲ダメージ|

---

## 10. 強化システム（最重要）

### 強化発生条件

- 敵撃破数が一定数に達すると発動
    
- ゲームを一時停止して表示
    

### 強化3択（例）

- 攻撃力 +20%
    
- 攻撃速度 +25%
    
- 攻撃範囲 +15%
    
- 弾数 +1
    
- 貫通回数 +1
    
- 爆発範囲追加
    

※ 同じ強化は重複可能  
※ 後半は強力な組み合わせが生まれる

---

## 11. 敵キャラクター

|種類|HP|速度|特徴|
|---|---|---|---|
|小型魔物|20|高|数が多い|
|重装魔物|80|低|耐久型|
|飛行魔族|40|高|主人公優先|
|ボス|500|中|範囲攻撃|

---

## 12. Wave構成

- Waveは時間制 or 撃破数制
    
- Wave進行で以下が増加
    
    - 出現数
        
    - 同時出現数
        
    - 敵HP倍率
        

---

## 13. 画面構成

### UI

- 上部：Wave数
    
- 左上：避難所HP
    
- 右上：撃破数
    
- 中央：Canvas描画領域
    
- 強化選択時：中央にオーバーレイ表示
    

---

## 14. 必要な画像素材（最低限）

|用途|サイズ|備考|
|---|---|---|
|主人公|32x32|円 or 四角でも可|
|敵|24x24|種類ごと色違い|
|弾|8x8|円|
|避難所|64x64|固定|

※ 実装初期は図形描画で代用可

画像生成：[Bing image creator](https://www.bing.com/images/create/e58fb3e38292e59091e3818f/1-698721454756416da40b0efac71ab3f4?FORM=GUH2CR)


---

## 15. 技術仕様（Claude実装前提）

### JavaScript構成例

- Player クラス
    
- Enemy クラス
    
- Bullet クラス
    
- Game クラス
    
- UpgradeManager
    
- WaveManager
    

### ゲームループ

- requestAnimationFrame
    
- update()
    
- draw()
    

### 衝突判定

- 円 × 円 距離判定
    

---

## 16. Claude / Gemini 向け実装要点まとめ

- **Canvas 2Dのみ使用**
    
- Three.js 不要
    
- 自動攻撃ロジック必須
    
- 強化選択UI必須
    
- 1ファイル（index.html）構成可能
    

---

## 17. このゲームの面白さ

- **操作は移動のみ → 判断は強化選択**
    
- 成長のインフレ感
    
- 組み合わせ次第で壊れ性能
    
- 短時間で「俺つえー」体験


# 画像素材一覧（Gemini用）

## 全体アート方針（超重要）

- 視点：**2D・真上〜やや斜め見下ろし**
- テイスト：**現代 × 異世界崩壊後**
- 彩度：やや低め（敵は目立つ色）
- 輪郭：はっきり（Canvas描画で潰れない）
- 背景：**透過前提 or 単色**

---

## 1. 主人公キャラクター

### 用途

- プレイヤー操作キャラ
- 常時画面に表示
### 推奨サイズ

- **32×32 px**（後で拡大可）

### デザイン要素

- 現代人＋簡易装備
- 異世界エネルギーを纏う
- 正面〜斜め上視点

---

### Gemini用プロンプト（主人公）

#### 日本語

2Dゲーム用の女性主人公キャラクター。

かっこよさと可愛さを両立したデザイン。
SAOのゼッケンのような、クールで俊敏な剣士のイメージ。
軽装の戦闘服、現代風とファンタジー要素の融合。
異世界エネルギーの光をまとっている。
視点はトップダウン（真上〜やや斜め）。
シンプルで視認性の高いゲームスプライト風。
背景は透過または単色。
黒髪、ロング、かわいさとかっこよさをもつ。
赤系
アニメのような絵

#### English（Gemini安定用）

`2D top-down game character. Modern Japanese male survivor with simple combat gear. Glowing with mysterious fantasy energy. Top-down or slight isometric view. Clean silhouette, high visibility. Transparent or solid background.`

---

## 2. 避難所（拠点）

### 用途

- 防衛対象
    
- 中央固定
    

### 推奨サイズ

- **64×64 px**
    

### デザイン要素

- コンクリート製
    
- 現代的だが破損あり
    
- 発光コア
    

---

### Gemini用プロンプト（避難所）

#### 日本語

`2Dゲーム用の避難所拠点。 現代的なコンクリートシェルター。 一部が破損しており、内部から光が漏れている。 トップダウン視点。 背景は透過。`

#### English

`2D top-down shelter building. Modern concrete bunker with damaged parts. Glowing core inside. Simple readable design. Transparent background.`

---

## 3. 敵キャラ① 小型魔物（雑魚）

### 推奨サイズ

- **24×24 px**
    

### デザイン

- 異世界生物
- 赤 or 紫系
    

---

### Gemini用プロンプト（小型魔物）

`2D top-down small monster enemy. Fantasy creature with sharp silhouette. Aggressive appearance. Bright color for visibility. Simple shape, game sprite style. Transparent background.`

---

## 4. 敵キャラ② 重装魔物（耐久型）

### 推奨サイズ

- **28×28 px**
    

### デザイン

- 鎧・甲殻
    
- 鈍重
    
- 暗色
    

---

### Gemini用プロンプト（重装）

`2D top-down armored monster. Heavy fantasy creature with armor plates. Slow but powerful look. Dark color palette. Game sprite style. Transparent background.`

---

## 5. 敵キャラ③ 飛行魔族

### 推奨サイズ

- **24×24 px**
    

### デザイン

- 羽・浮遊
    
- 主人公狙い
    
- 青・緑系
    

---

### Gemini用プロンプト（飛行）

`2D top-down flying demon enemy. Floating creature with wings. Fast and agile. Bright fantasy colors. Simple readable sprite. Transparent background.`

---

## 6. ボス敵

### 推奨サイズ

- **64×64 px**
    

### デザイン

- 異世界崩壊の象徴
    
- 巨大
    
- 威圧感
    

---

### Gemini用プロンプト（ボス）

`2D top-down boss monster. Large fantasy abomination. Symbol of dimensional collapse. Menacing and powerful. High detail but clear silhouette. Transparent background.`

---

## 7. 弾・攻撃エフェクト

### 弾（通常）

`2D game projectile. Simple glowing energy bullet. Top-down view. Bright color. Transparent background.`

### 爆発エフェクト

`2D game explosion effect. Fantasy energy burst. Circular shape. Transparent background.`

---

## 8. 強化UI用アイコン（任意）

### 用途

- 強化選択画面
    

`2D game UI icon. Fantasy upgrade symbol. Simple flat design. High contrast. Transparent background.`