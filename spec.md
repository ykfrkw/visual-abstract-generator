# Visual Abstract Generator — 仕様書

**バージョン**: 1.0.0
**作成日**: 2026-03-11
**対象**: GitHub Pages 静的ウェブアプリ
**主な用途**: 系統的レビュー・メタアナリシス (SR&MA) のビジュアルアブストラクト生成

---

## 目次

1. [概要 (Overview)](#1-概要)
2. [リサーチサマリー (Research Summary)](#2-リサーチサマリー)
3. [コンテンツ仕様 (Content Specification)](#3-コンテンツ仕様)
4. [テンプレート仕様 (Template Specification)](#4-テンプレート仕様)
5. [メインパネル種類 (Main Panel Types)](#5-メインパネル種類)
6. [カラーパレット (Color Palettes)](#6-カラーパレット)
7. [画像処理機能 (Image Processing)](#7-画像処理機能)
8. [エクスポート仕様 (Export Specification)](#8-エクスポート仕様)
9. [技術スタック (Tech Stack)](#9-技術スタック)
10. [実装フェーズ (Implementation Phases)](#10-実装フェーズ)

---

## 1. 概要

### 1.1 目的

系統的レビュー・メタアナリシス (SR&MA) の著者が、主要医学誌 (BMJ, JAMA, NEJM, Lancet) の視覚的スタイルに準拠したビジュアルアブストラクトを、ブラウザ上で完結して作成・エクスポートできるツール。

**ビジュアルアブストラクトとは**: 研究論文のPICO要素・主要所見・GRADE確信度を、アイコン・テキスト・図を組み合わせた1枚の画像に凝縮した視覚的サマリー。Twitter/X・LinkedIn等のSNSでの拡散を主目的とする。

### 1.2 ターゲットユーザー

- SR&MAを執筆・投稿する臨床研究者
- 医学誌への投稿準備を行う研究チーム
- 研究普及・アウトリーチに関わる機関（大学病院、研究所）

### 1.3 主要機能

| 機能 | 概要 |
|------|------|
| ジャーナルテンプレート | BMJ / JAMA / NEJM / Lancet スタイルのレイアウト |
| PICO入力フォーム | P/I/C/O を構造化入力 |
| メインパネル選択 | Summary of Findings表 / 画像挿入 / 森林プロット要約 |
| GRADE表示 | 確信度（High/Moderate/Low/Very Low）の視覚化 |
| カラーパレット選択 | ジャーナル標準色 or カスタム |
| PNG/PDFエクスポート | 高解像度（300 DPI相当）出力 |
| ブラウザ完結 | サーバー不要・GitHub Pages で動作 |

---

## 2. リサーチサマリー

### 2.1 BMJ

**出典**: [BMJ Author Hub](https://authors.bmj.com/writing-and-formatting/formatting-your-paper/), [The BMJ Visual Abstracts — Information is Beautiful Awards](https://www.informationisbeautifulawards.com/showcase/3117-the-bmj-visual-abstracts), [Pragmatic evaluation of The BMJ's visual abstracts (Stamer 2020)](https://www.jbe-platform.com/content/journals/10.1075/idj.25.1.08sta)

| 項目 | 仕様 |
|------|------|
| **標準寸法** | 1024 × 1024 px（正方形） |
| **アスペクト比** | 1:1 |
| **ファイル形式** | JPEG または PNG（300 DPI推奨） |
| **主要ブランドカラー** | 赤: `#D0021B`、濃グレー: `#333333`、白: `#FFFFFF` |
| **フォント** | セリフ系（印刷時）/ サンセリフ系（デジタル） |
| **レイアウト** | 上部：タイトル・ジャーナルロゴ帯 / 中央：PICO＋結果アイコン / 下部：DOI・引用情報 |

**設計の特徴**:
- 77名の医療専門家へのフィードバック調査に基づき設計（Stamer 2020）
- 参加者から「もっと詳細な統計を」という要望あり → 数値表示を重視
- 結論を上部に配置することへの要望が強い
- SNS映えを重視した正方形フォーマット（Instagram・旧Twitter最適化）
- BMJ Rapid Recommendationsのインフォグラフィックサマリーはより詳細なGRADE表示を含む

**必須要素**:
1. 論文タイトル（簡潔版）
2. ジャーナルロゴ / BMJブランドカラー帯
3. 人口集団アイコン（Population）
4. 介入・比較対照の視覚化
5. 主要アウトカム（数値付き）
6. 結論メッセージ
7. DOI / 引用情報

### 2.2 JAMA / JAMA Network

**出典**: [JAMA Visual Abstracts page](https://jamanetwork.com/pages/visual-abstracts), [Icons at the JAMA Network — AMA Style Insider](https://amastyleinsider.com/2022/03/28/icons-at-the-jama-network/), [JAMA Technical Requirements for Figures](https://jamanetwork.com/DocumentLibrary/InstructionsForAuthors/TechnicalRequirementsforFigures.pdf)

| 項目 | 仕様 |
|------|------|
| **標準寸法** | 1200 × 628 px（Twitter Card最適化）または 1080 × 1080 px |
| **最小解像度** | ≥350 ppi（印刷品質） |
| **ファイル形式** | 提出時: AI, EPS, PDF, TIF, JPG, PNG（≤1 MB/ファイル） |
| **カラーモード** | RGB（画面表示）/ CMYK（印刷時） |
| **ブランドカラー** | 紺: `#374E55`、オレンジ: `#DF8F44`、青: `#00A1D5`、赤: `#B24745` |

**アイコン設計仕様（JAMA独自）**:
- Population/Intervention/Conditionアイコン: **72 × 72 px フィールド**上に作成
- Setting/Locationアイコン: **32 × 32 px フィールド**
- アイコン数: 約300種（痤瘡から放射線まで）
- 設計原則: 「サイト読み」できるほど単純に。Twitterで見たときに潰れないよう最小限の詳細
- 詳細ガイド: AMA Manual of Style Chapter 4.2.10

**レイアウト特徴**:
- RCT向けに設計されたテンプレート（PICO＋主要所見）
- 既存JAMAブランドの色・フォント・デザインガイドライン準拠
- 学術的外観を維持しつつSNS対応
- ランダム化臨床試験の視覚的アブストラクトがSNS経由Webトラフィックを有意に増加させると報告（JAMA 2023）

### 2.3 NEJM

**出典**: [NEJM Visual Abstract page](https://www.nejm.org/browse/nejm-media-type/visual-abstract), [NEJM Technical Guidelines for Figures](https://www.nejm.org/pb-assets/pdfs/Technical-Guidelines-for-Figures-1511366945697.pdf), [ggsci: NEJM color palettes](https://nanx.me/ggsci/reference/pal_nejm.html)

| 項目 | 仕様 |
|------|------|
| **スタイル特徴** | 各論文で固有のカラーパレット（統一テンプレートなし） |
| **情報密度** | 主要誌の中でも最も低密度・ミニマル |
| **フォント** | Univers（アブストラクト・著者名・図説明） / Quadraat（本文） |
| **ブランドカラー** | 赤: `#FF3300`、Link Blue: `#084E9B`、MMS Blue: `#007AAB` |
| **背景色** | Light Gray: `#EDF2F6`、Dark Gray: `#808285` |
| **ggsci パレット** | 8色: `#BC3C29`, `#0072B5`, `#E18727`, `#20854E`, `#7876B1`, `#6F99AD`, `#FFDC91`, `#EE4C97` |

**設計の特徴**:
- シンプルなテンプレートを3種類のバリエーションで実行
- 各ビジュアルアブストラクトに固有のカラーパレット → 統一感より個性を重視
- NEJMレッド（`#FF3300`）は帯やアクセントに使用
- 情報密度が低く、1〜2の主要メッセージに絞り込む

### 2.4 The Lancet

**出典**: [Lancet Graphical Abstracts page](https://www.thelancet.com/infographics/graphical-abstracts), [mindthegraph.com guide](https://mindthegraph.com/blog/how-to-create-a-graphical-abstract-for-the-lancet-publication/), [ggsci: Lancet color palettes](https://rdrr.io/cran/ggsci/man/pal_lancet.html)

| 項目 | 仕様 |
|------|------|
| **推奨寸法** | 9 cm × 9 cm（300 DPI → 1063 × 1063 px相当） |
| **ファイル形式** | TIFF, JPEG, EPS, PDF, PowerPoint |
| **解像度** | 300 DPI（入稿サイズの120%で作成推奨） |
| **ggsci パレット（lanonc）** | 9色: `#00468B`, `#ED0000`, `#42B540`, `#0099B4`, `#925E9F`, `#FDAF91`, `#AD002A`, `#ADB6B6`, `#1B1919` |

**設計の特徴**:
- 正確さ・明確さを最優先
- 論文との整合性（矛盾する結論・誇張した表現は不可）
- クラッターを避けたクリーンなレイアウト
- ランセットはインフォグラフィックとして独自のビジュアルアブストラクトを制作・公開

### 2.5 JACC（参考）

**出典**: [JACC Guidelines for Visual Abstracts PDF](https://www.jacc.org/pb-assets/documents/jacc-basic-translational/Guidelines%20for%20Visual%20Abstracts-1710860476850.pdf)

| 項目 | 仕様 |
|------|------|
| **推奨フォーマット** | TIF形式 |
| **解像度** | カラー: ≥300 DPI / 線画: ≥1200 DPI |
| **推奨フォントサイズ** | 12pt（縮小後も読める大きさ） |
| **最小図サイズ** | 13 cm × 18 cm |

**設計ガイドライン**:
- 「シンプルなビジュアルアブストラクトの方が複雑なものより良い」
- 棒グラフ禁止 → 代わりに上下矢印等で傾向を示す
- テキストは最小限に → 視覚的伝達を優先

### 2.6 ACCP（参考）

**出典**: [ACCP Visual Abstract Best Practices PDF](https://www.accp.com/docs/resfel/vac/VAC_Best_Practices.pdf)

| 項目 | 仕様 |
|------|------|
| **寸法** | 1600 × 900 px（16:9） |
| **ファイル形式** | JPG または PNG |
| **変換方法** | PowerPoint → Export → JPEG/PNG |

### 2.7 共通所見のサマリー

主要ジャーナルの比較：

| ジャーナル | 寸法 | アスペクト比 | 形式 | 特徴 |
|-----------|------|------------|------|------|
| BMJ | 1024×1024 px | 1:1 | JPEG/PNG | 正方形・SNS優先・赤ブランド |
| JAMA | 1200×628 px | 1.91:1 | TIFF/PNG/JPG | Twitterカード・アイコンライブラリ |
| NEJM | 固有（推定1200×628前後） | 可変 | — | ミニマル・各論文で色が異なる |
| Lancet | 9×9 cm（≒1063×1063px） | 1:1 | TIFF/JPEG/EPS | 正確さ優先・クリーン |
| JACC | 500×700 px min | 可変 | TIF | 矢印多用・テキスト最小 |
| ACCP | 1600×900 px | 16:9 | JPG/PNG | ワイド・全フィールド明記 |

**SNSプラットフォーム別推奨サイズ**:
- Twitter/X リンクカード: 1200×628 px（1.91:1）
- Instagram 正方形: 1080×1080 px（1:1）
- LinkedIn: 1200×627 px（1.91:1）

---

## 3. コンテンツ仕様

### 3.1 データモデル（YAML スキーマ）

```yaml
# visual_abstract_content.yaml
# SR&MA向けビジュアルアブストラクト コンテンツモデル

meta:
  template: "bmj" | "jama" | "nejm" | "lancet" | "custom"
  export_format: "png" | "pdf" | "both"
  export_width_px: 1024          # デフォルト 1024
  export_height_px: 1024         # デフォルト 1024
  dpi: 300                       # 72 | 150 | 300
  created_at: "2026-01-01"

# ヘッダーセクション
header:
  title: "string (max 120 chars)"           # 論文タイトル（短縮版）
  authors: "string (max 80 chars)"          # 著者名（例: Furukawa YF et al.）
  journal: "string"                         # 投稿先ジャーナル名
  year: 2026
  doi: "10.xxxx/xxxxxx"                     # DOI（optional）
  show_journal_logo: true                   # ジャーナルロゴ帯を表示
  show_qr_code: false                       # QRコード表示

# PICOセクション
pico:
  population:
    text: "string (max 80 chars)"           # 例: Adults with chronic insomnia
    icon: "person" | "group" | "patient_bed" | "custom_url"
    n_total: 5000                           # 参加者総数（optional）
    n_studies: 42                           # 研究数
    study_design: "RCT" | "cohort" | "case-control" | "mixed"

  intervention:
    text: "string (max 80 chars)"           # 例: Cognitive Behavioural Therapy for Insomnia
    abbreviation: "string (max 20 chars)"   # 例: CBT-I
    icon: "pill" | "brain" | "talk" | "custom_url"

  comparator:
    text: "string (max 80 chars)"           # 例: Placebo / Waitlist / TAU
    abbreviation: "string (max 20 chars)"
    icon: "pill" | "person_outline" | "custom_url"
    show: true

  outcomes:
    primary:
      name: "string (max 60 chars)"         # 例: Sleep onset latency
      unit: "string (max 30 chars)"         # 例: minutes
    secondary:
      - name: "string"
        unit: "string"

# メインパネル（3種類から選択）
main_panel:
  type: "summary_of_findings" | "image_upload" | "forest_plot_summary"

  # type: summary_of_findings の場合
  sof_table:
    outcomes:
      - name: "Sleep onset latency"
        n_studies: 12
        n_participants: 1840
        effect_size: "MD -22 min"
        ci_95: "(-28 to -16)"
        certainty: "high" | "moderate" | "low" | "very_low"
        certainty_downgrade_reason: "string (optional)"
        direction: "favors_intervention" | "favors_comparator" | "no_difference"
      # ... 最大6行
    footnote: "string (optional)"

  # type: image_upload の場合
  image_upload:
    file_url: "data:image/..."              # base64またはBlob URL
    caption: "string (max 100 chars)"
    crop: { x: 0, y: 0, width: 400, height: 300 }
    remove_background: false

  # type: forest_plot_summary の場合
  forest_plot_summary:
    outcome_name: "string"
    effect_measure: "OR" | "RR" | "MD" | "SMD" | "HR"
    pooled_estimate: 0.65
    ci_lower: 0.52
    ci_upper: 0.81
    p_value: "<0.001"
    i_squared: 35
    n_studies: 12
    n_participants: 1840
    favors_label_left: "Intervention"
    favors_label_right: "Comparator"
    null_value: 1                          # OR/RR/HR = 1, MD/SMD = 0

# キーナンバーボックス（オプション）
key_numbers:
  show: true
  items:
    - label: "Studies"
      value: "42"
      icon: "document"
    - label: "Participants"
      value: "8,492"
      icon: "people"
    - label: "Follow-up"
      value: "6 months"
      icon: "calendar"
    # 最大4項目

# 結論メッセージ
conclusion:
  text: "string (max 200 chars)"           # 主要結論文
  direction: "positive" | "negative" | "neutral" | "uncertain"
  highlight: true                           # 強調表示

# フッター
footer:
  show_doi: true
  show_funding: false
  funding_text: "string (optional)"
  custom_note: "string (optional)"

# デザイン設定
design:
  color_palette: "bmj" | "jama" | "nejm" | "lancet" | "custom"
  custom_colors:
    primary: "#D0021B"
    secondary: "#333333"
    accent: "#F5A623"
    background: "#FFFFFF"
    text: "#212121"
    success: "#417505"                     # favors intervention
    danger: "#D0021B"                      # favors comparator
    neutral: "#9B9B9B"
  font_family: "Inter" | "Source Sans Pro" | "Noto Sans" | "system-ui"
  show_grid: false                         # デバッグ用グリッド表示
```

### 3.2 GRADE確信度の表示仕様

| 確信度 | 英語表記 | 記号 | カラー | 意味 |
|--------|---------|------|--------|------|
| High | High certainty | ⊕⊕⊕⊕ | `#417505` (緑) | 真の効果が推定値に近い |
| Moderate | Moderate certainty | ⊕⊕⊕○ | `#F5A623` (オレンジ) | 真の効果は推定値に近いが異なる可能性あり |
| Low | Low certainty | ⊕⊕○○ | `#E8AC00` (黄) | 真の効果は推定値と大幅に異なる可能性あり |
| Very Low | Very low certainty | ⊕○○○ | `#D0021B` (赤) | 真の効果は推定値と大幅に異なる可能性が高い |

---

## 4. テンプレート仕様

### 4.1 BMJスタイル

**寸法**: 1024 × 1024 px（エクスポート時300 DPI相当 = 3.41インチ角）

```
┌─────────────────────────────────────────┐  ← y=0
│ [BMJ RED BAND #D0021B]  BMJ  2026       │  ← h=80px (Header Band)
├─────────────────────────────────────────┤  ← y=80
│                                         │
│  TITLE (max 2行, 22px, Bold)            │  ← h=100px
│  Authors et al.  Journal Year           │
│                                         │
├──────────────┬──────────────────────────┤  ← y=180
│  POPULATION  │   INTERVENTION           │  ← h=140px (PICO Row 1)
│  [icon]      │   [icon]                 │
│  N=8,492     │   CBT-I                  │
│  42 studies  │   vs Waitlist            │
├──────────────┴──────────────────────────┤  ← y=320
│                                         │
│  ──── MAIN PANEL ────                   │  ← h=440px (Main Panel)
│  [SoF Table / Image / Forest Plot]      │
│                                         │
├─────────────────────────────────────────┤  ← y=760
│  KEY NUMBERS: [Studies: 42] [N: 8,492]  │  ← h=80px (Key Numbers)
├─────────────────────────────────────────┤  ← y=840
│  CONCLUSION (bold, 16px)                │  ← h=100px (Conclusion)
│  "CBT-I significantly reduces SOL..."   │
├─────────────────────────────────────────┤  ← y=940
│  DOI: 10.xxxx/xxxx    [QR]   BMJ logo  │  ← h=84px (Footer)
└─────────────────────────────────────────┘  ← y=1024
```

**カラー仕様**:
- Header Band: `#D0021B`（BMJレッド）、テキスト: `#FFFFFF`
- 背景: `#FFFFFF`
- PICO Row背景: `#F8F8F8`
- Main Panel背景: `#FFFFFF`
- Key Numbers背景: `#F0F0F0`
- Conclusion背景: `#FFF8F8`（薄ピンク）または `#FFFFFF`
- Footer Band: `#333333`、テキスト: `#FFFFFF`

**タイポグラフィ**:
- Header: 18px Bold、White
- Title: 22px Bold、`#333333`
- Authors: 13px Regular、`#666666`
- PICO Labels: 11px AllCaps、`#D0021B`
- PICO Values: 15px Bold、`#333333`
- Main Panel Header: 12px AllCaps Bold、`#666666`
- Key Numbers Value: 24px Bold、`#333333`
- Key Numbers Label: 11px Regular、`#666666`
- Conclusion: 16px SemiBold、`#333333`
- Footer: 11px Regular、`#FFFFFF`

### 4.2 JAMAスタイル

**寸法**: 1200 × 628 px（Twitter Card 1.91:1）または 1080 × 1080 px

```
┌──────────────────────────────────────────────────────────┐  ← y=0
│ [JAMA NAVY BAND #374E55]  JAMA Network  2026             │  ← h=60px
├──────────────────────────────────────────────────────────┤  ← y=60
│                                                          │
│  TITLE (20px Bold, max 2行)                              │  ← h=90px
│  Furukawa YF et al. JAMA 2026;326:xxx-xxx               │
│                                                          │
├────────────┬────────────┬────────────┬────────────────────┤  ← y=150
│ POPULATION │INTERVENTION│ COMPARATOR │   OUTCOME          │  ← h=120px
│ [icon]     │ [icon]     │ [icon]     │   [icon]           │
│ Adults w/  │ CBT-I      │ Waitlist   │   SOL (min)        │
│ insomnia   │            │            │                    │
├────────────┴────────────┴────────────┴────────────────────┤  ← y=270
│                                                          │
│  ──── MAIN PANEL ────                                    │  ← h=220px
│  [SoF Table / Image / Forest Plot Summary]               │
│                                                          │
├──────────────────────────────────────────────────────────┤  ← y=490
│  [Studies: 42]  [Participants: 8,492]  [F/up: 6mo]      │  ← h=60px
├──────────────────────────────────────────────────────────┤  ← y=550
│  CONCLUSION: CBT-I significantly reduces sleep onset...  │  ← h=48px
├──────────────────────────────────────────────────────────┤  ← y=598
│  DOI  |  Presented at: SLEEP 2026  |  © 2026 JAMA       │  ← h=30px
└──────────────────────────────────────────────────────────┘  ← y=628
```

**カラー仕様**:
- Header Band: `#374E55`（JAMAネイビー）
- Accent: `#DF8F44`（オレンジ）
- Secondary Accent: `#00A1D5`（水色）
- PICO区切り線: `#E0E0E0`

### 4.3 NEJMスタイル

**寸法**: 1200 × 628 px（ミニマル設計）

NEJMは論文ごとに固有カラーを使用。テンプレートは「空白の美」を重視。

```
┌──────────────────────────────────────────────────────────┐
│ [NEJM RED STRIPE]                               NEJM     │  ← h=50px
├──────────────────────────────────────────────────────────┤
│                                                          │
│         TITLE (大きめ、26px Bold)                        │  ← h=100px
│         Authors et al. NEJM 2026                        │
│                                                          │
├────────────────────────┬─────────────────────────────────┤
│  POPULATION & DESIGN   │   KEY FINDING                   │  ← h=350px
│  (左半分)              │   (右半分、大きな数字・図)       │
│                        │                                 │
│  N = 8,492             │   OR 0.65                       │
│  42 RCTs               │   (95% CI 0.52–0.81)            │
│  CBT-I vs Waitlist     │   [視覚的要素]                   │
│                        │                                 │
├────────────────────────┴─────────────────────────────────┤
│  DOI   |   [QR Code]                                    │  ← h=50px
└──────────────────────────────────────────────────────────┘
```

### 4.4 Lancetスタイル

**寸法**: 1063 × 1063 px（9cm × 9cm @ 300DPI）

```
┌─────────────────────────────────────────┐
│ [LANCET RED #ED0000]  The Lancet  2026  │  ← h=70px
├─────────────────────────────────────────┤
│                                         │
│  TITLE (20px)                           │  ← h=90px
│  Authors et al. Lancet 2026;407:xxx     │
│                                         │
├─────────────────────────────────────────┤
│  P: Adults with chronic insomnia        │  ← h=120px (PICO text行)
│  I: CBT-I (N=4,246, 42 studies)        │
│  C: Waitlist / TAU                      │
│  O: Sleep onset latency, sleep quality  │
├─────────────────────────────────────────┤
│                                         │
│  MAIN PANEL (SoF / image / forest)      │  ← h=550px
│                                         │
├─────────────────────────────────────────┤
│  Conclusion                             │  ← h=90px
│  DOI  |  © 2026 Elsevier               │  ← h=50px (最下段)
└─────────────────────────────────────────┘
```

### 4.5 カスタムテンプレート

ユーザーが以下を自由設定できるモード:
- レイアウト（グリッドベース）
- カラーパレット
- 各セクションの表示/非表示
- テキストサイズ・フォントウェイト
- ヘッダーバンドの色・ロゴ

---

## 5. メインパネル種類

### 5.1 Summary of Findings (SoF) 表

SR&MA向けの最重要パネル。GRADE確信度を含む。

**レイアウト（最大6行）**:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Outcome          Studies  Participants  Effect          Certainty   │
│                   (N)      (n)                                       │
├──────────────────────────────────────────────────────────────────────┤
│  Sleep onset lat. 12       1,840         MD -22 min      ⊕⊕⊕⊕ HIGH  │
│                                          (-28 to -16)               │
├──────────────────────────────────────────────────────────────────────┤
│  PSQI total score 18       2,340         SMD -0.87       ⊕⊕⊕○ MOD   │
│                                          (-1.10 to -0.64)           │
├──────────────────────────────────────────────────────────────────────┤
│  Wake after sleep  8       1,200         MD -18 min      ⊕⊕○○ LOW   │
│  onset                                   (-26 to -10)               │
└──────────────────────────────────────────────────────────────────────┘
```

**GRADE確信度バッジ**:
- `⊕⊕⊕⊕ HIGH`: 緑背景 `#417505` + 白テキスト
- `⊕⊕⊕○ MODERATE`: オレンジ背景 `#F5A623` + 白テキスト
- `⊕⊕○○ LOW`: 黄背景 `#E8AC00` + 黒テキスト
- `⊕○○○ VERY LOW`: 赤背景 `#D0021B` + 白テキスト

**方向性矢印**:
- 介入を支持: ↑ または → `#417505`
- 比較対照を支持: ↓ または ← `#D0021B`
- 差なし: ↔ `#9B9B9B`

### 5.2 画像挿入パネル

研究デザイン図・概念図・写真等を挿入するパネル。

**機能**:
- ファイルアップロード（PNG, JPG, SVG）
- ドラッグ＆ドロップ
- クロップ（アスペクト比ロック可）
- フィット/フィルモード切替
- キャプションテキスト入力
- オーバーレイテキスト（タイトル・ラベル追加）
- 背景除去（remove.bg API または canvas-based）

### 5.3 森林プロット要約パネル

実際の森林プロットではなく、メタアナリシスの主要結果を視覚化した要約図。

**表示要素**:

```
┌──────────────────────────────────────────────────────────┐
│  Outcome: Sleep onset latency                            │
│                                                          │
│  Effect measure: Mean Difference (minutes)               │
│                                                          │
│  ────────────────●─────────────  ← プールド推定値        │
│                 -22                                      │
│  95% CI: -28 to -16                                      │
│                                                          │
│  Favors CBT-I ←            → Favors Control             │
│  ─────────────|─────────────                             │
│              (0)                                         │
│                                                          │
│  I² = 35%  |  12 studies  |  1,840 participants          │
│  p < 0.001                                               │
└──────────────────────────────────────────────────────────┘
```

**視覚化パラメータ**:
- ダイヤモンド（◆）: プールド推定値と95% CI
- 縦点線: ヌル値（効果なし）
- X軸: 効果の大きさ（ラベル付き）
- ヘテロジェニティ: I²値を色で示す（低<25%: 緑、中25-75%: 黄、高>75%: 赤）

---

## 6. カラーパレット

### 6.1 BMJパレット（ggsci::pal_bmj）

BMJ Living Style Guideに基づく9色パレット:

| 名前 | Hex | 用途 |
|------|-----|------|
| BMJ Red | `#D0021B` | ヘッダー帯、強調 |
| Dark Gray | `#333333` | 本文テキスト |
| Medium Gray | `#666666` | サブテキスト |
| Light Gray | `#F5F5F5` | 背景 |
| White | `#FFFFFF` | メイン背景 |
| Blue | `#0072CE` | リンク、アクセント |
| Green | `#417505` | ポジティブ結果 |
| Orange | `#F5A623` | 警告、Moderate |
| Light Red | `#FF6B6B` | セカンダリアクセント |

### 6.2 JAMAパレット（ggsci::pal_jama）

7色パレット:

| 名前 | Hex | 用途 |
|------|-----|------|
| JAMA Teal | `#374E55` | ヘッダー帯 |
| JAMA Orange | `#DF8F44` | アクセント、アウトカム |
| JAMA Blue | `#00A1D5` | 介入 |
| JAMA Red | `#B24745` | 危険・比較対照 |
| JAMA Green | `#79AF97` | 人口集団 |
| JAMA Purple | `#6A6599` | 設定 |
| JAMA Brown | `#80796B` | 補足情報 |

### 6.3 NEJMパレット（ggsci::pal_nejm）

8色パレット:

| 名前 | Hex | 用途 |
|------|-----|------|
| NEJM Red | `#BC3C29` | メインアクセント |
| NEJM Blue | `#0072B5` | 介入 |
| NEJM Orange | `#E18727` | 比較対照 |
| NEJM Green | `#20854E` | ポジティブ |
| NEJM Purple | `#7876B1` | 追加要素 |
| NEJM Muted Blue | `#6F99AD` | 背景要素 |
| NEJM Yellow | `#FFDC91` | ハイライト |
| NEJM Pink | `#EE4C97` | 特殊強調 |

*ブランドカラー*: NEJM Red: `#FF3300`、MMS Blue: `#007AAB`

### 6.4 Lancetパレット（ggsci::pal_lancet "lanonc"）

9色パレット:

| 名前 | Hex | 用途 |
|------|-----|------|
| Lancet Navy | `#00468B` | ヘッダー帯 |
| Lancet Red | `#ED0000` | ブランドカラー |
| Lancet Green | `#42B540` | ポジティブ |
| Lancet Teal | `#0099B4` | 介入 |
| Lancet Purple | `#925E9F` | 比較対照 |
| Lancet Salmon | `#FDAF91` | 背景アクセント |
| Lancet Crimson | `#AD002A` | 強調 |
| Lancet Gray | `#ADB6B6` | サブ要素 |
| Lancet Black | `#1B1919` | テキスト |

### 6.5 カスタムパレット

ユーザーが任意の5色（Primary, Secondary, Accent, Background, Text）を設定可能。

カラーアクセシビリティチェック:
- WCAGコントラスト比チェック（AA: 4.5:1以上）
- 色覚多様性対応チェック（Deuteranopia / Protanopia シミュレーション）

---

## 7. 画像処理機能

### 7.1 画像アップロード

```
対応形式: PNG, JPEG, WebP, SVG, GIF（静止）
最大ファイルサイズ: 10MB
処理: FileReader API → Canvas → DataURL
```

### 7.2 クロップ機能

- インタラクティブクロップUI（Fabric.jsのselectionを活用）
- プリセットアスペクト比: 1:1 / 16:9 / 4:3 / フリー
- クロップ後に内部座標を保持（非破壊的）

### 7.3 スケール・フィット

- **Contain**: アスペクト比を保ちパネル内に収める
- **Cover**: アスペクト比を保ちパネルを埋める（余白トリム）
- **Stretch**: パネルサイズに引き伸ばす

### 7.4 オーバーレイテキスト

画像パネル上に以下をオーバーレイ可能:
- キャプションテキスト（半透明黒背景付き）
- アノテーション矢印
- ラベルボックス

### 7.5 背景除去（オプション機能）

**実装方針**:
- Phase 1: 手動（背景なし画像をユーザーが準備）
- Phase 2: `@imgly/background-removal` (WebAssembly, ブラウザ内処理, 無料)
  - サーバー不要
  - 処理時間: 2〜5秒（モデルサイズ: ~80MB）
  - 精度: 医療系アイコン・人物像に十分

---

## 8. エクスポート仕様

### 8.1 PNG出力（最優先）

```javascript
// Fabric.js を使った高解像度PNG出力の実装方針

const EXPORT_CONFIG = {
  web_preview: {
    multiplier: 1.0,
    format: 'png',
    quality: 0.95,
    // 1024x1024 px (画面表示サイズそのまま)
  },
  social_media: {
    multiplier: 2.0,
    format: 'png',
    quality: 0.95,
    // 2048x2048 px (Retinaディスプレイ対応)
  },
  print_300dpi: {
    multiplier: 4.17,  // 300 DPI / 72 DPI ≈ 4.17
    format: 'png',
    quality: 1.0,
    // 4271x4271 px (300 DPI @ 3.41インチ角)
    // 注: Blob API使用 (base64 DataURL超過回避)
  }
};

// 出力時のBlob化（大きいファイル対応）
canvas.toBlob((blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'visual-abstract.png';
  link.click();
  URL.revokeObjectURL(url);
}, 'image/png');
```

**エクスポートプリセット**:
| プリセット | 解像度 | 用途 |
|-----------|--------|------|
| SNS (Web) | 1024×1024 px (72 DPI) | Twitter, Instagram投稿 |
| SNS HD | 2048×2048 px (144 DPI) | Retina対応SNS |
| Journal (300 DPI) | ~3413×3413 px (300 DPI) | ジャーナル投稿 |
| Twitter Card | 1200×628 px (72 DPI) | Twitterカードリンク |

### 8.2 PDF出力（二次優先）

**使用ライブラリ**: jsPDF + html2canvas または Fabric.js toDataURL → jsPDF.addImage

```javascript
// jsPDF実装方針
import jsPDF from 'jspdf';

async function exportPDF(fabricCanvas, options = {}) {
  const { width_mm = 90, height_mm = 90, dpi = 300 } = options;

  // Fabric.jsキャンバスを高解像度PNGに変換
  const imgData = fabricCanvas.toDataURL({
    format: 'png',
    multiplier: 4.17
  });

  const pdf = new jsPDF({
    orientation: width_mm >= height_mm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [width_mm, height_mm]
  });

  pdf.addImage(imgData, 'PNG', 0, 0, width_mm, height_mm);
  pdf.save('visual-abstract.pdf');
}
```

**PDF出力プリセット**:
| プリセット | サイズ | 用途 |
|-----------|--------|------|
| A4 (Portrait) | 210×297 mm | プレゼン資料、印刷 |
| Square (9×9 cm) | 90×90 mm | Lancet仕様 |
| Twitter Card | 127×66 mm | Twitter Card等倍 |
| カスタム | ユーザー入力 | 任意 |

---

## 9. 技術スタック

### 9.1 推奨スタック

```
フレームワーク:  Vanilla JavaScript + ES Modules
キャンバス:      Fabric.js v6.x
エクスポート:    Fabric.js toDataURL / toBlob + jsPDF v2.x
フォント:        Google Fonts (Inter, Source Sans Pro) via @font-face
アイコン:        Lucide Icons (SVG) + カスタムSVGセット
スタイリング:    CSS Custom Properties (CSS変数) + minimal CSS framework
ビルド:          Vite (GitHub Pages デプロイ用)
ホスティング:    GitHub Pages (静的)
背景除去(Phase2): @imgly/background-removal (WASM)
```

### 9.2 技術選定の根拠

#### Vanilla JS vs React/Vue

**Vanilla JS を選択する理由**:
- GitHub Pages = 純粋な静的ファイル配信。ビルドステップなしで動作可
- Fabric.jsはフレームワーク非依存のCanvas操作に特化
- React/Vueのvirtual DOM管理はCanvas操作と競合しやすい（再レンダリング問題）
- バンドルサイズが小さく初期ロードが速い
- 依存関係が少なくメンテナンスが容易

**ただし Vite を使う理由**:
- ES Modules + npm packages の管理
- HMR（開発時のホットリロード）
- GitHub Actions での `vite build` → `gh-pages` 自動デプロイ

#### Canvas API vs SVG vs html2canvas

| 手法 | メリット | デメリット | 採用 |
|------|---------|----------|------|
| Canvas API (直接) | 高速・精密制御 | 複雑・DXのコード量大 | ✗ |
| **Fabric.js (Canvas)** | **インタラクティブ・高解像度出力・豊富なAPI** | ライブラリサイズ (~500KB gzip ~150KB) | **◎** |
| SVG | ベクター・スケーラブル | PNG出力での フォント埋め込みが困難 | △ (補助) |
| html2canvas | HTML/CSSをそのまま使える | 高DPI出力が不安定・フォント問題 | ✗ |

**Fabric.js を採用する理由**:
- `toDataURL({ multiplier: 4.17 })` で300DPI相当の高解像度PNG出力が可能
- オブジェクト（テキスト・画像・図形）を個別に操作可能（ドラッグ、リサイズ等）
- `toBlob()` でBlob APIを使った大ファイル出力が可能
- SVGオブジェクトも読み込み可能（アイコンの高品質表示）
- v6でTypeScriptサポート改善

#### jsPDF for PDF

- クライアントサイド完結
- `addImage()` でFabric.jsのPNG出力を直接埋め込み可
- A4等の標準サイズとカスタムサイズ対応
- GitHub Pages で動作（サーバー不要）

### 9.3 ファイル構成（推奨）

```
visual-abstract/
├── index.html                  # メインUI
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                 # エントリーポイント
│   ├── canvas/
│   │   ├── CanvasManager.js    # Fabric.jsラッパー
│   │   ├── templates/
│   │   │   ├── bmj.js          # BMJテンプレート定義
│   │   │   ├── jama.js         # JAMAテンプレート定義
│   │   │   ├── nejm.js         # NEJMテンプレート定義
│   │   │   ├── lancet.js       # Lancetテンプレート定義
│   │   │   └── custom.js       # カスタムテンプレート
│   │   └── panels/
│   │       ├── SofTable.js     # Summary of Findingsパネル
│   │       ├── ImagePanel.js   # 画像挿入パネル
│   │       └── ForestPlot.js   # 森林プロット要約パネル
│   ├── export/
│   │   ├── PngExporter.js      # PNG高解像度出力
│   │   └── PdfExporter.js      # PDF出力 (jsPDF)
│   ├── ui/
│   │   ├── FormManager.js      # 入力フォーム管理
│   │   ├── ColorPicker.js      # カラーパレット選択
│   │   └── panels.js           # パネル種類選択UI
│   ├── data/
│   │   ├── palettes.js         # カラーパレット定義
│   │   └── icons.js            # アイコンSVGデータ
│   └── utils/
│       ├── gradeBadge.js       # GRADEバッジ生成
│       ├── contrast.js         # アクセシビリティチェック
│       └── formatter.js        # 数値フォーマット
├── public/
│   ├── fonts/                  # フォントファイル（オフライン対応）
│   └── icons/                  # SVGアイコンセット
└── dist/                       # Viteビルド出力 (GitHub Pages公開)
```

### 9.4 主要ライブラリのバージョン（2026年3月時点）

```json
{
  "dependencies": {
    "fabric": "^6.4.0",
    "jspdf": "^2.5.1"
  },
  "devDependencies": {
    "vite": "^5.4.0"
  },
  "optionalDependencies": {
    "@imgly/background-removal": "^1.4.0"
  }
}
```

---

## 10. 実装フェーズ

### Phase 1: MVP（最小実用バージョン）— 目標: 2週間

**目標**: BMJスタイルで、SoF表パネルを持つビジュアルアブストラクトを生成してPNGダウンロードできる。

**実装タスク**:

- [ ] **P1-1** Viteプロジェクトセットアップ + GitHub Pages CI/CD
- [ ] **P1-2** Fabric.js 基本キャンバス (1024×1024 px)
- [ ] **P1-3** BMJテンプレートレイアウト実装（ハードコードから開始）
- [ ] **P1-4** テキスト入力フォーム（タイトル・著者・DOI）
- [ ] **P1-5** PICOフォーム入力 → キャンバス反映
- [ ] **P1-6** SoF表パネル（最大4行、GRADE確信度バッジ付き）
- [ ] **P1-7** PNG出力（SNS用 1× / 印刷用 4× の2プリセット）
- [ ] **P1-8** リアルタイムプレビュー（フォーム変更 → 即時反映）

**Phase 1 完了の定義**:
BMJスタイルで不眠症CBT-IのSR&MAビジュアルアブストラクトを5分以内に作成・PNG出力できること。

### Phase 2: 主要機能拡張 — 目標: +2週間

- [ ] **P2-1** JAMAテンプレート（1200×628 px）
- [ ] **P2-2** NEJMテンプレート（ミニマルスタイル）
- [ ] **P2-3** Lancetテンプレート（1063×1063 px）
- [ ] **P2-4** 画像挿入パネル（アップロード・クロップ）
- [ ] **P2-5** 森林プロット要約パネル（ダイヤモンド図）
- [ ] **P2-6** カラーパレット選択UI（ジャーナル4種 + カスタム）
- [ ] **P2-7** キー数値ボックス（Studies / Participants / Follow-up）
- [ ] **P2-8** PDF出力（jsPDF）

### Phase 3: UX改善・高度機能 — 目標: +3週間

- [ ] **P3-1** ドラッグ＆ドロップ画像アップロード
- [ ] **P3-2** 背景除去機能（@imgly/background-removal）
- [ ] **P3-3** SVGアイコンライブラリ（PICO向け30種以上）
- [ ] **P3-4** コンテンツの JSON保存・読み込み（ローカルストレージ）
- [ ] **P3-5** テンプレートカスタマイズUI（色・フォント・レイアウト調整）
- [ ] **P3-6** WCAGコントラスト比チェック
- [ ] **P3-7** QRコード生成（DOIから自動）
- [ ] **P3-8** モバイル対応レスポンシブUI

### Phase 4: 発展機能 — 優先度「あれば良い」

- [ ] **P4-1** 色覚多様性シミュレーション（Deuteranopia / Protanopia）
- [ ] **P4-2** アニメーション対応（GIF出力）
- [ ] **P4-3** テンプレートシェア機能（URLパラメータエンコード）
- [ ] **P4-4** Tailwind CSS移行（スタイリング効率化）
- [ ] **P4-5** i18n対応（英語/日本語切替）

---

## 付録A: 参考文献・情報源

### ジャーナルガイドライン

1. BMJ Author Hub - Formatting your paper: https://authors.bmj.com/writing-and-formatting/formatting-your-paper/
2. The BMJ Visual Abstracts — Information is Beautiful Awards: https://www.informationisbeautifulawards.com/showcase/3117-the-bmj-visual-abstracts
3. Stamer M (2020). Pragmatic evaluation of The BMJ's visual abstracts. *Information Design Journal*, 25(1). https://www.jbe-platform.com/content/journals/10.1075/idj.25.1.08sta
4. JAMA Network Visual Abstracts: https://jamanetwork.com/pages/visual-abstracts
5. Icons at the JAMA Network — AMA Style Insider (2022): https://amastyleinsider.com/2022/03/28/icons-at-the-jama-network/
6. JAMA Technical Requirements for Figures: https://jamanetwork.com/DocumentLibrary/InstructionsForAuthors/TechnicalRequirementsforFigures.pdf
7. NEJM Visual Abstract collection: https://www.nejm.org/browse/nejm-media-type/visual-abstract
8. NEJM Technical Guidelines for Figures: https://www.nejm.org/pb-assets/pdfs/Technical-Guidelines-for-Figures-1511366945697.pdf
9. Lancet Graphical Abstracts: https://www.thelancet.com/infographics/graphical-abstracts
10. JACC Guidelines for Visual Abstracts: https://www.jacc.org/pb-assets/documents/jacc-basic-translational/Guidelines%20for%20Visual%20Abstracts-1710860476850.pdf
11. ACCP Visual Abstract Best Practices: https://www.accp.com/docs/resfel/vac/VAC_Best_Practices.pdf
12. Cochrane New Systematic Review Visual Abstract: https://us.cochrane.org/news/new-systematic-review-visual-abstract

### デザイン・研究

13. Franconeri SL et al. (2021). The Science of Visual Data Communication. *Psychological Science in the Public Interest*, 22(3), 110-161.
14. Ibrahim AM et al. (2017). Seeing Is Believing: A Randomized Controlled Pilot Study of Visual Abstracts. *Annals of Surgery*, 265(4), e6-e9.
15. Millar M & Lim J (2022). The Role of Visual Abstracts in the Dissemination of Medical Research. PMC9200102: https://pmc.ncbi.nlm.nih.gov/articles/PMC9200102/
16. Delort A et al. (2024). Ten simple rules for designing graphical abstracts. *PLOS Computational Biology*. https://pmc.ncbi.nlm.nih.gov/articles/PMC10833524/
17. Charting the landscape of graphical displays for meta-analysis: https://bmcmedresmethodol.biomedcentral.com/articles/10.1186/s12874-020-0911-9

### カラーパレット

18. ggsci R package (Nan Xiao): https://nanx.me/ggsci/
19. pal_nejm documentation: https://nanx.me/ggsci/reference/pal_nejm.html
20. pal_jama documentation: https://nanx.me/ggsci/reference/pal_jama.html
21. pal_lancet documentation: https://rdrr.io/cran/ggsci/man/pal_lancet.html
22. pal_bmj documentation: https://nanx.me/ggsci/reference/pal_bmj.html
23. NEJM color guide (MMS/NEJM CE): https://ce.massmed.nejm.org/styleguide

### 技術ライブラリ

24. Fabric.js: https://fabricjs.com/
25. jsPDF: https://github.com/parallax/jsPDF
26. @imgly/background-removal: https://github.com/imgly/background-removal-js
27. Lucide Icons: https://lucide.dev/
28. Vite: https://vitejs.dev/

---

## 付録B: 既知の制約・注意事項

### ブラウザ制約

1. **Canvas解像度上限**: Chrome/Safariは最大 ~16384×16384 px。300 DPI × A4（3508×4961 px）は問題なし。
2. **Blobサイズ**: toDataURL()で4× multiplierを使うと base64文字列が ~10MB超になることがある → 必ずBlob API (`toBlob()`) を使うこと。
3. **CORS制約**: 外部URLの画像をキャンバスに描画すると "tainted canvas" エラー。対策: プロキシまたはbase64変換。
4. **フォントレンダリング**: Fabric.jsはブラウザ内蔵フォントを使用。`FontFace` APIで事前ロードが必要。

### ジャーナル投稿時の注意

1. 本ツールで生成した画像はジャーナルの要求仕様を**満たす可能性が高いが保証しない**。最終的には各ジャーナルの最新Author Instructionsを確認すること。
2. ジャーナルロゴの使用は各社著作権ポリシーに従うこと（ビジュアルアブストラクト内での使用は一般的に許可されているが確認推奨）。
3. ビジュアルアブストラクトの内容は論文の結論と矛盾しないこと（特にLancet）。

### GRADE表示の注意

1. GRADEの確信度は本ツールのユーザーが入力した値を表示するのみ。自動計算はしない。
2. ⊕○○○ 等の記号はGradeProの標準記号に合わせること。
