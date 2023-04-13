<script setup>
import { reactive } from 'vue';
import LocalStorageClient from './utils/localStorageClient.js';
import MyClient from './components/MyClient.vue';

const localStorageClient = reactive(new LocalStorageClient(window));
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
