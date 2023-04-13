<script setup>
import { computed } from '@vue/reactivity';
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
const getNowWithFormat = function name(params) {
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

<style scoped>
/* Cssファイルはここへ配置する。 */
#id-root {
    width: 100%;
    margin: 0px;
    padding: 0px;
}
.container-space-between {
    display: flex; /* 親要素をフレックスボックスにする */
    justify-content: space-between; /* 子要素を両端に寄せる */
}
.container-flex {
    display: flex; /* 親要素をフレックスボックスにする */
    justify-content: space-between; /* 子要素を両端に寄せる */
}
.textarea-width100 {
    width: 100%;
}
.div-textarea-footer {
    height: 50px; /* 下部の余白を50pxに設定 */
} 
.div-label {
    margin: 8px;
}

</style>
