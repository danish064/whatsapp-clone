import { createRouter, createWebHistory } from "vue-router";
// import HomeView from '@/views/HomeView.vue'
import HomePage from '@/pages/HomePage.vue'
import Login from '@/pages/Login.vue'
import PageNotFound from '@/pages/PageNotFound.vue'
import { useUserStore } from "@/store/user-store";
const routes = [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/login",
    component: Login,
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
