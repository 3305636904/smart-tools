import { createRouter, createWebHashHistory } from 'vue-router'
// import type { Route } from "../typings/router";
import { RouteRecordRaw } from "vue-router";

export const routes : Array<RouteRecordRaw> = [
  // {
  //   path: '/settings',
  //   components: () => import('@/components/Setting/index.vue'),
  //   meta: {
  //     title: '设置'
  //   }
  // },
  {
    path: "/",
    component: () => import("../components/CategoryList.vue"),
    meta: {
      title: '主界面'
    }
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})