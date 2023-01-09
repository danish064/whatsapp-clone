import { createRouter, createWebHistory } from "vue-router";
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import PageNotFound from '@/views/PageNotFound.vue'
import { useUserStore } from "../store/user-store";
const routes = [
  {
    path: "/",
    component: HomeView,
  },
  {
    path: "/login",
    component: LoginView,
  },
  {
    // path: '/:garbage',
    path: '/:pathMatch(.*)*',
    component: PageNotFound
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from) => {
  const userStore = useUserStore();
  if (userStore.uid == '' && to.path !== '/login') {
    return { path: '/login' }
  }

  if (userStore.uid !== '' && to.path === '/login') {
    return { path: '/' }
    // return false
  }
})
export default router;
