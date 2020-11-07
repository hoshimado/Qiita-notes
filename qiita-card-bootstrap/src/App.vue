<template>
  <div id="app">
    <ViewListCard></ViewListCard>
  </div>
</template>

<script>
import ViewListCard from './components/ViewListCard.vue'
// add install - 'npm i bootstrap-vue moment --save'

export default {
  name: 'App',
  components: {
    ViewListCard
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
