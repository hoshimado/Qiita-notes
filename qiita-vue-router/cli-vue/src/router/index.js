import Vue from 'vue'
import VueRouter from 'vue-router'
import HomePortalView from '../views/HomePortalView'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePortalView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/useroptions',
    name: 'useroptions',
    component: () => import(/* webpackChunkName: "about" */ '../components/UserOptions.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
