import Vue from 'vue'
import Router from 'vue-router'
import Airdrop from '@/pages/Airdrop'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Airdrop',
      component: Airdrop
    }
  ]
})
