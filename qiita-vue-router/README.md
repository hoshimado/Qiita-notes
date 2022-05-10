# 概要


# 作成手順

```
npm init
npm i http-server --save-dev 
npm i @vue/cli  --save-dev 
```

もしくは本ディレクトリ上の `package.json`を前提に以下。

```
npm install
```

続いてVue-cli

```
npx vue   create cli-vue
```

```
Vue CLI v5.0.4
? Please pick a preset:
  hoshimado-defualt-vuejs ([Vue 2] babel, eslint, unit-mocha) 
  Default ([Vue 3] babel, eslint)
  Default ([Vue 2] babel, eslint)
> Manually select features
```

```
? Please pick a preset: Manually select features
? Check the features needed for your project: Babel, Router, Vuex, Linter, Unit
? Choose a version of Vue.js that you want to start the project with 2.x
? Use history mode for router? (Requires proper server setup for index fallback in production) No
? Pick a linter / formatter config: Basic
? Pick additional lint features: Lint on save   
? Pick a unit testing solution: Mocha
? Where do you prefer placing config for Babel, ESLint, etc.? In dedicated config files
? Save this as a preset for future projects? (y/N)
```

```
npm i bootstrap-vue --save 
```

```vue.config.js
  publicPath: './',
  outputDir : '../public',
```

```main.js
// +++ add for bootstrap +++
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
// -------------------------
```




