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