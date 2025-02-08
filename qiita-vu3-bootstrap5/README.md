# 概要

Vue3でBootStrapを使う方法を説明します。
ここでは、BootStrapVueではなく、オリジナルのBootStrap v5を利用する手法について解説します。  
なお、本記事は自分用のメモとして作成しているため、細かい補足や個人向けの実装例を多く含んでいます。

## 目的

本記事の目的は以下の通りです。

* Vue3上にてBootStrap v5を簡単に使えるようにする

### 背景

BootStrapをVueなどのフレームワーク上で利用する場合、DOM操作がフレームワークと競合する可能性があるため、フレームワーク固有のパッケージ（例: BootstrapVue）の利用が推奨されます[^1]。  
しかし、BootstrapVueは現時点でVue3に未対応であるため、今回はオリジナルのBootStrap v5を直接利用する方法を採用します。  
BootStrapに不慣れな方が、とりあえずVue3上でBootStrapを扱う方法の一例として参考にしてください。

[^1]: Bootstrap JavaScriptによるDOM操作が、各フレームワーク（Vue.jsなど）と競合する可能性があり、完全な互換性は保証されないためです。  
https://getbootstrap.jp/docs/5.3/getting-started/javascript/

## 想定読者

この記事は以下のような方を対象としています。

* Vue3で簡単なWebアプリ（ToDo管理など）を作成できる方
* Composition API記法を使用している方
* BootstrapVueの使用経験はあるが、オリジナルのBootStrapは未経験の方

## 動作環境（検証環境）

（記事完成後に記載）

---

# Vue3での作成手順

以下の手順で説明します。

1. Vue3へのBootStrap v5の導入方法
2. 静的コンポーネントの記述方法
3. 動的コンポーネントの記述方法
4. 動的コンポーネントの動作をカスタマイズする方法

---

## 1. Vue3へのBootStrap v5の導入方法

### 前提となるVue3のプロジェクト作成手順

任意のフォルダー上のコマンドラインから以下のコマンドを実行し、プロジェクトを作成します。

```bash
npm init vue@latest
```

この例では、プロジェクト名を「`intro-bootstrap5-in-vue3`」とし、その他の設定はデフォルト（ESLintのみ「y」）で作成します。

実行例:

```
Need to install the following packages:
create-vue@3.14.0
Ok to proceed? (y) y

Vue.js - The Progressive JavaScript Framework

√ Project name: ... intro-bootstrap5-in-vue3
√ Add TypeScript? ... No / Yes
√ Add JSX Support? ... No / Yes
√ Add Vue Router for Single Page Application development? ... No / Yes
√ Add Pinia for state management? ... No / Yes
√ Add Vitest for Unit Testing? ... No / Yes
√ Add an End-to-End Testing Solution? ≫ No
√ Add ESLint for code quality? ≫ Yes
√ Add Prettier for code formatting? ... No / Yes

Done. Now run:

  cd intro-bootstrap5-in-vue3
  npm install
  npm run dev
```

### 作成したVue3へBootStrapを導入する手順

作成したプロジェクトフォルダー（例：`intro-bootstrap5-in-vue3`）内で、以下の手順に従います。

1. **BootstrapおよびBootstrap Iconsのインストール**  
   npmを使用して、BootstrapとBootstrap Iconsをインストールします[^2]。

   ```bash
   npm install bootstrap
   npm install bootstrap-icons 
   ```

   ※これにより、Bootstrap Iconsも含めて利用可能となります。

[^2]: ここで、オプション`--save`を記述してしませんが、これは、このオプションがnpm v5以降はデフォルトで有効となったためです。そのため省略できます。 `npm install saves any specified packages into dependencies by default.` https://blog.npmjs.org/post/161081169345/v500 , https://qiita.com/hvfnabndnd/items/c5beda8572aa8c1e6be6


1. **JavaScriptとスタイルシートのインポート**  
   プロジェクト全体でBootstrapのスタイルと動作を利用できるよう、`main.js`に以下の記述を追加します[^3]。

   ```javascript
   import './assets/main.css'
   
   import { createApp } from 'vue'
   import App from './App.vue'
   
   // +++ for Bootstrap +++
   import 'bootstrap/dist/css/bootstrap.min.css'
   import 'bootstrap/dist/js/bootstrap.min.js'

   import 'bootstrap-icons/font/bootstrap-icons.css'
   // ----------------------
   
   createApp(App).mount('#app')
   ```

[^3]: BootstrapのSCSSファイルをカスタマイズしたい場合に、`src/scss/styles.scss`を作成した上で、`main.js`でSCSSインポートを行う方法がありますが、今回は割愛します。

これで、プロジェクト全体でBootstrapのスタイルとJavaScriptが使用可能になります[^4]。

[^4]: ツリーシェイキングの観点から、`import 'bootstrap/dist/js/bootstrap.min.js'`ではなく個々のコンポーネント内で`import { Button } from bootstarp`等のように必要なコンポーネントのみ読み込むことを推奨される事が多いです。しかし、静的なコンポーネントや既定の動作の範囲の動的なコンポーネントを使う場面での可読性、理解の簡単さ（`main.js`で読み込んでおけば、動的なカスタマイズを行わない限り個々のコンポーネント内で考慮しなくて良い）を優先し、本記事では`main.js`でBootStrap全体を読み込む方法を採用します。

---

## 2. BootStrapの静的コンポーネントの記述方法

最初に、静的なコンポーネント、つまりJavaScriptによる動作的な動作を伴わず、
Bootstrapの標準CSSクラスのみで見た目やレイアウトが実現されている
コンポーネントを用いる方法について解説します。

### 例1: ボタン

以下のように、CSSクラスを適用するだけで、Bootstrapのコンポーネントをとして利用できます。

```html
<button class="btn btn-primary">Primary Button</button>
```

### 例2: インプットボックス

Vue3のリアクティブな変数（`ref`）と組み合わせる例です。

```vue
<script setup>
import { ref } from 'vue'
const inputText = ref('')
</script>

<template>
  <div>
    <h3>静的コンポーネント：インプット</h3>
    <input 
      type="text" 
      class="form-control"
      placeholder="テキストを入力してください"
      v-model="inputText"
    />
    <br><br>
    Debug: {{ inputText }}
  </div>
</template>
```

---

## 3. BootStrapの動的コンポーネントの記述方法

続いて、動的な表示を伴なうコンポーネントを、
BootStrapの既定の動作仕様のままに利用する方法、
つまりJavaScriptによる動作カスタマイズを行わずに用いる場合の
方法を説明します。

Bootstrapの標準仕様の動作を利用する場合、
追加でのJavaScriptの記述は不要です。

ここでは、ドロップダウンリスト（Dropdowns）とコラプス（collapse）を例にとります。


### 例1: ドロップダウンリスト（Dropdowns）

dropdownクラスが指定された要素の配下において、
属性data-bs-toggleが付与された要素のクリックをトリガーとして、
同じ配下のdropdown-menuクラスが付与された要素をターゲットとして表示と非表示をトグルする仕様のため、
トグルする対象を明示するためにidなどを指定する必要はありません。

```html
<template>
  <div class="dropdown">
    <button 
      class="btn btn-secondary dropdown-toggle" 
      type="button" 
      data-bs-toggle="dropdown" 
      aria-expanded="false"
    >
      ドロップダウンリスト
    </button>
    <ul class="dropdown-menu">
      <li class="dropdown-item">Action</li>
      <li class="dropdown-item">Another action</li>
      <li class="dropdown-item">Something else here</li>
    </ul>
  </div>
</template>
```

### 例2: コラプス（collapse）

コラプスとして開閉する要素を特定する（指定する）には、idを用います。
Vueコンポーネントの再利用性を考慮するとidを即値で書くのは望ましくないので、
動的に管理することで再利用時のid衝突を回避します。

この例では、idはコンポーネント内でしか参照しない前提でUUIDを用いて実装しています
開閉するボタン側のidはコンポーネント外から参照の可能性があるが、
コラプス要素自体はボタンからしか参照されれないため、このようにしています。
一方で、テストの観点から「コンポーネント外からも参照する」場合は、
付与するidを親コンポーネントからprops経由で渡す実装が望ましいです。


```vue
<script setup>
import { ref } from 'vue'
const _generateUUID = () => window.crypto.randomUUID()
const scopedIdCollapse1 = ref(_generateUUID())
</script>

<template>
  <div>
    <h3>動的コンポーネント：コラプス（collapse）</h3>
    <button 
      class="btn btn-primary" 
      type="button" 
      data-bs-toggle="collapse" 
      :data-bs-target="`#${scopedIdCollapse1}`" 
      aria-expanded="false" 
      :aria-controls="scopedIdCollapse1"
    >
      コラプスの開閉
    </button>
    <div class="collapse" :id="scopedIdCollapse1">
      <div class="card card-body">
        Some placeholder content for the collapse component...
      </div>
    </div>
  </div>
</template>
```

---

## 4. Bootstrapの動的コンポーネントの動作をカスタマイズする方法

動的コンポーネントの既定の挙動に対して、独自の処理を割り込ませたい場合の方法を紹介します。  

ここでは、モーダルダイアログ（Modal）とドロップダウンリストを例にとります。


### 例1: モーダルダイアログ（Modal）

モーダルダイアログとして表示する要素を特定する（指定する）には、data-bs-target属性とidを用います。
その際に、Vueコンポーネントの再利用性を考慮して動的にidを指定する実装とするのは、
コラプス（collapse）と同じです。

組み込みの閉じる操作を行うコントローラーにdata-bs-dismiss属性を付与することで、
ここまではコラプスと同様に表示と非表示をJavaScriptを個別に実装すること無く実現できます。

異なるのは、OKボタンが押され時の動作です。こちらは、押された時のイベントを
`@click="onConfirmModalDialog1"`で受け取り、そのメソッド内で明示的に
`bsModalDialog1.hide()`を用いてダイアログを閉じる処理を行う実装としています。

`bsModalDialog1`インスタンスは、`Modal.getOrCreateInstance()`とidを用いて対象の
モーダル要素に紐づけておきます。

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap/dist/js/bootstrap.min.js'
const _generateUUID = () => window.crypto.randomUUID()
const scopedIdModalDialog1 = ref(_generateUUID())
const debugMsg4Dialog1 = ref('')
let bsModalDialog1 = null

const onConfirmModalDialog1 = () => {
  bsModalDialog1.hide()
  debugMsg4Dialog1.value = '保存ボタンが押されました。'
  setTimeout(() => {
    debugMsg4Dialog1.value = ''
  }, 3000)
}

onMounted(() => {
  bsModalDialog1 = Modal.getOrCreateInstance(document.getElementById(scopedIdModalDialog1.value))
})
</script>

<template>
  <div>
    <h3>動的コンポーネント：モーダルダイアログ（Modal）</h3>
    <button 
      type="button" 
      class="btn btn-primary" 
      data-bs-toggle="modal" 
      :data-bs-target="`#${scopedIdModalDialog1}`"
    >
      モーダルダイアログを表示
    </button>
    <div>
      [Debug]ダイアログの結果: {{ debugMsg4Dialog1 }}
    </div>
    <div 
      class="modal fade" 
      :id="scopedIdModalDialog1" 
      tabindex="-1" 
      aria-labelledby="exampleModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">モーダルダイアログのタイトル</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            モーダルダイアログの本文
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="onConfirmModalDialog1"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 例2-1: ドロップダウンリスト（Dropdowns）

先に示した、デフォルト動作のDropdownsとは異なり、
ドロップダウンリスト内部をクリックされた時に必ず閉じるのではなく、
閉じる場合と閉じない場合に分岐させる実装例を説明します。

これは、リスト内部のクリック時を閉じる対象外としたうえで、
閉じるときには自前のJavaScriptを用いて閉じる操作を行う事で実現できます[^5]。
この例では、Dropdownsではidによる指定が不要なので、
操作用のDropdownsインスタンスを取得する際に、モーダルダイアログとは異なり
idを経由せずにVueのref属性を用いて直接に要素を指定する方法を採用しています。

[^5]: デフォルト動作は「ドロップダウンリストの内外のいづれかがクリックされたら閉じる」であり属性`data-bs-auto-close="true"`が設定されます。これを`data-bs-auto-close="outside"`と設定することで「外側がクリックされたら閉じるが、内側をクリックされても閉じない」動作となります。ここまではDropdownsの規定の動作オプションの範囲内です。 https://getbootstrap.jp/docs/5.3/components/dropdowns/#%E8%87%AA%E5%8B%95%E3%81%A7%E9%96%89%E3%81%98%E3%82%8B

```vue
<script setup>
import { onMounted, ref, useTemplateRef } from 'vue';
import { Dropdown } from 'bootstrap/dist/js/bootstrap.min';

const dropdownItemsCustom = ref([
    {id: 1, name: 'Action（選択して閉じる）'},
    {id: 2, name: 'Another action（選択されるが閉じない）'},
    {id: 3, name: 'Something else here'},
]);
const selectedDropdownItemNameCustom = ref('');
const elemDropdownList = useTemplateRef('refDropdownList');
let bsDropdownList = null;
const onDropdownItemClickCustom = (selectedId) => {
    selectedDropdownItemNameCustom.value = dropdownItemsCustom.value.find(item => item.id === selectedId).name;
    if(selectedId !== 2){
        bsDropdownList.hide();
    }
};

onMounted(()=>{
    bsDropdownList = Dropdown.getOrCreateInstance(elemDropdownList.value);
});
</script>

<template>
    <div class="input-group dropdown">
        <input 
            type="text" 
            class="form-control" 
            placeholder="選択されたリスト要素を挿入"
            v-model="selectedDropdownItemNameCustom"
        ></input>
        <button
            type="button" 
            class="btn btn-secondary dropdown-toggle dropdown-toggle-split"
            data-bs-auto-close="outside"
            data-bs-toggle="dropdown" 
        ></button>
        <ul 
            class="dropdown-menu dropdown-menu-end" 
            ref="refDropdownList"
        >
            <li 
                v-for="item in dropdownItemsCustom" 
                :key="item.id"
                class="dropdown-item"
                @click="onDropdownItemClickCustom(item.id)"
            >
                {{item.name}}
            </li>
        </ul>
    </div>
</template>
```


### 例2-2: ドロップダウンリスト（Dropdowns）


次の例では、ドロップダウン自体の動作はカスタムしませんが、その際のイベントをフックして
関連する処理を実行する（途中に割り込ませる）方法を説明します。
この場合は、Dropdownsインスタンスを取得する必要はありませんが、
動作を割り込ませる対象の要素を特定する必要があるため、
先の例と同様にVueのref属性を用いて直接に要素を指定する方法で実装しています。


```vue
<script setup>
import { onMounted, ref, useTemplateRef, onBeforeUnmount } from 'vue';

const debugMsgDropdownCustom2 = ref('');
const elemDropdownList2Parent = useTemplateRef('refDropdownListParent');
const _listenerHiddenBsDropdown = (event) => {
    console.log('hidden.bs.dropdown', event);
    debugMsgDropdownCustom2.value = 'ドロップダウンリストが閉じられました。';
};

onMounted(()=>{
    elemDropdownList2Parent.value.addEventListener(
        'hide.bs.dropdown', 
        _listenerHiddenBsDropdown
    );
});
onBeforeUnmount(() => { // https://ja.vuejs.org/api/composition-api-lifecycle#onunmounted
    // https://vueuse.org/core/useEventListener/ を使えば、umount時のこの考慮は
    // 不要となるが、そのためだけにimportするほどでもない、ので自前で実装する。
    elemDropdownList2Parent.value.removeEventListener(
        'hidden.bs.dropdown', 
        _listenerHiddenBsDropdown
    );
});
</script>

<template>
    <div class="dropdown">
        <button 
            class="btn btn-secondary dropdown-toggle" 
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
            ref="refDropdownListParent"
        >
            ドロップダウンリスト
        </button>
        <ul class="dropdown-menu">
            <li 
                v-for="item in dropdownItems" 
                :key="item.id"
                class="dropdown-item"
            >
                {{item.name}}
            </li>
        </ul>
    </div>
    <div>
        [Debug]ドロップダウンリストの操作: {{debugMsgDropdownCustom2}}
    </div>
</template>
```








