import { createRouter, createWebHistory } from "vue-router"
import Home from "@/pages/Home.vue"
import Online from "@/pages/Online.vue"
import LocalGame from "@/pages/LocalGame.vue"
import NotFound from "@/pages/NotFound.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "home",
      path: "/",
      component: Home
    },
    {
      name: "local",
      path: "/local",
      component: LocalGame
    },
    {
      name: "room",
      path: "/room/:room",
      component: Online
    },
    {
      name: "not-found",
      path: "/:pathMatch(.*)*",
      component: NotFound
    }
  ]
})

export default router
