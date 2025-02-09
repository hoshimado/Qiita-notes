<script setup>
import { onMounted, ref } from 'vue';
import MyClient from './components/MyClient.vue';


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
  <div class="app-root">
    <div id="id_creating_contents" v-show="isCreating1st">
        loading page...
    </div>
    <div id="id_signup_section" v-if="isDataLoaded"><!-- ロード時に毎回初期化処理が走ってほしいので、showではなくifとする -->
      <MyClient
      ></MyClient>
    </div>
  </div>
</template>

<style scoped>
.app-root {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
</style>
