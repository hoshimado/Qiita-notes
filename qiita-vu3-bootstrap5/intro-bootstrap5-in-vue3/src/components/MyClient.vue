<script setup>
import { onMounted, ref } from 'vue';



const inputText = ref('');



const isCreating1st = ref(true);
const isDataLoaded = ref(false);

onMounted(()=>{
    setTimeout(() => {
        // スタンドアロン以外のモード(クラウドにデータを保持など）を考慮し、
        // 初期処理（ログインなど）を実装出来る構造としておく。

        // ロード完了後に表示を切り替える。
        isCreating1st.value = false;
        isDataLoaded.value = true;
    }, 100);
});
</script>



<template>
<div id="id-root"><!-- ラッパーは不要だが、Cssの都合でいったんこうする -->
    <div id="id_creating_contents" v-show="isCreating1st">
        loading page...
    </div>
    <div id="id_signup_section" v-if="isDataLoaded"><!-- ロード時に毎回初期化処理が走ってほしいので、showではなくifとする -->
        <div>
            <h1>静的コンポーネント：インプット</h1>
            <input 
                type="text" 
                class="form-control"
                placeholder="テキストを入力してください"
                v-model="inputText"
            ></input>
            <br><br>
            Debug: {{inputText}}
        </div>
        <hr
    </div>
</div>
</template>

<style scoped>
/* Cssファイルはここへ配置する。 */
#id-root {
    width: 100%;
}
#id_creating_contents{
    text-align: center;
}

</style>
