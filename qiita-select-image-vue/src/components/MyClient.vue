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
        <!--
        <span slot="footer">
            <div id="id_close_button" v-on:click="clickReset">
                <button class="btn btn-primary btn-lg">画像を削除（非選択にする）</button>
            </div>
        </span>
        -->
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
