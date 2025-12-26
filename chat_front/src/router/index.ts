import { createRouter, createWebHistory } from 'vue-router'
import FormGeneratorView from '../views/FormGeneratorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: FormGeneratorView,
    },
  ],
})

export default router
