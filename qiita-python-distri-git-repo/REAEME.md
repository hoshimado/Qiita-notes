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

なお、後述の「pipコマンドによる配布パッケージのインストール」実行時は、
上述の配布パッケージ作成の記事にある「[作成したパッケージの動作確認の方法](https://qiita.com/hoshimado/items/7c99e6ef4c9d1bc6bb87#%E4%BD%9C%E6%88%90%E3%81%97%E3%81%9F%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E3%81%AE%E5%8B%95%E4%BD%9C%E7%A2%BA%E8%AA%8D%E3%81%AE%E6%96%B9%E6%B3%95)」
と同様に、インストール実行前に仮想環境に入っておくことを推奨する。




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

この方式は「リポジトリをgit cloneし、その後にcloneしたリポジトリからパッケージをインストールする」
流れなので、配布パッケージのファイル作成（`*.whl`）はする必要がない。
必要なのは「配布パッケージのファイル作成ができる状態のファイル・フォルダー構成」となる。



## 配布パッケージをリポジトリに格納する方法

配布パッケージを作成するために構成したファイル・フォルダー構造を、そのままGitHubリポジトリに格納する。
より具体的には、リポジトリのルートに`setup.py`もしくは`pyproject.toml`ファイルがある状態を意図する。

サンプルコードであれば、次のようになる。
リポジトリをPublic状態で公開をすれば、配布のための準備は完了。

https://github.com/hoshimado/qiita-notes/tree/main/qiita-python-packagebuild-setuppy/



## GitHubのPublicリポジトリからpipコマンドでインストール方法


GitHubのPublicリポジトリに配置された配布パッケージからpipインストールするために必要な情報は次の通り。

* gitリポジトリのURL

pipコマンドに対して次のようにgitリポジトリのURLを指定して実行する。

pip install git+https://[gitリポジトリのURL]

ここでgitリポジトリのURLは、以下で表示されるGitHubリポジトリのClone用のURLを指定する。

![GitHubリポジトリのURL](./images/git-https-url.png)

なお、本サンプルでは先の説明とは異なり、リポジトリのルートでなくサブディレクトリ配下に配置している。
この場合でも、URLフラグメント（アンカー）「`subdirectory`」を用いて対象のサブディレクトリを指定することで、
インストールが可能。
この場合の具体的なコマンドは次の通り。

```
pip install git+https://github.com/hoshimado/qiita-notes.git#subdirectory=qiita-python-packagebuild-setuppy
```

インストール後のパッケージの動作確認は、配布パッケージ作成の手順記事に記載の通りで次のコマンドを実行することで可能。

```
python -m weatherforecast
```

参考までに、mainブランチ以外で配布を行いたい場合（例えばreleaseブランチなどがある場合）は、
ブランチ名も含めて次のように指定することで対応可能。

```
pip install git+https://[gitリポジトリのURL]@[ブランチ名]
```

なお本手順によるインストールは、gitコマンドがある前提で実施可能。
gitコマンドが未導入の環境では、以下のエラーメッセージが表示されて失敗する。

```
ERROR: Error [Errno 2] No such file or directory: 'git' while executing command git version
ERROR: Cannot find command 'git' - do you have 'git' installed and in your PATH?
```



# GitHubのPrivateリポジトリに配布パッケージを配置する方法とインストール手順


## リポジトリに参加しているGitHubユーザーに対して配布する

【作成途中】

自身の設定画面からアクセストークンを作成する

https://github.com/settings/profile

https://github.com/settings/tokens

![](./images/github-user-token1.png)

任意の名称を入力。リポジトリへのアクセスだけを許可（チェック）。

![](./images/github-user-token2-new.png)

下の方にあるボタン「Generate token」を押下する。

![](./images/github-user-token3-created.png)

※上記のアクセストークンは削除済みなので、悪しからず。



## リポジトリに紐づけた環境（サーバー）に対して配布する

https://github.com/[リポジトリ名]/settings/keys

![](./images/github-repo-deploy-key1.png)

![](./images/github-repo-deploy-key2-new.png)





# 参考サイト

* Getting Started - pip documentation
    * https://pip.pypa.io/en/latest/getting-started/
* VCS Support - pip documentation
    * https://pip.pypa.io/en/latest/topics/vcs-support/#supported-vcs










