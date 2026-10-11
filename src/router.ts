import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import WatchesView from './views/WatchesView.vue'
import ProfileView from './views/ProfileView.vue'
import WatchFormView from './views/WatchFormView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Asosiy' } },
    { path: '/watches', name: 'watches', component: WatchesView, meta: { title: 'Kuzatuvlar' } },
    { path: '/watches/new', name: 'watch-create', component: WatchFormView, meta: { title: 'Safarni rejalashtirish', formPage: true } },
    { path: '/drafts/:id/edit', name: 'draft-edit', component: WatchFormView, meta: { title: 'Qoralamani tahrirlash', formPage: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { title: 'Profil' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${String(to.meta.title || 'Asosiy')} · Railway Ticket`
})
