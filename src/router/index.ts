import { createRouter,createWebHistory } from "vue-router";
import {ElMessage} from "element-plus";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
          path: '/',
          redirect: '/login'
        },
        {
            path: '/login',
            component: () => import('../views/Login.vue')
        },
        {
            path: '/register',
            component: () => import('../views/Register.vue')
        },
        {
            path: '/admin',
            component: () => import('../layout/verticalTools.vue'),
            redirect: '/admin/dashboard',
            children: [
                //dashboard
                {
                  path: 'dashboard',
                  component: () => import('../views/Dashboard.vue')
                },
                // User相关
                {
                    path: 'user',
                    children: [
                        {
                            path: 'info',
                            component: () => import('../views/User/Info.vue')
                        },
                        {
                            path: 'list',
                            component: () => import('../views/User/List.vue')
                        },
                        {
                            path: 'add',
                            component: () => import('../views/User/Add.vue')
                        }
                    ]
                },
                // Movie
                {
                    path: 'movie',
                    children: [
                        {
                            path: 'list',
                            component: () => import('../views/Movie/List.vue')
                        },
                        {
                            path: 'add',
                            component: () => import('../views/Movie/Add.vue')
                        }
                    ]
                },
                // Cinema
                {
                    path: 'cinema',
                    children: [
                        {
                            path: 'list',
                            component: () => import('../views/Cinema/List.vue')
                        },
                        {
                            path: 'add',
                            component: () => import('../views/Cinema/Add.vue')
                        },
                        {
                            path: 'screenroom',
                            component: () => import('../views/Cinema/ScreenRoom.vue')
                        }
                    ]
                },
                // Screening
                {
                    path: 'screening',
                    children: [
                        {
                            path: 'list',
                            component: () => import('../views/Screening/List.vue')
                        },
                        {
                            path: 'add',
                            component: () => import('../views/Screening/Add.vue')
                        }
                    ]
                }
                // // ticket
                // {
                //     path: 'ticket',
                //     children: [
                //         {
                //             path: 'count',
                //             component: () => import('../views/Ticket/Count.vue')
                //         }
                //     ]
                // },
                // {
                //     path: 'order',
                //     children: [
                //         {
                //             path: 'count',
                //             component: () => import('../views/Order/Count.vue')
                //         }
                //     ]
                // }
            ]
        },
        {
            path: '/index',
            component: () => import('../layout/ticketoffice.vue'),
            redirect: '/index/main',
            children: [
                {
                    path: 'main',
                    component: () => import('../views/TikcetOffice/Main.vue')
                },
                {
                    path: 'hot',
                    component: () => import('../views/TikcetOffice/Hot.vue')
                },
                {
                    path: 'cinemas',
                    component: () => import('../views/TikcetOffice/Cinemas.vue')
                },
                {
                    path: 'userinfo',
                    component: () => import('../views/TikcetOffice/UserInfo.vue')
                }
            ]
        }
    ]
})

// 全局路由守卫
router.beforeEach((to, _from, next) => {
    // 检查是否访问管理页面
    if (to.path.startsWith('/admin')) {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            console.warn('无管理员权限，禁止访问:', to.path);
            ElMessage.error('无管理员权限，禁止访问！');
            // 清除可能的残留 Token
            localStorage.removeItem('adminToken');

            // 跳转到登录页，并传递原目标路径用于登录后重定向
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            });
            return;
        }
    }

    // 检查是否访问购票页面
    if (to.path.startsWith('/index')) {
        const token = localStorage.getItem('token');
        if (!token && localStorage.getItem("adminToken")) {
            ElMessage.error('管理员禁止访问购票页面！');
            next({
                path: '/admin'
            })
        }
        next()
    }

    next()
});


export default router;
