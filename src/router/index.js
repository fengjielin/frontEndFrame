import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/index',
  },
  // PC端
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登陆',
      requireAuth: false,
      keepAlive: false,
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "login" */ '../views/pc/Login.vue'),
  },
  {
    path: '/index',
    name: 'Index',
    meta: {
      title: '首页',
      requireAuth: true,
      keepAlive: false,
    },
    component: () => import('../views/pc/Index.vue'),
    children: [
      {
        path: '/sys/auth',
        name: 'auth',
        meta: {
          title: '权限管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          auth: (resolve) => require(['../views/pc/sys/role.vue'], resolve),
        },
      },
      {
        path: '/sys/sysLog',
        name: 'sysLog',
        meta: {
          title: '操作日志',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          sysLog: (resolve) => require(['../views/pc/sys/systemLog.vue'], resolve),
        },
      },
      {
        path: '/base/user',
        name: 'user',
        meta: {
          title: '用户管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          user: (resolve) => require(['../views/pc/base/user.vue'], resolve),
        },
      },
      {
        path: '/base/pastem',
        name: 'ROLE_JCXXGL_PASTEM',
        meta: {
          title: '院系管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_JCXXGL_PASTEM: (resolve) => require(['../views/pc/base/pastem.vue'], resolve),
        },
      },
      {
        path: '/base/departInfo',
        name: 'ROLE_JCXXGL_BMGL',
        meta: {
          title: '部门管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_JCXXGL_BMGL: (resolve) => require(['../views/pc/base/departInfo.vue'], resolve),
        },
      },
      {
        path: '/base/term',
        name: 'ROLE_JCXXGL_TERM',
        meta: {
          title: '学期管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_JCXXGL_TERM: (resolve) => require(['../views/pc/base/term.vue'], resolve),
        },
      },
      {
        path: '/base/specialty',
        name: 'ROLE_JCXXGL_ZYGL',
        meta: {
          title: '专业管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_JCXXGL_ZYGL: (resolve) => require(['../views/pc/base/specialty.vue'], resolve),
        },
      },
      {
        path: '/base/nianji',
        name: 'ROLE_base_nianji',
        meta: {
          title: '年级管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_base_nianji: (resolve) => require(['../views/pc/base/nianji.vue'], resolve),
        },
      },
      {
        path: '/base/banji',
        name: 'ROLE_base_banji',
        meta: {
          title: '年级管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_base_banji: (resolve) => require(['../views/pc/base/banji.vue'], resolve),
        },
      },
      {
        path: '/base/studentInfo',
        name: 'ROLE_JCXXGL_XSXXGL',
        meta: {
          title: '学生信息管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_JCXXGL_XSXXGL: (resolve) => require(['../views/pc/base/studentInfo.vue'], resolve),
        },
      },
      {
        path: '/base/teacherInfo',
        name: 'ROLE_base_teacher',
        meta: {
          title: '教师信息管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_base_teacher: (resolve) => require(['../views/pc/base/teacherInfo.vue'], resolve),
        },
      },
      {
        path: '/base/courseManage',
        name: 'ROLE_JCXXGL_KCXXGL',
        meta: {
          title: '课程管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_JCXXGL_KCXXGL: (resolve) => require(['../views/pc/base/courseManage.vue'], resolve),
        },
      },
      {
        path: '/base/teachingClass',
        name: 'ROLE_JCXXGL_JXBGL',
        meta: {
          title: '教学班管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_JCXXGL_JXBGL: (resolve) => require(['../views/pc/base/teachingClass.vue'], resolve),
        },
      },
      {
        path: '/base/scheduleInit',
        name: 'KBGL_BASE',
        meta: {
          title: '课表管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          KBGL_BASE: (resolve) => require(['../views/pc/base/scheduleInit.vue'], resolve),
        },
      },
      {
        path: '/base/classroom',
        name: 'ROLE_base_classroom',
        meta: {
          title: '教室管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_base_classroom: (resolve) => require(['../views/pc/base/classroom.vue'], resolve),
        },
      },
      {
        path: '/base/teachingBuilding',
        name: 'ROLE_JCXXGL_LDGl',
        meta: {
          title: '楼栋管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_JCXXGL_LDGl: (resolve) => require(['../views/pc/base/teachingBuilding.vue'], resolve),
        },
      },
      {
        path: '/base/courseTime',
        name: 'JCGL_BASE',
        meta: {
          title: '节次管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          JCGL_BASE: (resolve) => require(['../views/pc/base/courseTime.vue'], resolve),
        },
      },
      {
        path: '/base/role',
        name: 'ROLE_authority',
        meta: {
          title: '权限管理',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_authority: (resolve) => require(['../views/pc/sys/role.vue'], resolve),
        },
      },
      {
        path: '/sys/sysParam',
        name: 'sysParam',
        meta: {
          title: '系统参数',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          sysParam: (resolve) => require(['../views/pc/sys/systemParam.vue'], resolve),
        },
      },
      {
        path: '/base/systemLog',
        name: 'ROLE_xtgl_xtrz',
        meta: {
          title: '操作日志',
          requireAuth: true,
          keepAlive: false, //需要缓存
        },
        components: {
          ROLE_xtgl_xtrz: (resolve) => require(['../views/pc/sys/systemLog.vue'], resolve),
        },
      },
    ],
  },
  // 移动端
  {
    path: '/mobileLogin',
    name: 'mobileLogin',
    meta: {
      title: '登陆',
      requireAuth: false,
      keepAlive: false,
    },
    component: () => import('../views/mobile/Login.vue'),
  },
  {
    path: '/mobileIndex',
    name: 'mobileIndex',
    meta: {
      title: '首页',
      requireAuth: true,
      keepAlive: false,
    },
    component: () => import('../views/mobile/Index.vue'),
    children: [],
  },
  {
    path: '*',
    name: '*',
    component: () => import('../views/pc/NotFound.vue'),
  },
];

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

const router = new VueRouter({
  mode: 'hash', // history
  routes,
});

export default router;

export function initDynamicRoutes() {}
