<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <div class="header-left">
          <span class="title">后台管理系统</span>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-avatar :size="32"
                         src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">{{ adminName }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <RouterLink to="/admin/user/info">个人中心</RouterLink>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-container class="main-wrapper">
      <el-aside width="200px" class="sidebar">
        <el-menu
            router
            :default-active="$route.path"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            class="menu-container"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-sub-menu index="user">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/admin/user/list">用户列表</el-menu-item>
            <el-menu-item index="/admin/user/add">新增用户</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="movie">
            <template #title>
              <el-icon><VideoCamera /></el-icon>
              <span>电影管理</span>
            </template>
            <el-menu-item index="/admin/movie/list">电影列表</el-menu-item>
            <el-menu-item index="/admin/movie/add">新增电影</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="cinema">
            <template #title>
              <el-icon><OfficeBuilding /></el-icon>
              <span>影院管理</span>
            </template>
            <el-menu-item index="/admin/cinema/list">影院列表</el-menu-item>
            <el-menu-item index="/admin/cinema/add">新增影院</el-menu-item>
            <el-menu-item index="/admin/cinema/screenroom">放映厅管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="screening">
            <template #title>
              <el-icon><Clock /></el-icon>
              <span>放映管理</span>
            </template>
            <el-menu-item index="/admin/screening/list">放映列表</el-menu-item>
            <el-menu-item index="/admin/screening/add">新增放映</el-menu-item>
          </el-sub-menu>

<!--          &lt;!&ndash; 财务管理 &ndash;&gt;-->
<!--          <el-sub-menu index="order">-->
<!--            <template #title>-->
<!--              <el-icon><Document /></el-icon>-->
<!--              <span>财务管理</span>-->
<!--            </template>-->
<!--            <el-menu-item index="/index/order/count">销售统计</el-menu-item>-->
<!--            <el-menu-item index="/index/ticket/count">票务统计</el-menu-item>-->
<!--          </el-sub-menu>-->
        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import {
  House,
  User,
  VideoCamera,
  OfficeBuilding,
  Clock,
  ArrowDown
} from '@element-plus/icons-vue'
import { useAdminStore } from '../store'
import {autoDownAndUpCast} from "../api/movie.ts";
import { onMounted } from "vue";
import {ElMessage} from "element-plus";

const adminStore = useAdminStore()

const adminName = adminStore.getAdminName || localStorage.getItem('adminName')

const handleLogout = () => {
  // 退出登录逻辑
  // 删除当前登录用户的token
  localStorage.removeItem('adminToken')
  localStorage.removeItem('admin')
  localStorage.removeItem('adminName')
  ElMessage.success('退出登录')
  setTimeout(function () {
    location.assign('/')
  }, 500)
}

// 静默执行自动更新
onMounted(async () => {
  autoDownAndUpCast().then().catch((error) => {
    console.log(error)
  })
})
</script>

<style scoped>
/* 修复布局的核心样式 */
.layout-container {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
}

.header {
  height: 60px !important;
  background: #5ac3c3;
  padding: 0;
  flex-shrink: 0;
}

.main-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 180px !important;
  flex-shrink: 0;
  background: #859ca8;
  overflow: hidden;
}

.menu-container {
  height: 100%;
  border-right: none;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: #f5f7fa;
}

/* 原有样式优化 */
.header-content {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.username {
  font-size: 16px;
}

.el-menu-item,
.el-sub-menu__title {
  height: 48px;
  line-height: 48px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05) !important;
  }

  &.is-active {
    background-color: rgba(255, 208, 75, 0.1) !important;
  }
}

.el-icon {
  font-size: 18px;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px !important;

    .el-menu-item span,
    .el-sub-menu__title span {
      display: none;
    }

    .el-icon {
      margin-right: 0;
    }
  }
}
</style>
