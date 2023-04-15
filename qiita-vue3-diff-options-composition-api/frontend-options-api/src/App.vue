<script>
import LocalStorageClient from './utils/localStorageClient.js';
import MyClient from './components/MyClient.vue';

export default {
    name: 'app',
    components: {
        MyClient
    },
    data: function () {
        return {
            localStorageClient: new LocalStorageClient(window)
        }
    }
}
</script>



<template>
  <div id="app">
    <MyClient 
      v-bind:localStorageClient="localStorageClient"
    >
    </MyClient>
  </div>
</template>

<style scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
