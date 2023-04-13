<script setup>
import TweetDrop from './TweetDrop.vue';
import { onMounted, ref } from 'vue';

defineProps({
    localStorageClient : {
        type: Object,
        required : true
    }
});

const isCreating1st = ref(true);
const isSignup = ref(false);

onMounted(()=>{
    setTimeout(() => {
        isCreating1st.value = false;
        isSignup.value = true;
    }, 1000);
});
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
