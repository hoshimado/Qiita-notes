<template>
  <div id="app">
    <MyClient>
    </MyClient>
  </div>
</template>


<style>
/* Cssファイルはここへ配置する。 */
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>


<script>
import MyClient from './components/MyClient.vue'


export default {
    name: 'app',
    components: {
      MyClient
    },
    data: function () {
        return {
        };
    }
}
</script>


