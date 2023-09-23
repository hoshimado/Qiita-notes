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
* 自身が作成したPythonソースコードで必要な依存関係を、配布時にどう設定すればよいか？に迷っている方


# 動作環境（検証環境）

次の2つの環境で、サンプルコードの動作確認を実施済み。

* Windows10
    * Python 3.11.5
* WSL2::Ubuntu 22.04.1 LTS
    * dockerイメージ「python:3.9-alpine3.18」

特に断らない限り、「Pythonに関する操作（`pip install XXX`などを含む）」はPython仮想環境に入って行うものとする（以降、「仮想環境」と略して呼称）。仮想環境の作成にはPython標準で提供される`venv`パッケージを用いる[^2]。

[^2]: https://docs.python.org/ja/3/library/venv.html

※「Pythonの仮想環境とはなんぞや？」と言う方は、付録章の「[仮想環境とは？](#仮想環境とは)」を参照のこと。




# サンプルコード

以下を参照のこと。

https://github.com/hoshimado/qiita-notes/tree/main/qiita-python-packagebuild-setuppy/


## パッケージ化対象のサンプルコードの仕様

本記事では、動作に追加パッケージを必要とするケースとして、次の仕様のサンプルコードを用いる。

* パッケージの本体は`weaherforecast`フォルダー
  * フォルダー内のPythonファイル`open_meteo_forecast_api.py`にて、「[Open-Meteo](https://open-meteo.com/)」が提供するWeb APIを利用して指定地点の向こう1週間の1h毎の予想気温を取得する関数「`get()`」を提供する
* 依存関係としてパッケージ「[requests](https://pypi.org/project/requests/)」を必要とする
  * サンプルコードに含まれる`requirements.txt`は、後述の「サンプルコードの動作確認」後にコマンド`pip freeze > requirements.txt`にて出力したもの
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

上記のコードの動作に必要な依存関係（追加パッケージ）をインストールするには次のコマンドの**いづれか**を実行する。

* `pip install requests`
* `pip install -r requirements.txt`


## サンプルコードの動作確認

このサンプルコードの動作確認は、以下のコマンドで実施できる。
（このコマンドは、サンプルコードのルートから見て、パッケージ`weatherforecast`を実行している。したがって package直下の`__main__.py`が実行される。このフォルダー構造としている理由は、付録章の「[ファイル構造に関する補足](#ファイル構造に関する補足)」を参照のこと）


```
python -m weatherforecast
```

上記を実行すると、東京の向こう1週間の1h毎の予想気温が出力される。




# パッケージファイル（Wheel形式）の作成方法

`setuptools`モジュールで提供される`setup()`関数を用いて、Wheel形式のパッケージを作成する。慣例として、`setup.py` と言う名称のファイルを作成して、その中で`setup()`を呼び出す。

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

1行目は、パッケージ作成に必要なコマンド（パッケージ）を最新化するため&もし環境に不足していれば追加インストールするため、に実行している。
2行目のコマンド、setup.pyの実行が終わると、`dist`フォルダーが作成されて、その配下にWheel形式のパッケージが出力される。

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

作成したPython仮想環境に入っているパッケージを確認すると、次のようになっている。

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

```
python -m weatherforecast
```

この実行コマンドは「§ [サンプルコードの動作確認](#サンプルコードの動作確認)」で説明したものと同じであり、実行結果も同じとなる。



以上ー。


# （付録）

## 仮想環境とは？

仮想環境とは、「開発環境毎に依存関係を閉じ込める機能」とでも言うべきもの。

たとえばNode.jsであれば「`npm install [パッケージA]`を実行すると、そのパッケージは`npm`コマンドを実行したフォルダー配下でのみ有効」であり、別のフォルダーで`npm instal [パッケージ@バージョン]`コマンドを実行した場合はそれぞれのフォルダー毎に異なるバージョンのパッケージを利用する事が可能（「ローカルにインストールする」と呼称する。すべてのフォルダーで利用可能にするには「`npm instal [パッケージ名] -g`」コマンドで明示的に「グローバルにインストールする」必要がある）。しかしPythonでは「ローカルにインストールする」と言う概念はない。代わりに「仮想環境」を作成して入った状態では、`pip install [パッケージ名]`でインストールしたパッケージは、その「仮想環境」の中でのみ利用可能となる。異なる仮想環境を作ることで、異なるバージョンのパッケージをインストールして利用することが可能となる。

具体的には以下の手順で仮想環境を作成し、その中に入る。
（1つ目のコマンドの2つ目の引数は任意の識別子だが説明は省略）


```
python -m venv .venv

.venv\Scripts\activate
# ↑Windowsの場合。↓Linuxの場合は↓。
# source .venv/bin/activate
```

以降の`pip install`コマンド、`Python`コマンドはいずれも、この「仮想環境」での動作となる。「仮想環境」を一度作成したら、以降は`.venv\Scripts\activate`コマンドのみで良い。
なお、仮想環境の実態は「`python -m venv .venv`」を実行したフォルダ配下に作成されるフォルダ「`.venv`」となる。2回目以降に「仮想環境」に入るには、そのフォルダ「`.venv`」があるところで実行する。


「仮想環境」を抜けるには次のコマンド用いる（※別の「仮想環境」に入るには、いったん抜けること）。

```
deactivate
```



## ファイル構造に関する補足

* Pythonにおいて、「パッケージ」とは「モジュールをまとめて格納したフォルダー」のことを意味する。「モジュール」とは「Pythonファイル（*.py）」を意味する
* 「パッケージ化する」とは「パッケージ（フォルダー）に格納したモジュール一式を、配布形式にする」と言える
* したがって上記のように「対象の関数を定義したPythonソースコードを、フォルダー配下に格納した状態」とするのが望ましいようだ









