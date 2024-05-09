import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";
import Online from "./pages/Online.vue";
import Offline from "./pages/Offline.vue";
import { useOnline } from "./store/online";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "home",
      path: "/",
      component: Home
    },
    {
      name: "offline",
      path: "/offline",
      component: Offline
    },
    {
      name: "room",
      path: "/room/:room",
      component: Online
    }
  ]
})

router.beforeEach((to, _, next) => {
  const onlineGame = useOnline()

  if (to.name === "room") {
    if (onlineGame.gameSession) {
      if (onlineGame.gameSession.roomCode === to.params.room) {
        return next()
      } else {
        onlineGame.leaveRoom()
      }
    }

    onlineGame.joinRoom("Player", to.params.room as string)
      .catch(() => {
        next({ name: "home" })
      })
    return
  } else {
    console.log('Leaving room')
    onlineGame.leaveRoom()
  }

  next()
})

export default router
