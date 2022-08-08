import { createRouter, createWebHashHistory } from 'vue-router'

// import SameEntryPage from '../components/SameEntryPage.vue'
// // 添加路由
// {
//   path: '/same-entry-page',
//   name: 'same-entry-page',
//   component: SameEntryPage
// }


const routes = [
    {
        path: '/',
        redirect: '/ProjectList'
    },
    {
        path: '/ProjectList',
        name: 'ProjectList',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/ProjectList.vue')
    },
    {
        path: '/MonacoDiffEditor',
        name: 'MonacoDiffEditor',
        component: () => import('../views/MonacoDiffEditor.vue')
    },
    {
        path: '/HelloWorld',
        name: 'HelloWorld',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../components/HelloWorld.vue')
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// router.beforeEach(to, from, next){
//   next()
// }

export default router
