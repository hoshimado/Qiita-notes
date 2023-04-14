# タイトル

* Vue.js Version3系でのvueファイルの書き方と環境の作成方法

# 概要

Vue3でのvue SFCファイルの書き方とトランスパイル方法（ビルドするための環境構築方法）を説明する。

※ほぼ「自身向けのメモ」であるので、悪しからず。

## 目的

* Vue単一ファイルコンポーネント（ `*.vue`, Vue SFC）を用いてVueを記述する際の、トランスパイル・コマンドと記述方法を分かった気になれる。
* Vue2系と比較してVue3では何が変わったのか？を分かった気になれる。
    * なお、Vue2とVue3の違いそのものは、すでに良質の解説記事があるので、そちらを参照（後述）。
* Veu2と同様の記法「Options API」と、Vue3で推奨される「Composition API」のそれぞれの記法の特徴的な差を理解する。
    * なお、Veu3でも「Options API」は「引き続きサポートされる」。

> Options API は Vue の不可欠な要素であり、多くの開発者が Vue を愛する理由にもなっています。 
> Composition API の利点の多くは大規模プロジェクトでこそ現れるものであり、
> 多くの低~中程度の複雑性のシナリオにおいては 
> Options API が堅実な選択肢であり続けることも理解しています。

ref. https://ja.vuejs.org/guide/extras/composition-api-faq.html#will-options-api-be-deprecated



## 想定読者

* Vue2でVue-Cli（ `@vue/cli` ）を用いてWebアプリを作成していた方
* Vue2からVue3への移行を始めようとする方


## 動作環境（検証環境）

* BootStrapは、BootStrap-Vueではなく素のBootStrapを直接に使うものとする。
    * Vue3系への対応が未だ暫定的と思われるため。
* サンプルコード内での日付の取り扱い容易化のため、date-fnsを利用する。

```package.json
  "dependencies": {
    "bootstrap": "^5.2.3",
    "date-fns": "^2.29.3",
    "vue": "^3.2.47"
  },
```


# Vue3での作成手順

## Vueプロジェクトの導入方法（CLIでのトランスパイルするコマンドを準備）

Vue3では、次のコマンドでVueプロジェクト（SFC形式の一式）を作成する。

```
npm init vue@latest
```

上記のコマンドを実行すると、「プロジェクト名」を最初に聞かれる。
そこへ入力した名称でフォルダが作成されて、その配下にVueプロジェクトが作成される。

Vue2の時の下記のように事前にVue-CLI（ '@vue/cli` ）をインストールする必要はない。

```
npm install @vue/cli
npx vue create cli-vue
```

ここで
`npm init <initializer>` 
は、'initializer'で指定したnpmパッケージで定義されている
初期化処理を実行するコマンド。

> npm init <initializer> can be used to set up a new or existing npm package.
> 
> initializer in this case is an npm package named create-<initializer>, 
> which will be installed by npm-exec, and then have 
> its main bin executed -- presumably creating or updating package.json 
> and running any other initialization-related operations.
>
> The init command is transformed to a corresponding npm exec operation as follows:
> 
> * npm init foo -> npm exec create-foo
> * npm init @usr/foo -> npm exec @usr/create-foo

ref. https://docs.npmjs.com/cli/v9/commands/npm-init


`npm init vue@latest` の実行後の入力内容に説明に戻る。

初回実行時は、vueの初期化用パッケージの取得を確認してくるので、
yを押下。

```
Need to install the following packages:
  create-vue@latest
Ok to proceed? (y)
```

移行の質問は、Lintを除いてデフォルトの「No」のまま進む。
LintのみYes（あくまで私の好み）。

```
Vue.js - The Progressive JavaScript Framework

√ Project name: ... frontend
√ Add TypeScript? ... -No- / Yes
√ Add JSX Support? ... -No- / Yes
√ Add Vue Router for Single Page Application development? ... -No- / Yes
√ Add Pinia for state management? ... -No- / Yes
√ Add Vitest for Unit Testing? ... -No- / Yes
√ Add an End-to-End Testing Solution? ≫ -No-
√ Add ESLint for code quality? ... No / -Yes-
√ Add Prettier for code formatting? ... -No- / Yes

Scaffolding project in D:\AsGitHub\vue3trial\frontend\vue-project...

Done. Now run:

  cd frontend
  npm install
  npm run dev
```

上記の表示に従って `npm run dev` を実行するとデモ画面が表示されます。


## Vue3での記述方法

デモ画面の説明は他のサイトに譲り、本記事では次の機能を有したサンプルコードを用いて記述方法を説明します。

* 入力したテキストの文字列をカウントするWebアプリ
* 入力したテキストはブラウザのローカル領域に自動保存される

実装の設計は次のようにします。
Componet間での親→子のデータ渡しを含む例とするため、
`App.vue`で、`utils/localStorageClinet.js` を読み込んで
`new`したインスタンスを渡して、`TweetDrop.vue`で利用する形としています。

```
frontend
├─node_modules\
├─public\
└─src
    ├─App.vue
    ├─assets\
    ├─components\
    ｜   ├─MyClient.vue
    ｜   └─TweetDrop.vue
    └─utils\
    　   └─localStorageClient.js
```

サンプルコードのUIは次ようななもの。

（スクリーンショットを貼る）


## Ver2準拠のOptions API記法

Vue3でも、Vue2と同じ記法で記述できます。
これを「Options API」と呼びます。

今回のサンプルでは`App.vue`と`TweetDrop.vue`を次のように実装しています（Cssは省略）。
コードの全体像は、サンプルコードのこちらを参照ください。
ここで注目してほしいのは、実装方法**ではなく**、次の2点です。

* Vue3でも、Vue2と全く同じ記法を用いれること（Options API）
* 次の節で例示する、Composition API記法との違い


```App.vue
<script>
import LocalStorageClient from './utils/localStorageClient.js';
import MyClient from './components/MyClient.vue';

export default {
    name: 'app',
    components: {
        MyClient
    },
    data: function () {
        return {
            localStorageClient: new LocalStorageClient(window)
        }
    }
}
</script>

<template>
  <div id="app">
    <MyClient 
      v-bind:localStorageClient="localStorageClient"
    >
    </MyClient>
  </div>
</template>
```


```TweetDrop.vue
<script>
import { format } from 'date-fns'

export default {
    name: 'TweetDrop',
    props: {
        localStorageClient : {
            type: Object,
            required : true
        }
    },
    data: function () {
        return {
            tweetText: '',
            lastTweetText: '',
            lastLocalStoredTimeStr: ''
        }
    },
    mounted: function () {
        const localStoredText = this.localStorageClient.getLocalStoredText();
        this.tweetText = localStoredText;

        setInterval(() => {
            if(this.lastTweetText != this.tweetText){
                this.lastTweetText = this.tweetText;
                this.localStorageClient.setLocalStoredText(this.lastTweetText);
                this.lastLocalStoredTimeStr = this.getNowWithFormat();
            }
        }, 5000);
    },
    computed: {
        tweetTextLength: function () {
            return (this.tweetText) ? this.tweetText.length : 0;
        }
    },
    methods: {
        getNowWithFormat: function () {
            const now = new Date()
            const result = format(now, 'yyyy/MM/dd HH:mm')
            return result;
        },
        clearText: function () {
            this.tweetText = '';
            this.localStorageClient.setLocalStoredText('');
        }
    }
};
</script>

<template>
    <div id="id-root">
        <textarea 
            v-model="tweetText"
            rows="10" cols="40" 
            class="textarea-width100"
            placeholder="ここにツイート文を入力"
        ></textarea>
        <div class="div-textarea-footer container-space-between" style="height: 50px;">
            <div class="container-flex">
                <div class="div-label">
                    <label>文字数：{{ tweetTextLength }} </label>
                </div>
                <div class="div-label">
                    <label>保存日時：{{ lastLocalStoredTimeStr }} </label>
                </div>
            </div>

            <div class="container-flex">
                <div>
                    <button type="button" class="btn btn-warning" v-on:click="clearText">クリア</button>
                </div>
            </div>
        </div> 
    </div>
</template>
```


## Ver3から推奨となったComposition API記法

Vue3では「Composition API」という記法が推奨され、
デモ画面の実装もこのComposition APIで記述されています。

今回のサンプルを、Composition APIで書き直すと、以下となります（こちらもCss省略）。

```App.vue
<script setup>
import { reactive } from 'vue';
import LocalStorageClient from './utils/localStorageClient.js';
import MyClient from './components/MyClient.vue';

const localStorageClient = reactive(new LocalStorageClient(window));
</script>

<template>
  <div id="app">
    <MyClient 
      v-bind:localStorageClient="localStorageClient"
    >
    </MyClient>
  </div>
</template>
```


```TweetDrop.vue
<script setup>
import { computed } from 'vue';
import { onMounted, ref } from 'vue';

import { format } from 'date-fns'

const props = defineProps({
    localStorageClient : {
        type: Object,
        required : true
    }
});

const tweetText = ref('');
const tweetTextLength = computed(()=>{
    return (tweetText.value) ? tweetText.value.length : 0;
});
var lastTweetText = '';
const getNowWithFormat = function() {
    const now = new Date()
    const result = format(now, 'yyyy/MM/dd HH:mm')
    return result;
};
var lastLocalStoredTimeStr = ref('');
const clearText = function () {
    tweetText.value = '';
    props.localStorageClient.setLocalStoredText('');
}

onMounted(()=>{
    const localStoredText = props.localStorageClient.getLocalStoredText();
    tweetText.value = localStoredText;

    setInterval(() => {
        if(lastTweetText != tweetText.value){
            lastTweetText = tweetText.value;
            props.localStorageClient.setLocalStoredText(lastTweetText);
            lastLocalStoredTimeStr.value = getNowWithFormat();
        }
    }, 5000);
});
</script>

<template>
    <div id="id-root">
        <textarea 
            v-model="tweetText"
            rows="10" cols="40" 
            class="textarea-width100"
            placeholder="ここにツイート文を入力"
        ></textarea>
        <div class="div-textarea-footer container-space-between" style="height: 50px;">
            <div class="container-flex">
                <div class="div-label">
                    <label>文字数：{{ tweetTextLength }} </label>
                </div>
                <div class="div-label">
                    <label>保存日時：{{ lastLocalStoredTimeStr }} </label>
                </div>
            </div>
            <div class="container-flex">
                <div>
                    <button type="button" class="btn btn-warning" v-on:click="clearText">クリア</button>
                </div>
            </div>
        </div> 
    </div>
</template>
```


## Options API記法と Composition API記法の比較

それぞれの記法の特徴などの説明は、他のサイトに譲る。次の記事などが良くまとまっていてお勧め。

* （ここに記事のリンクを記載）

詳細は上記の記事に書いてある通りだが、ザッとサンプルコードの
`TweetDrop.vue`で比較してみると、次のようになる。
見ての通り、`<template>`タグ内は同一（後半は省略）であり、異なるのは
`<script>`タグの中である。

Options API記法を知っている人が、Composition API記法に移行するのは、特にハードルは無い気がする。このサンプルの範囲での注意点としては、次くらいだろうか。

* `defineProps()`で親コンポーネントから渡されたプロパティに`<script>`タグ内でアクセスするには、明示的に`const props = defineProps()`で宣言しておき、`props.XXX`の形でアクセスする必要がある。
* （一方で、`<templaｔe>`タグ内でアクセスする場合は、`props`への代入を省略して、`XXX`に直にアクセス可能。コードは転記しないが、`MyClient.vue`では`<template>`タグ内のみのアクセスのため省略している）

```
<script setup>
const props = defineProps({
  foo: String
})
```

https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits

> 
> Top-level bindings in \<script setup\> are automatically exposed to the template. For more details
>
https://vuejs.org/api/sfc-spec.html#script-setup



![OptionsとCompositionの比較](./images/diff-tweet-drop.png)



## 実行方法（トランスパイル方法）

Vue3では、Vue2での`npm run serve`コマンドに代わり、
`npm run dev`を用いる。

サンプルコードでは
`frontend-options-api` フォルダ、
`frontend-composition-api` フォルダ、
それぞれで次のコマンドを実行するとデバッグ実行できる。
もちろん`npm install`は初回のみで良い。

```
  npm install
  npm run dev
```


以上ー。

（正式ビルド／トランスパイルのコマンドは`npm run build`で変わらないので省略）

