# 概要

Vue.jsで、`<input type="file">`タグを用いてローカルの画像ファイル（※１）を選択して読み込む方法を記載する。合わせて、拡大縮小する方法も記載する。

※１：スマホならカメラでの撮影を選択できることも多い(スマホのブラウザ実装次第）。

※２：Vue CLIを前提とするので、CDN版で了する際は、html部分とjs部分を適宜読み替えること。

なお、本記事は「画像ファイルの読み込みの仕組みの勉強」が目的（の車輪の再発明）。
単に「画像ファイルを読み込む」だけが目的であれば、JavaScript-Load-Imageを使った方が確実で早いことに、留意。

* JavaScript-Load-Image
    * https://github.com/blueimp/JavaScript-Load-Image

# 前提

Vue CLIで生成される`App.vue`を次のように変更し、`components`フォルダ配下に`MyClient.vue`ファイルを配置するものとする。以降では、この構成を前提として`MyClient.vue`ファイルの実装方法をについて述べる。

```App.vue
<template>
  <div id="app">
    <MyClient></MyClient>
  </div>
</template>

<script>
import MyClient from './components/MyClient.vue'

export default {
  name: 'App',
  components: {
    MyClient
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
```



# ローカルの画像ファイルを読み込んで表示する方法

ファイル選択ダイアログの入力受けて画像ファイルを表示するには次のようにする。

1. `<input type="file">`タグに `v-on:change="メソッド名"`を追加して、ファイル選択ダイアログの実行結果を受け取れるようにする
2. `v-on:change="メソッド名"`で指定したメソッドにイベントオブジェクトが渡されるので、そこからファイルパスを取得する
3. 続いて、FileReaderオブジェクトを利用して、Base64エンコードしたデータとして受け取る


※file属性では、セキュリティの都合で「外部（ダイアログ以外）からローカルファイルパスを指定できない」ので、`v-model`による双方向バインドは指定不可。

※読み込んだファイルを、REST APIでどこかのバックエンドにアップロードすることが多いと思われるんので、その際によく使われる形式であるBase64で読み込んでおく。`img`タグはBase64形式を画像として表示できるので問題ない。他の形式での読み込み方は、こちらを参照のこと。→ https://developer.mozilla.org/ja/docs/Web/API/FileReader

![ファイル選択ダイアログで読み込んだ画像ファイル（壁紙）を表示してみた例](https://gyazo.com/08edafbaaecc1ef9a698254ea1ba15b5.jpeg)

`MyClient.vue`ファイルの実装例は次のようになる。

```MyClient.vue
<template>
<div>
    <div id="id_title">
        ファイル選択ダイアログからの画像ファイルのアップロード
    </div>
    <br>
    <div id="id_face_imaeg">
        <img :src="targetImage" alt="選択された画像" class="image">
    </div>
    <br>
    <br>
    <div id="id_register_image">
        <input v-on:change="selectedFile" type="file" name="file" accept="image/jpeg, image/png"><br>
        <br>
        <br>
    </div>
</div>
</template>


<script>
// javascriptファイルをココへ。

export default {
    name : "MyClient",
    components : { 
    },
    data : function () {
        return {
            targetImage : null
        }
    },
    methods : {
        getFileAsBase64 : function(filePath) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(filePath);
                // ここまでで「resolve(e.target.result)」でbase64化された画像ファイルデータが返却される。
                // https://fujiten3.hatenablog.com/entry/2019/07/10/133132
            })
        },  
        selectedFile : function (e) {
            let files = e.target.files;
            e.preventDefault(); // 標準のInputタグの動作をキャンセル
            // http://tech.aainc.co.jp/archives/10714
            // https://developer.mozilla.org/ja/docs/Web/API/File/Using_files_from_web_applications

            if(files && files.length > 0){ // 有効なFileオブジェクトが渡された時は、画像ファイルとして読み込みを実施
                this.getFileAsBase64(files[0])
                .then((imgDataBase64)=>{
                    this.targetImage = imgDataBase64;
                });
                // ToDo: エラー処理
            }
        }  
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Cssファイルはここへ配置する。 */

</style>
```

# 読み込んだ画像をリサイズ（拡大縮小）する方法

読み込んだ画像を拡大縮小してからアップロードを行いたい場合があります。
その際に、JavaScriptのみで**リサイズ後の画像データを生成**するには、次のようにします。

※表示時にリサイズしたいだけ（データは変更しない）なら、imgタグの縦横設定でOKです。

1. 読み込んだ画像データをImageオブジェクトへ変換
    * srcタグに相当
        * https://hakuhin.jp/js/image.html#DOCUMENT_ATTACH_IMAGE
        * https://developer.mozilla.org/ja/docs/Web/Guide/HTML/Canvas_tutorial/Using_images
    * 変換は非同期に行われるので、onloadメソッドが呼ばれたらresolve()する
2. HTML5の `canvas` タグへ描画する際の「縮尺指定」を利用してリサイズを実行
3. `canvas`タグの描画データを「その縦横サイズの画像」として新規に取得する

`MyClient.vue`ファイルの実装例は次のようになる。なお、このサンプルではcanvasエリアを非表示の設定としている。

```MyClient.vue
<template>
<div>
    <div id="id_title">
        ファイル選択ダイアログからの画像ファイルのアップロード
    </div>
    <br>
    <div id="id_face_imaeg">
        <img :src="targetImage" alt="選択された画像" class="image">
    </div>
    <br>
    <br>
    <div id="id_register_image">
        <input v-on:change="selectedFile" type="file" name="file" accept="image/jpeg, image/png"><br>
        <br>
        <br>
    </div>
    <div id="id_canvas_for_resize" v-show="false">
        拡大縮小用のCanvasエリア<br>
        <canvas ref="canvas"/>
    </div>
</div>
</template>


<script>
// javascriptファイルをココへ。

export default {
    name : "MyClient",
    components : { 
    },
    data : function () {
        return {
            resizeUpperLimitPixel : 320,
            targetImage : null
        }
    },
    methods : {
        getFileAsBase64 : function(filePath) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(filePath);
                // ここまでで「resolve(e.target.result)」でbase64化された画像ファイルデータが返却される。
                // https://fujiten3.hatenablog.com/entry/2019/07/10/133132
            })
        },  
        resizeImage64withCanvase : function (loadedFile, canvas) {
            // 以下、縮小を掛けるにはimage経由でのcanvasへの貼り付けを利用する。
            // https://qiita.com/busroutemap/items/b563dfe8b08bb3338eb5
            // https://qiita.com/su_mi1228/items/492c89db7f96823a26c0
            // https://www.mahirokazuko.com/entry/2019/08/20/133713

            return new Promise((resolve)=>{
                const image = new Image();
                image.onload = () => resolve(image); // (e)は利用されないので省略。
                image.src = loadedFile;
            }).then((image)=>{
                const ctx = canvas.getContext('2d'); // 2Dコンテキスト
                const MAX_SIZE = this.resizeUpperLimitPixel; // 縦横で長い方の最大値を指定する（例：800）とする

                if (image.width < MAX_SIZE && image.height < MAX_SIZE) {
                    // MAX_SIZEよりも小さかったらそのまま貼り付ける

                    [canvas.width, canvas.height] = [image.width, image.height];
                    ctx.drawImage(image, 0, 0);
                }else{
                    let dstWidth;
                    let dstHeight;
                    // 縦横比の計算
                    if (image.width > image.height) {
                        dstWidth = MAX_SIZE;
                        dstHeight = (image.height * MAX_SIZE) / image.width;
                    } else {
                        dstHeight = MAX_SIZE;
                        dstWidth = (image.width * MAX_SIZE) / image.height;
                    }
                    canvas.width = dstWidth;
                    canvas.height = dstHeight;
                    // canvasに既に描画されている画像があればそれを消す
                    ctx.clearRect(0,0,dstWidth,dstHeight);
                    // リサイズして貼り付ける
                    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, dstWidth, dstHeight);
                }

                // canvasから画像をbase64として取得する
                let base64 = canvas.toDataURL('image/jpeg');

                return Promise.resolve(base64);
            });
        },
        selectedFile : function (e) {
            let files = e.target.files;
            e.preventDefault(); // 標準のInputタグの動作をキャンセル
            // http://tech.aainc.co.jp/archives/10714
            // https://developer.mozilla.org/ja/docs/Web/API/File/Using_files_from_web_applications

            if(files && files.length > 0){ // 有効なFileオブジェクトが渡された時は、画像ファイルとして読み込みを実施
                this.getFileAsBase64(files[0])
                .then((imgDataBase64)=>{
                    return this.resizeImage64withCanvase(imgDataBase64, this.$refs.canvas);
                }).then((imgDataBase64)=>{
                    this.targetImage = imgDataBase64;
                });
                // ToDo: エラー処理
            }
        }  
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Cssファイルはここへ配置する。 */

</style>
```

# 画像選択とリサイズまでをComponent化する

画像ファイル選択とリサイズの部分をComponent化（部品可）して、「`<SelectImage v-on:selectedImage="finishSelectingImage">`と記載したら、読み込みとリサイズ完了後にfinishSelectingImage()が呼ばれる（※呼ばれる関数名は任意）」ようにすることを考える。

この場合、呼び出し側の `MyClient.veu` は次のようにする。
なお、リサイズ値とCanvasの表示非表示を設定できるようにしてある。

```MyClient.vue
<template>
<div>
    <div id="id_title">
        ファイル選択ダイアログからの画像ファイルのアップロード
    </div>

    <div id="id_face_imaeg">
        <div id="id_face_imaeg_uploaded" v-show="targetImage">
            <img :src="targetImage" alt="サムネイル" class="image">
        </div>
        <div id="id_face_imaeg_notfound" v-show="!targetImage">
            <img alt="画像は未選択" src="../assets/no_image.png">
        </div>
    </div>
    <br>
    <br>

    <SelectImage v-on:selectedImage="finishSelectingImage" v-bind:isCanvasShow="false" v-bind:resizeUpperLimitPixel="360">
        <!-- 画像の読み込み -->
    </SelectImage>
</div>
</template>


<script>
// javascriptファイルをココへ。

import SelectImage from './SelectImage.vue';


export default {
    name : "MyClient",
    components : { 
        SelectImage,
    },
    data : function () {
        return {
            targetImage : null
        }
    },
    methods : {
        clickReset : function () {
            this.targetImage = null;
        },
        finishSelectingImage : function (selectedImage) {
            if(selectedImage){
                this.targetImage = selectedImage;
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Cssファイルはここへ配置する。 */

</style>
```

呼び出し先のcomponentは、この例では「SelectImage」として次のように実装する。

```SelectImage.vue
<template>
<div>
    <div id="id_register_image">
        <input v-on:change="selectedFile" type="file" name="file" accept="image/jpeg, image/png"><br>
        ※画像は{{resizeUpperLimitPixel}}x{{resizeUpperLimitPixel}}以下へリサイズされます。<br>
        <br>
        <br>
        <div class="selecting-image-footer">
            <slot name="footer"><!-- default footer -->
                <!-- 戻るボタンなどが必要な場合は、呼び出しもとで設定すること -->
            </slot>
        </div>
    </div>
    <div id="id_canvas_for_resize" v-show="isCanvasShow">
        <canvas ref="canvas"/>
    </div>
</div>
</template>

<script>
// javascriptファイルをココへ。


export default {
    name : "SelectImage",
    props : {
        isCanvasShow : {
            type: Boolean,
            default: true,
            required: false
        },
        resizeUpperLimitPixel : {
            type: Number,
            default: 800,
            required: false
        }
    },
    data : function () {
        return {
            uploadedImage : null
        }
    },
    created : function () {
    },
    methods : {
        getFileAsBase64 : function(filePath) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(filePath);
                // ここまでで「resolve(e.target.result)」でbase64化された画像ファイルデータが返却される。
                // https://fujiten3.hatenablog.com/entry/2019/07/10/133132
            })
        },  
        resizeImage64withCanvase : function (loadedFile, canvas) {
            // 以下、縮小を掛けるにはimage経由でのcanvasへの貼り付けを利用する。
            // https://qiita.com/busroutemap/items/b563dfe8b08bb3338eb5
            // https://qiita.com/su_mi1228/items/492c89db7f96823a26c0
            // https://www.mahirokazuko.com/entry/2019/08/20/133713

            return new Promise((resolve)=>{
                const image = new Image();
                image.onload = () => resolve(image); // (e)は利用されないので省略。
                image.src = loadedFile;
            }).then((image)=>{
                const ctx = canvas.getContext('2d'); // 2Dコンテキスト
                const MAX_SIZE = this.resizeUpperLimitPixel; // 縦横で長い方の最大値を指定する（例：800）とする

                if (image.width < MAX_SIZE && image.height < MAX_SIZE) {
                    // MAX_SIZEよりも小さかったらそのまま貼り付ける

                    [canvas.width, canvas.height] = [image.width, image.height];
                    ctx.drawImage(image, 0, 0);
                }else{
                    let dstWidth;
                    let dstHeight;
                    // 縦横比の計算
                    if (image.width > image.height) {
                        dstWidth = MAX_SIZE;
                        dstHeight = (image.height * MAX_SIZE) / image.width;
                    } else {
                        dstHeight = MAX_SIZE;
                        dstWidth = (image.width * MAX_SIZE) / image.height;
                    }
                    canvas.width = dstWidth;
                    canvas.height = dstHeight;
                    // canvasに既に描画されている画像があればそれを消す
                    ctx.clearRect(0,0,dstWidth,dstHeight);
                    // リサイズして貼り付ける
                    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, dstWidth, dstHeight);
                }

                // canvasから画像をbase64として取得する
                let base64 = canvas.toDataURL('image/jpeg');

                return Promise.resolve(base64);
            });
        },
        selectedFile : function (e) {
            let files = e.target.files;
            e.preventDefault(); // 標準のInputタグの動作をキャンセル
            // http://tech.aainc.co.jp/archives/10714
            // https://developer.mozilla.org/ja/docs/Web/API/File/Using_files_from_web_applications

            if(files && files.length > 0){ // 有効なFileオブジェクトが渡された時は、画像ファイルとして読み込みを実施
                this.getFileAsBase64(files[0])
                .then((imgDataBase64)=>{
                    return this.resizeImage64withCanvase(imgDataBase64, this.$refs.canvas);
                }).then((imgDataBase64)=>{
                    this.uploadedImage = imgDataBase64;
                    this.$emit('selectedImage', this.uploadedImage);
                });
                // ToDo: エラー処理
            }
        }  
    }
}
</script>

<style scoped>
</style>
```

以上ー。


# 参考サイト

* Vueで画像アップロード + プレビュー機能付きフォームを作りました。(Base64エンコード利用) 
    * https://fujiten3.hatenablog.com/entry/2019/07/10/133132
* canvasとvuejsの連携を初心者なりに調べた
    * https://qiita.com/busroutemap/items/b563dfe8b08bb3338eb5
* 画像をリサイズしてblobでプレビュー表示する方法【Vue/Canvas】
    * https://qiita.com/su_mi1228/items/492c89db7f96823a26c0
* ブラウザで画像を縮小してサーバにアップロードするJavaScript
    * https://www.mahirokazuko.com/entry/2019/08/20/133713
* Vue.js でファイルをポストしたいとき
    * http://tech.aainc.co.jp/archives/10714
* ウェブアプリケーションからのファイルの使用
    * https://developer.mozilla.org/ja/docs/Web/API/File/Using_files_from_web_applications




# select-image-sample

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
