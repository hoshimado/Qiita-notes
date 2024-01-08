# タイトル

配布パッケージをGitHubリポジトリ経由でインストールする方法（PublicとPrivate両パターン）



# 概要

複数ある「作成した配布パッケージを頒布する方法」の簡単な把握と、
その中でGitHubリポジトリに配置して、そこからpipインストールする方法を解説する。

その際、Publicリポジトリで公開するケースと、Privateリポジトリで公開するケースの2パターンを解説する。



# 目的

PyPIに公開するほどではないが、インターネットを通じある程度広くへ配布パッケージを公開したい場合向けに、
GitHubリポジトリを用いて配布とインストールができるようになることを目的とする。


# 想定読者



# 動作環境（検証環境）



# サンプルコード

稚作の配布パッケージの作成手順の記事、で解説に用いたサンプルコードとリポジトリを用いて説明する。

* 「[Pythonソースコードをパッケージ化する方法（他環境へ配布を目的として）（Setup.py利用）](https://qiita.com/hoshimado/items/7c99e6ef4c9d1bc6bb87)」

なお、以降の記事では上記のサンプルコードを用いるが、「配布方法」は「配布パッケージの作成方法」に依存しない。
したがって、たとえばSetup.pyではなくPoetryを用いた以下の記事で用いたサンプルコードのリポジトリでも
まったく同じことができる。

* 「[Pythonソースコードをパッケージ化する方法（他環境へ配布を目的として）（Poetry利用）](https://qiita.com/hoshimado/items/aa27b3c6287cb279d0ca)」




# Pythonの配布パッケージの配布方法とインストール方法の種類

配布パッケージ（`*whl`形式とする）のインストールに用いるpipコマンドは、
配布方法に応じた複数のインストール方法をサポートしている。
一般によく使われる配布パッケージの置き場は次の3パターンである。

* PyPIリポジトリ
* GitHubリポジトリ
* ローカルに配布パッケージを直に配置

PyPIは「Python Package Index」の略称であり、pipコマンドにおける公式の配布リポジトリである。

「GitHubリポジトリ」のパターンは、正確にはGitHubである必要はなく、
またGitに限定されず、SubversionなどのいくつかのVCS（=version control systems）リポジトリでも
同様のことが可能。本記事では説明の容易化のためにGitHubで限定して解説する。

ローカルに配布パッケージを置くケースは、もっとも簡単な方法であり、直接配布パッケージを手渡しして
インストール環境に配置し、そこからインストールする方法である。

PyPIを利用する方法はもっとも一般的であり、多数の解説記事があるため、そちらを参照して欲しい。
GitHubリポジトリを利用する方法は、「git cloneしてそこからインストールする操作」をpipコマンドが代行してくれるだけなので
一見簡単に見えるが、pipコマンドの操作でありながらgitコマンドの知識が必要となるため、知らないと手間取りやすい。
最後のローカルからの方法は、配布パッケージファイルを指定すればよいため、特に論ずる点はない。
以上の背景から、上記の3パターンのうち、本記事では「GitHubリポジトリで配布する方法」について、以降で解説する。



# GitHubのPublicリポジトリに配布パッケージを配置する方法とインストール手順

配布パッケージをGitHubのリポジトリに公開して、そこからpipコマンドを用いて
インストールする方法を解説する。
本節ではPublicリポジトリに配置するケースを対象とする
Privateリポジトリに配置するケースでは、配置方法は同じであるがインストール時の
認証に関する設定が追加で必要なる。そちらについては次の節で解説する。



## 配布パッケージをリポジトリに格納する方法

配布パッケージを作成するために構成したファイル・フォルダー構造を、そのままGitHubリポジトリに格納する。
より具体的には、リポジトリのルートに`setup.py`もしくは`pyproject.toml`ファイルがある状態を意図する。

サンプルコードであれば、次のようになる。
リポジトリをPublic状態で公開をすれば、配布のための準備は完了。

https://github.com/hoshimado/qiita-notes/tree/main/qiita-python-packagebuild-setuppy/



## GitHubのPublicリポジトリからpipコマンドでインストール方法


GitHubのPublicリポジトリに配置された配布パッケージからpipインストールするために必要な情報は次です。

* gitリポジトリのURI
* （mainブランチ以外に格納した場合は）ブランチ名

pipコマンドに対して次のようにgitリポジトリのURIを指定します。

pip install git+https://[gitリポジトリのURI]

mainブランチ以外に格納している場合は、ブランチ名も含めて次のように指定します。

pip install git+https://[gitリポジトリのURI]@[ブランチ名]



本章で用いたサンプルファイルの場合での、具体的なコマンド記載は次のようになります。
pipコマンドの実行前に、仮想環境の構築が推奨されるのは、◆◆§3.2ローカルからのインストール　と同様です。

pip install git+https://github.com/hoshimado/qiita-notes.git


URLフラグメント（アンカー）「`subdirectory`」を用いて指定する。

pip install git+https://github.com/hoshimado/qiita-notes.git#subdirectory=qiita-python-packagebuild-setuppy



ブランチの場合は「`@ブランチ名`」を付与する


インストール後の動作確認。
python -m weatherforecast



なお、gitコマンドがある前提なので、未導入の環境だと以下のエラーメッセ―で失敗する。

(.venv_wslpy39) /home/work # pip install git+https://github.com/hoshimado/tbf15-sample.git@chapter2section4-2-procedure-
in-poetry-build
Collecting git+https://github.com/hoshimado/tbf15-sample.git@chapter2section4-2-procedure-in-poetry-build
  Cloning https://github.com/hoshimado/tbf15-sample.git (to revision chapter2section4-2-procedure-in-poetry-build) to /tmp/pip-req-build-jufbscdz
  ERROR: Error [Errno 2] No such file or directory: 'git' while executing command git version
ERROR: Cannot find command 'git' - do you have 'git' installed and in your PATH?






# 参考サイト

* Getting Started - pip documentation
    * https://pip.pypa.io/en/latest/getting-started/
* VCS Support - pip documentation
    * https://pip.pypa.io/en/latest/topics/vcs-support/#supported-vcs










