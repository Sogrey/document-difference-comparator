import { createRouter, createWebHashHistory } from 'vue-router'


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
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// router.beforeEach(to, from, next){
//   next()
// }

export default router
