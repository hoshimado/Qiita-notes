<script>
import TweetDrop from './TweetDrop.vue';

export default {
    name: 'MyClient',
    components: {
        TweetDrop
    },
    props: {
        localStorageClient : {
            type: Object,
            required : true
        }
    },
    data: function () {
        return {
            isCreating1st: true,
            isSignup: false
        }
    },
    mounted: function () {
        setTimeout(() => {
            this.isCreating1st = false;
            this.isSignup = true;
        }, 1000);
    }
};
</script>

<template>
<div id="id-root"><!-- ラッパーは不要だが、Cssの都合でいったんこうする -->
    <div id="id_creating_contents" v-show="isCreating1st">
        loading page...
    </div>
    <div id="id_signup_section" v-if="isSignup"><!-- ロード時に毎回初期化処理が走ってほしいので、showではなくifとする -->
        <TweetDrop
            v-bind:localStorageClient="localStorageClient"
        ></TweetDrop>
    </div>
    <!--
    <div id="id_timeout" v-show="isTimeout">
        有効期限タイムアウト時の表示
    </div>
    <div id="id_out_of_service" v-show="isOutOfService">
        Authentication failed.  <br>
        Please login again <a href="../login">here</a>.
        <hr width="100%">
        認証情報が見つかりませんでした。再ログインしてください。<br>
        <a href="../login">【ログイン】</a><br>
    </div>
    -->
</div>
</template>

<style scoped>
/* Cssファイルはここへ配置する。 */
#id-root {
    width: 100%;
}
#id_timeout{
    text-align: center;
}
#id_out_of_service{
    text-align: center;
}

</style>
