# タイトル

Pythonソースコードをパッケージ化する方法（他環境へ配布を目的として）（Poetry利用）

## 補足

本パッケージは、PoetryによるWheel形式のPKG作成方法を学ぶためのサンプルです。


# 概要

作成したPythonソースコードを他の環境に持って行って実行する、と言う観点でPythonでのパッケージ化の手順を説明する。

ローカルでの配布を想定し、The Python Package Index (PyPI)への登録などは論じない。

作成する配布用ファイルはWheel形式とし、作成方法は「`poetry`コマンドを用いる方法」を採用する。

「[`setup.py`を用いる方法（`setup()`を用いる方法）](https://qiita.com/hoshimado/items/7c99e6ef4c9d1bc6bb87)」との対比を意識して説明する。そのため本記事内には、対比先の記事と同一の説明を含む（扱いが`setup()`を用いる場合と同一の個所について）。


# 目的

Node.jsで言うところの「`npm --save　install [モジュール名]`コマンドで package.json に構築しておけばOK」をPythonでどうやるのか？　という疑問への回答を目的とする。

なお、上記に対してそのまま答えるのであれば「Pythonでは、poetryコマンドで依存関係を管理する場合は、`poetry new`で生成される`pyproject.toml`を一緒に添えておけばよい（受け取った側は `poetry install`する）」となる。
しかし本記事では、「Pythonでは、パッケージ形式（Wheel形式）に固めて配布し、それをインストールしてパッケージ呼び出し形式で使ってもらう」というケースへの対応を意図する。これは、Pythonの場合はこのケースへの要求が多い、ように感じられたためだ。



# 想定読者

* はじめてPythonに触れる人で、しかし他の言語でのプログラミング経験は有する方
    * Python特有の部分はともかく、とりあえずHello World的な出力は悩まずにPythonでコーディングできる方
* 自身が作成したPythonソースコードで必要な依存関係を、配布時にどう設定すればよいか？に迷っている方


# 動作環境（検証環境）

次の2つの環境で、サンプルコードの動作確認を実施済み。

* Windows 10
    * Python 3.11.5
* WSL2::Ubuntu 22.04.1 LTS
    * dockerイメージ「python:3.9-alpine3.18」

なお、「Python仮想環境」（以下、「仮想環境」と略記）を次のように使い分けるので、明示的に記載するようにする（poetryの仮想環境に集約すべきかもしれないが、パッケージ利用環境ではpoetry利用を強制したくない、ので）。

* パッケージの開発場面（動作確認とビルド等）はpoetryの仮想環境を利用
* ビルド済みのパッケージをインストールして動作確認＆利用する場面は、Python標準のvenvの仮想環境を利用

※「Python仮想環境とはなんぞや？」と言う方は、付録章の「[仮想環境とは？](#仮想環境とは)」を参照のこと。

何れの環境でも、`poetry`パッケージを`pip install poetry`コマンドで、仮想環境にではなく素のPython環境側にインストールしてあるものとする。また、インストール後に以下の設定を実行済みとする（Poetryの仮想環境の作成場所をプロジェクト直下とするオプション設定）。

```
poetry config virtualenvs.in-project true
```



# サンプルコード

以下を参照のこと。

https://github.com/hoshimado/qiita-notes/tree/main/qiita-python-packagebuild-poetry/


## パッケージ化対象のサンプルコードの仕様

本記事では、動作に追加パッケージを必要とするケースとして、次の仕様のサンプルコードを用いる。

* パッケージの本体は`weaherforecast`フォルダー
  * フォルダー内のPythonファイル`open_meteo_forecast_api.py`にて、「[Open-Meteo](https://open-meteo.com/)」が提供するWeb APIを利用して指定地点の向こう1週間の1h毎の予想気温を取得する関数「`get()`」を提供する
* 依存関係としてパッケージ「[requests](https://pypi.org/project/requests/)」を必要とする
* 次のようなファイル／フォルダー構造を持つものとする

```
+-- pyproject.toml
|   
\---weatherforecast/
    +-- open_meteo_forecast_api.py
    +-- __init__.py
    +-- __main__.py        
```

上記のコードの動作に必要な依存関係（追加パッケージ）をインストールするには次のようにする[^1]。

[^1]: Poetry関係しない動作確認だけが目的の場合は`pip install requests`でも良いのだが、今回はpoetryでの動作確認が目的なので、このようにする。

```
poetry shell
poetry add requests
```

1つ目のコマンドでPoetryの仮想環境に入り、Poetryの依存関係管理を用いて仮想環境にrequstsパッケージをインストールする。
なお、サンプルコードを用いて上記を実行すると、「既に依存関係として追加されている」と言う以下のメッセージが表示される。

```
The following packages are already present in the pyproject.toml and will be skipped:
  • requests
```

この場合は、続いて以下のコマンド用いる（未追加の場合は、追加のタイミングでインストールも走るので不要）。

```
poetry install
```

Poetryの仮想環境に入ったり出たりする方法は、付録章の「[仮想環境とは？](#仮想環境とは)」を参照のこと。


## サンプルコードの動作確認

このサンプルコードの動作確認は、以下のコマンドで実施できる。ここで、上述の`poetry shell`は実行済みであり、Poetryの仮想環境に入っているものとする。
（このコマンドは、サンプルコードのルートから見て、パッケージ`weatherforecast`を実行している。したがって package直下の`__main__.py`が実行される。このフォルダー構造としている理由は、付録章の「[ファイル構造に関する補足](#ファイル構造に関する補足)」を参照のこと）


```
python -m weatherforecast
```

上記を実行すると、東京の向こう1週間の1h毎の予想気温が出力される。


# パッケージファイル（Wheel形式）の作成方法

`pyproject.toml`に必要情報を記載して、`poetry build`コマンドを用いて、Wheel形式のパッケージを作成する。本節のコマンドは、素のPython上でもPoetryの仮想環境のどちらで実行しても良い。

`pyproject.toml`は例えば、次のように記載する。

```
[tool.poetry]
name = "weatherforecast"
version = "0.1.0"
description = "sample packages by poetry-toml"
authors = ["Your Name <you@example.com>"]
readme = "README.md"

[tool.poetry.dependencies]
python = ">=3.9,<3.13"
requests = "^2.31.0"


[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

このファイルは、ゼロから作成しても良いが、
`poetry new [projectname] --name [packagename]`コマンド[^2]を実行すると
次のような`pyproject.toml`ファイルを含んだpoetry標準構成が出力されるので、
こちらの雛型をベースに必要事項を修正、追記するのが楽である[^3]。

```
[projectname]/
+-- pyproject.toml
+-- README.md
│  
├── tests/
│   +-- __init__.py
│      
└── [packagename]/
    +--  __init__.py
```

[^2]: 「このコマンドは、ほとんどのプロジェクトに適するディレクトリ構造を作成して、新しいPythonプロジェクトに勢いをつける助けをしてくれます」, https://cocoatomo.github.io/poetry-ja/cli/#new
[^3]: 既存のPythonソースコードに対してパッケージの設定を行う際には、`poetry init`コマンドを用いる方法もある。 , https://cocoatomo.github.io/poetry-ja/cli/#init

ここで、パッケージの動作に必要な依存関係は、`poetry add`コマンドを用いて次のように設定する。

```
poetry add requests [other-package-name]
```

すると、poetryが`pyproject.toml`の`[tool.poetry.dependencies]`セクションに適切に追記してくれる。

なお、`poetry new`コマンドを用いて作成したひな形では（環境によるが）次のように初期設定されており、この状態だと`poetry add`コマンドでの任意のパッケージ追加時に「対象のパッケージのPythonバージョン条件（3.11以上、4.00未満）を満たすパッケージが見当たらない」と言うエラーになることがある。

```
[tool.poetry.dependencies]
python = "^3.11"
```

その場合は、たとえば次のようにPythonバージョンの条件を狭めるように記載を変更してから、`poetry add`コマンドを実行すると良い。

```
[tool.poetry.dependencies]
python = ">=3.9,<3.13"
```

もしくは、依存関係として必要なパッケージ一覧を記載したファイル`requirements.txt`がすでに存在している場合は、そちらに基づいてコマンド`poetry add $(cat requirements.txt)`で追加することもできる。

<!--
poetry addコマンドは、TOMLファイルの編集と同時にpoetryの仮想環境に対してパッケージのインストールも行ってくれる。
しかし、venvの仮想環境で実行した場合は、Linux環境ではPoetryの仮想環境と衝突し、
上手く動作しないので注意。回避手段があるのか「同時利用を避けよ」になるのか、要調査。
Windowsでは問題無く動作する。
 -->


上記のフォルダー構成を作成したら、パッケージフォルダー`./[packagename]/`へPythonファイル（Pythonモジュール）を格納する。`pyproject.toml`を上述のように作成した後、`pyproject.toml`ファイルのあるフォルダーで、おもむろに次のコマンドを実行する。

```
poetry build
```

`pyproject.toml`ファイルの記述に従い、(`name`キーに指定されたフォルダーを対象パッケージとして）パッケージが作成される。



以上で、パッケージ作成は完了。


# 作成したパッケージの動作確認の方法

Poetryの仮想環境に入っている場合は、いったん仮想環境を抜ける（`deactivate`コマンド）。

適当な任意のフォルダーに移動し、そこに真っ新な仮想環境を作成する。
たとえば、次のようにする（ここではPython標準のvenv仮想環境を用いるものとする）。

```
/home/work/downloads # python -m venv .venv_dl
/home/work/downloads # source  .venv_dl/bin/activate
```

作成したPython仮想環境に入っているパッケージを確認すると、次のようになっている。

```
(.venv_dl) /home/work/downloads # pip list
---------- -------
pip        23.0.1
setuptools 58.1.0
```

この環境に対して、先ほど作成したWheelファイル（`*.whl`）を`pip`コマンドでインストールする。

```
(.venv_dl) /home/work/downloads # pip install ./dist/weatherforecast-0.0.1-py3-none-any.whl
Processing /home/work/dist/weatherforecast-0.0.1-py3-none-any.whl
Collecting requests<3.0.0,>=2.31.0
  Using cached requests-2.31.0-py3-none-any.whl (62 kB)
（略）
```

インストールが完了後の、状態を確認すると次のようになる。

```
# pip list
Package            Version
------------------ ---------
certifi            2023.7.22
charset-normalizer 3.3.0
idna               3.4
pip                23.0.1
requests           2.31.0
setuptools         58.1.0
urllib3            2.0.6
weatherforecast    0.1.0
```

インストールしたパッケージを実行するには次のようにする。

```
python -m weatherforecast
```

この実行コマンドは「§ [サンプルコードの動作確認](#サンプルコードの動作確認)」で説明したものと同じであり、実行結果も同じとなる。



以上ー。


# （付録）

## 仮想環境とは？

仮想環境とは、「開発環境毎に依存関係を閉じ込める機能」とでも言うべきもの。

たとえばNode.jsであれば「`npm install [パッケージA]`を実行すると、そのパッケージは`npm`コマンドを実行したフォルダー配下でのみ有効」であり、別のフォルダーで`npm instal [パッケージ@バージョン]`コマンドを実行した場合はそれぞれのフォルダー毎に異なるバージョンのパッケージを利用する事が可能（「ローカルにインストールする」と呼称する。すべてのフォルダーで利用可能にするには「`npm instal [パッケージ名] -g`」コマンドで明示的に「グローバルにインストールする」必要がある）。しかしPythonでは「ローカルにインストールする」と言う概念はない。代わりに「仮想環境」を作成して入った状態では、`pip install [パッケージ名]`でインストールしたパッケージは、その「仮想環境」の中でのみ利用可能となる。異なる仮想環境を作ることで、異なるバージョンのパッケージをインストールして利用することが可能となる。

具体的な仮想環境の作成と、その中に入る**2種類の手順**を次に示す。

### Python標準のvenvパッケージ利用の場合

（1つ目のコマンドの2つ目の引数は任意の識別子だが説明は省略）

```
python -m venv .venv

.venv\Scripts\activate
# ↑Windowsの場合。↓Linuxの場合は↓。
# source .venv/bin/activate
```

以降の`pip install`コマンド、`Python`コマンドはいずれも、この「仮想環境」での動作となる。「仮想環境」を一度作成したら、以降は`source .venv\bin\activate`コマンドのみで良い。
なお、仮想環境の実態は「`python -m venv .venv`」を実行したフォルダ配下に作成されるフォルダ「`.venv`」となる。2回目以降に「仮想環境」に入るには、そのフォルダ「`.venv`」があるところで実行する。

「仮想環境」を抜けるには次のコマンド用いる（※別の「仮想環境」に入るには、いったん抜けること）。

```
deactivate
```

### Poetryパッケージ利用の場合

Poetryに対して以下のコマンドを実行済み（Poetryの仮想環境の作成場所をプロジェクト直下とするオプション値）。

```
poetry config virtualenvs.in-project true
```

新規に仮想環境を作成するには、次のコマンドを実行する。実行と同時に仮想環境中に入った状態となる。

```
poetry shell
```

以降の`Python`コマンドは、この「仮想環境」での動作となる。なお、パッケージの追加インストールには`poetry add [パッケージ名]`を用いる。これにより`pyproject.toml`ファイルにも自動で依存関係が記録される。

「仮想環境」を抜けるには次のコマンド用いる（※別の「仮想環境」に入るには、いったん抜けること）。

```
deactivate
```

作成済みの「仮想環境」に、一度抜けた後に改めて入るには次のコマンドを用いる。

```
source .venv\bin\activate
```

仮想環境の実態は「`poetry shell`」を実行したフォルダ配下に作成されるフォルダ「`.venv`」となる。2回目以降に「仮想環境」に入るには、そのフォルダ「`.venv`」があるところで実行する。


なお、2回目以降の仮想環境への入り方は、より正確には次のコマンドとなる。ここで`poetry env info --path`が返す値は、上述の`.venv`への絶対パスである。なので、フォルダ「`.venv`」があるところで実行する分には、上記のように直接指定で良い。

```
`source $(poetry env info --path)/bin/activate`
```



#### Poetry仮想環境に関する参考サイト

* 基本的な使い方 - Poetry documentation (ver. 1.1.6 日本語訳)
    * https://cocoatomo.github.io/poetry-ja/basic-usage/#_6
> 新しいシェルの作成を避けるには、source {path_to_venv}/bin/activate (Windowsでは source {path_to_venv}\Scripts\activate.bat) コマンドを実行して、手動で仮想環境を起動する方法があります。仮想環境のパスを取得するには、 poetry env info --path コマンドを実行します。

* Poetry実践入門 #自分用メモ
    * https://zenn.dev/t4aru/articles/fdc73127b895a5#2.%E4%BB%AE%E6%83%B3%E7%92%B0%E5%A2%83%E3%81%AE%E6%9C%89%E5%8A%B9%E5%8C%96(%E7%8F%BE%E5%9C%A8%E3%81%AE%E3%82%B7%E3%82%A7%E3%83%AB)
* 【Poetry使い方から仮想環境の削除まで】Pythonパッケージ管理の完全ガイド
    * https://www.cfxlog.com/python_poetry/



## ファイル構造に関する補足

* Pythonにおいて、「パッケージ」とは「モジュールをまとめて格納したフォルダー」のことを意味する。「モジュール」とは「Pythonファイル（*.py）」を意味する
* 「パッケージ化する」とは「パッケージ（フォルダー）に格納したモジュール一式を、配布形式にする」と言える
* したがって上記のように「対象の関数を定義したPythonソースコードを、フォルダー配下に格納した状態」とするのが望ましいようだ









