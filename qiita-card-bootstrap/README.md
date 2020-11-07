# qiita-card-bootstrap

Subject: Vue.jsでBootStrapをつまみ食い的に使う

## 概要

Vue.jsのVue CLIからBootStrapを使う方法。

「BootStrapを使おう！さぁ先ずは基本を学ぼう」と構えて臨むのではなく、「このデータ構造の表現にちょうどよいUI無いかな？　お、BootStrapのxxのコンポーネントが良さ気じゃん」と**気軽**につまみ食いで使う、ことを目指すとする。

## サンプルに用いるデータ構造

次のような配列データを、Vue.jsを用いたUIで表現する場合を考える。
表示対象は「`datetime, type, notes`」の３つとする。

```
activitylist = [
    {
        id: 5,
        datetime: "1596229200",
        type: 1,
        notes: '翌日の6時に起きたとする'
    },{
        id: 4,
        datetime: "1596223800",
        type: 1,
        notes: '翌日の4時半に目が覚めたとする'
    },{
        id: 3,
        datetime: "1596201000",
        type: 0,
        notes: '2020-07-31 22:10、つまり夜22時過ぎに寝た場合を仮定'
    },{
        id: 2,
        datetime: "1596164400",
        type: 2,
        notes: '薬を昼12時に飲んだとする。'
    }
];
```

`type`に指定された値に対して、その値を配列番号と見なして、それぞれ配列要素のtitleキーに設定した文字列に置き換えて表示する、ものとする。

```
typelist = [
    { 
        title: '寝た'
    }, {
        title: '起きた'
    }, {
        title: '服薬'
    }
];
```

これらの配列データをViewListCard.vueで定義し、
コンポーネントItemCard.vueに配列をPropsで渡して、
表示の仕方はコンポーネントItemCard.vueに任せる、
という設計を仮定する。

具体的なサンプルコードは次のようになる。

https://github.com/hoshimado/qiita-notes/tree/master/qiita-card-bootstrap

* `./src/components/ViewListCard.vue`
* `./src/components/ItemCard.vue`
     * `ItemCard0.vue` ～ `ItemCard3.vue` がそれぞれの段階ごとのサンプルコード


## テキストをマスタッシュ構文でそのまま表示する

上述の配列データactivitylistの各要素の3項目を、次の変換のみを行って
マスタッシュ（Mustache）を用いてテキストで表示すると
次のようになる。

* datetime: UNIX時間（秒）を「YYYY-MM-DD . HH:MM:00」の文字列に変換する
* `type`を、`typelist`の配列番号に応じた要素の`title`キーに設定された文字列に変換する
* `notes`はそのまま表示する。

▼card0.png 
![https://gyazo.com/820baa2b9aa19d6d5a62f000292b80e2](https://gyazo.com/820baa2b9aa19d6d5a62f000292b80e2.jpeg)


本サンプルでは、それぞれのカード（様の部分）をタップすると編集モードになるる、という設計とする。その編集モードは、先ずはHTML標準の`input`タグを用いて実装すれば、次のような表示となる。

▼card0-edit.png
![https://gyazo.com/51143f81d3283087fc2c59a673d16f0b](https://gyazo.com/51143f81d3283087fc2c59a673d16f0b.jpeg)


ここまでのサンプルコードは次のようになる。
※`ItemCard0.vue` を、実際には`ItemCard.vue`として動作させる。

https://github.com/hoshimado/qiita-notes/tree/master/qiita-card-bootstrap/src/components/ItemCard0.vue



以下、上述までの表示形式を、BootStrapを用いていい感じにする方法を述べる。


## BootStrap(BootStrapVue)を使う準備をする

Vue.js上でBootStrapを利用するには、BootStrapVueを用いるのが簡単。

* https://github.com/bootstrap-vue/bootstrap-vue

> BootstrapVue provides one of the most comprehensive
> implementations of Bootstrap v4 for Vue.js. 

Vue CLIのプロジェクトのルートフォルダにて、以下のコマンドでインストールする。

```
npm install bootstrap-vue    --save
```

続いて、ルートにある`main.js`を開いて、次の2行（本サンプルではコメント含めて4行）を追加する。

```main.js
import Vue from 'vue'
import App from './App.vue'

// +++ add for bootstrap +++
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
// -------------------------

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
```

以上で、BootStrapをVue CLI上で使う準備は完了。

ref. https://bootstrap-vue.org/docs

## 項目のタイトル相当を見やすくしたい

先ほどの「card0.png」の画面を見やすくすることを考える。

「起きた」や「寝た」などの表示を上手く装飾するものがないか？
と公式BootStrapVueのComponentのページを見ていく。

https://bootstrap-vue.org/docs/components

このページは、簡単な説明を一覧出来て、それぞれのComponentの説明ページに飛ぶとサンプル表示もあるので、「そのComponentによる装飾がどういうものか？」を掴みやすくて、助かる。

どんなコンポーネントがあるか？を上から順に見ていく中で、
今回のケースなら「バッジ（Badge）」で「起きた」「寝た」などを表示するのがよさそうだ、などのように装飾の仕方を決める。

本サンプルでは、上述のBadgeによる装飾とnotesの値をReadOnlyの`Form Textarea`で表示するものとする。
この場合は、次のような表示になる。

▼card1.png
![https://gyazo.com/12d6d9bb3df6660d55e1b9d349875143](https://gyazo.com/12d6d9bb3df6660d55e1b9d349875143.jpeg)


上記を実装するには、コンポーネントItemCard.vueに対して、次のような変更を加える。

* `{{typeStr}}`としていた部分を、`<b-badge v-bind:variant="typeVariant">{{typeStr}}</b-badge>`とする<br>
* `{{notesCurrent}}`としていた部分を、`<b-form-textarea v-bind:value="notesCurrent" readonly rows="2" max-rows="2"></b-form-textarea>`とする
* 利用するコンポーネントを「`import { BBadge, BFormTextarea } from 'bootstrap-vue'`」で読み込んで、「`components: {}`」に指定する

たったこれだけのコード修正で、で上図（card1.png）の様な見やすい表示に変更できる。BootStrapはとても簡単で使いやすい。

なお、編集モード（card0-edit.png）の表示については、`notesCurrent`の部分は、`Form Textarea`を用いて`readonly`属性を外せばよいだろう。編集モード側のUI変更を含めたサンプルコードは以下。

https://github.com/hoshimado/sleeplog/blob/master/qiita-card-bootstrap/src/components/ItemCard1.vue

編集モード側の表示は以下のようになる。

▼card1-edit.png
![https://gyazo.com/fe5ba1dc8bbf9e7b4e3e834ad62d0b43](https://gyazo.com/fe5ba1dc8bbf9e7b4e3e834ad62d0b43.jpeg)


なお、`<b-badge>`コンポーネントは`variant`属性でカラーリングを変更できる。サンプルコードでは、`typelist`配列の各要素に、`variant`キーを追加し、それに従ったBadgeカラーを表示する実装にしてある。

https://github.com/hoshimado/sleeplog/blob/master/qiita-card-bootstrap/src/components/ViewListCard.vue

```
[
    { 
        title: '寝た',
        variant: 'primary'
    }, {
        title: '起きた',
        variant: 'secondary'
    }, {
        title: '服薬',
        variant: 'success'
    }
]
```
`variant`属性への指定において、デフォルトで利用可能な値は以下を参照。

https://bootstrap-vue.org/docs/components/badge#contextual-variations



## 編集モードで選択項目をラジオボタンで、ついでに確定ボタンもいい感じに装飾する

続いて、上図の編集モード（card0-edit.png）における「起きた」「ネタ」をラジオボタンで選べるようにする。HTML標準の`<input type="radio">`でも良いのだが、BootStrapに`Form Radio`コンポーネントがあるので、これを使う。

次の公式ガイドに従って、`<b-form-group>`と`<b-form-radio-group>`を用いる。

https://bootstrap-vue.org/docs/components/form-radio#grouped-radios

編集対象は（propsで渡された`type`をもとに生成した）`typeCurrent`なので、これを`v-model`属性で`<b-form-radio-group>`にバインドする。

```
<b-form-group label="記録の種別を選んでください">
    <b-form-radio-group
        v-model="typeCurrent"
        :options="typeOptions"
    ></b-form-radio-group>
</b-form-group>
```

選択肢は、`v-bind:options`属性（略記して`:options`属性）で設定する。設定すべき変数のフォーマットは配列で、各要素は次の2つのキーを持つ。

* 選択肢の文字列として`text`
* 選択されたときに編集対象（＝`v-model`でバインドされた変数）へ代入する値として`value`

したがって、本サンプルでは（propsで渡された）`typelist`を元にして次のように`typeOptins`配列を生成しておく。

```
this.typelist.forEach((elem, index)=> {
    this.typeOptions.push({
        text: elem.title,
        value: String(index)
    })
})
```

ついでなので、「確定」ボタンもBootStrapVueが提供する`Button`コンポーネントで装飾する。これは、「`<button @click="clickBtnEditFinish">確定</button>`」としていたところを、「`<b-button @click="clickBtnEditFinish">確定</b-button>`」と置き換えるだけで良い。

以上の変更を加えたコンポーネントItemCard.vueのコード全体は以下となる（※`import`と`components`への追加も忘れずに→リンク先のコードを参照）。

https://github.com/hoshimado/sleeplog/blob/master/qiita-card-bootstrap/src/components/ItemCard2.vue

上記のコードへの変更によって、編集モードの表示は次のように変わる。

▼card2-edit.png
![https://gyazo.com/4db021ef51d4331edddc5ab860f6d7de](https://gyazo.com/4db021ef51d4331edddc5ab860f6d7de.jpeg)



## 日時の編集ボックスを、いい感じに装飾する

最後に、上図（card2-edit.png）の日付と時刻の入力を良い感じに装飾する。

（※HTML5利用可能環境であれば、素のHTML inputタグが実装している入力支援のpickerを利用可能なので、BootStrap版に置き換えるか否かは好みの問題かもしれない。一応、IEとPC版SafariはHTML5に未対応のため同じ表示にならないが、BootStrap版なら同じ表示が可能、という差はある）


これまでと同様にBootStrapVueのコンポーネント一覧から、日付と時刻のPickerを探す。

https://bootstrap-vue.org/docs/components

`Form Datepicker`と`Form Timepicker`があるので、これを使う。

https://bootstrap-vue.org/docs/components/form-datepicker

https://bootstrap-vue.org/docs/components/form-timepicker

使い方は、それぞれを次のように置き換えるだけ。

置き換え前：
```
<input v-model="dateCurrent" type="date">
<input v-model="timeCurrent" type="time">
```

置き換え後：
```
<b-form-datepicker v-model="dateCurrent" class="mb-2"></b-form-datepicker>
<b-form-timepicker v-model="timeCurrent" locale="ja"></b-form-timepicker>
```

置き換え後のサンプルコードは次のようになる。

https://github.com/hoshimado/sleeplog/blob/master/qiita-card-bootstrap/src/components/ItemCard3.vue

※ここで「`class=mb-2`」を指定しているが、これはBootStrap v4.5で定義されているclassのこと。BootStrapVueでは、BootStrapで準備されているClassをそのまま利用できる。

* https://bootstrap-vue.org/docs#documentation-information
    * https://bootstrap-vue.org/docs/reference/utility-classes
        * `mb-3`は`margin-bottom`のことで、'-3'は`1rem`を意味する。 https://getbootstrap.com/docs/4.5/layout/utilities-for-layout/#margin-and-padding



上記のコードへの変更によって、編集モードの表示は次のように変わる。

▼card3-1edit.png
![https://gyazo.com/11097020fcca048dd5f9ae00f32fd7ef](https://gyazo.com/11097020fcca048dd5f9ae00f32fd7ef.jpeg)

▼card3-2date.png
![https://gyazo.com/e9461f4372ce6acff2410bee18da2235](https://gyazo.com/e9461f4372ce6acff2410bee18da2235.jpeg)

▼card3-3time.png
![https://gyazo.com/f5f32c9de592b855dd2cb498a13ce8aa](https://gyazo.com/f5f32c9de592b855dd2cb498a13ce8aa.jpeg)

なお、「Picker経由だけでなく、時刻を直にテキストとして入力もしたい」という場合は、inputタグを組わせることで実現できる。BootStrapVueでの、その実装例も公式サイトの以下に記載がある。とても親切♪

https://bootstrap-vue.org/docs/components/form-timepicker#button-only-mode


以上ー。




# Vue CLIのサンプルについて


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
