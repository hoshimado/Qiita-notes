# タイトル

Pythonソースコードをパッケージ化する方法（他環境へ配布を目的として）（Setup.py利用）

# 概要

作成したPythonソースコードを他の環境に持って行って実行する、と言う観点でPythonでのパッケージ化の手順を説明する。

ローカルでの配布を想定し、The Python Package Index (PyPI)への登録などは論じない。

作成する配布用ファイルはWheel形式とし、作成方法は「`setup.py`を用いる方法（`setup()`を用いる方法）」を採用する。本方法は最近では「旧手法」と呼ばれつつあるが、理解を目的に本記事ではこちらを用いる[^1]。

[^1]: 2019年の1月の[pip v19.0](https://pip.pypa.io/en/stable/news/#v19-0)にて、`pyproject.toml`によるパッケージインストールに対応。それ以降、少しずつ「`setup()`を用いたBuild」から「`pyproject.toml`を用いたBuild」に置き換わりつつあるようだ。2023-09-23現在、`setup()`でのBuild時には「`deprecated`」（非推奨）というメッセージが出るようになっている。



# 目的

Node.jsで言うところの「`npm --save　install [モジュール名]`コマンドで package.json に構築しておけばOK」をPythonでどうやるのか？　という疑問への回答を目的とする。

なお、上記に対してそのまま答えるのであれば「Pythonでは`pip freeze > requirements.txt`で依存関係を出力した`requirements.txt`を添えておけばよい（受け取った側は `pip install -r requirements.txt`する）」となる。
しかし本記事では、「Pythonでは、パッケージ形式（Wheel形式）に固めて配布し、それをインストールしてパッケージ呼び出し形式で使ってもらう」というケースへの対応を意図する。これは、Pythonの場合はこのケースへの要求が多い、ように感じられたためだ。



# 想定読者

* はじめてPythonに触れる人で、しかし他の言語でのプログラミング経験は有する方
    * Python特有の部分はともかく、とりあえずHello World的な出力は悩まずにPythonでコーディングできる方
* 自身が作成したPythonソースコードで必要な依存関係を、どう設定すればよいか？に迷っている方


# 動作環境（検証環境）

* Windows10
    * Python 3.11.5
* WSL2::Ubuntu 22.04.1 LTS
    * dockerイメージ「python:3.9-alpine3.18」

## 仮想環境

ToDo:（初めての人向けに簡単に書く）


# サンプルコード

以下を参照のこと。

ToDo:（URLを追記する）


## パッケージ化対象のサンプルコードの仕様

本記事では、動作に追加パッケージを必要とするケースとして、次の仕様のサンプルコードを用いる。

* パッケージの本体は`weaherforecast`フォルダー
  * フォルダー内のPythonファイル`open_meteo_forecast_api.py`にて、「[Open-Meteo](https://open-meteo.com/)」が提供するWeb APIを利用して指定地点の向こう1週間の1h毎の予想気温を取得する関数「`get()`」を提供する
* 依存関係としてパッケージ「[requests](https://pypi.org/project/requests/)」を必要とする
  * 依存関係は、後述の「サンプルコードの動作確認」後にコマンド`pip freeze > requirements.txt`にて、`requirements.txt`に出力するものとする。
* 次のようなファイル／フォルダー構造を持つものとする

```
+-- requirements.txt
+-- setup.py
|   
\---weatherforecast/
    +-- open_meteo_forecast_api.py
    +-- __init__.py
    +-- __main__.py        
```

上記のコードの動作に必要な依存関係（追加パッケージ）をインストールするには次のコマンドのいづれかを実行する。

* `pip install requests`
* `pip install -r requirements.txt`


## サンプルコードの動作確認

このサンプルコードの動作確認は以下のコマンドで実施できる。

```
python -m weatherforecast
```

上記を実行すると、東京の向こう1週間の1h毎の予想気温が出力される。



## ファイル構造に関する補足

* Pythonにおいて、「パッケージ」とは「モジュールをまとめて格納したフォルダー」のことを意味する。「モジュール」とは「Pythonファイル（*.py）」を意味する
* 「パッケージ化する」とは「パッケージ（フォルダー）に格納したモジュール一式を、配布形式にする」と言える
* したがって上記のように「対象の関数を定義したPythonソースコードを、フォルダー配下に格納した状態」とするのが望ましいようだ




# パッケージファイル（Wheel形式）の作成方法

`setuptools`モジュールで提供される`setup()`関数を用いてWheel形式のパッケージを作成する。慣例として、`setup.py` と言う名称のファイルを作成して、その中で`setup()`を呼び出す。

`setup.py`は、たとえば次のように記述する。

```
import setuptools

with open('requirements.txt') as f:
    requirements = f.read().splitlines()

setuptools.setup(
    name="weatherforecast", # Replace with your own username
    version="0.0.1",
    install_requires = requirements, # 依存関係を requirements.txt から読み込んで設定する
    entry_points={
        'console_scripts': [
            'weatherforecast=weatherforecast:main',
        ],
    },
    packages=setuptools.find_packages(), # 直下のパッケージ仕様のフォルダ名をリスト形式で全て取得
    description="sample packages by legacy-setup.py",
    # author="author",
    # author_email="sample@example.com",
    # python_requires='>=3.7',
)
```

ここで、パッケージの動作に必要な依存関係は、キーワード引数の表記を用いて`install_requires=["requests==2.31.0",,,]`のようにして設定する。上記のサンプルコードでは、依存関係として必要なパッケージ一覧を記載したファイル`requirements.txt`を同ディレクトリに置いておき、そこから読み込む形式としている。

上記の`setup.py`ファイルを作成したら、おもむろに次のコマンドで`setup.py`を引数`bdist_wheel`を添えて実行する（明示されていないが、`setup()`は関数内部でコマンドライン引数を受け取る仕様）。

```
pip install --upgrade pip setuptools wheel
python setup.py bdist_wheel
```

1行目は、パッケージ作成に必要なコマンド（パッケージ）を最新化するため&もし環境に不足していれば追加インストールするためにに実行している。
setup.pyの実行が終わると、`dist`フォルダが作成されて、その配下にWheel形式のパッケージが出力される。

なお、実行途中で次のようなメッセージが表示されるが、これは「最新のPython仕様としては、`setup()`を用いたパッケージ作成を推奨」しているため。今回は無視する。

```
SetuptoolsDeprecationWarning: setup.py install is deprecated.

Please avoid running ``setup.py`` directly.
```


以上で、パッケージ作成は完了。


# 作成したパッケージの動作確認の方法

適当な任意のフォルダーに移動し、そこに真っ新なPython仮想環境を作成する。
たとえば、次のようにする。


```
/home/work/downloads # python -m venv .venv_dl
/home/work/downloads # source  .venv_dl/bin/activate
```

作成したPython仮想環境に入っているパッケージを確認すると、次のようになている。

```
(.venv_dl) /home/work/downloads # pip list
---------- -------
pip        23.0.1
setuptools 58.1.0
```

この環境に対して、先ほど作成したWheelファイル（`*.whl`）を`pip`コマンドでインストールする。

```
(.venv_dl) /home/work/downloads # pip install ../legacy/dist/weatherforecast-0.0.1-py3-none-any.whl
Processing /home/work/legacy/dist/weatherforecast-0.0.1-py3-none-any.whl
Collecting certifi==2023.7.22
  Downloading certifi-2023.7.22-py3-none-any.whl (158 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 158.3/158.3 kB 2.0 MB/s eta 0:00:00
（略）
```

インストールが完了後の、状態を確認すると次のようになる。

```
# pip list
Package            Version
------------------ ---------
certifi            2023.7.22
charset-normalizer 3.2.0
idna               3.4
pip                23.0.1
requests           2.31.0
setuptools         58.1.0
urllib3            2.0.4
weatherforecast    0.0.1
```

インストールしたパッケージを実行するには次のようにする。
（コマンドラインからモジュール名を実行すると、`main.py`の`main()`関数が実行されるように、`setup.py`の`console_scripts`項目で設定してある）。

```
python -m weatherforecast
```

この実行コマンドは「§ [サンプルコードの動作確認](#サンプルコードの動作確認)」で説明したものと同じであり、実行結果も同じとなる。



以上ー。


