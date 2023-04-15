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
