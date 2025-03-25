<template>
  <div class="full-container">
    <el-container class="layout-container">
      <!-- 头部导航 -->
      <el-header class="header">
        <div class="header-content">
          <router-link to="/" class="logo">
            <span class="title">银河影城</span>
          </router-link>

          <el-menu
              mode="horizontal"
              :default-active="$route.path"
              class="nav-menu"
              router
          >
            <el-menu-item index="/index/main">首页</el-menu-item>
            <el-menu-item index="/index/hot">正在热映</el-menu-item>
            <el-menu-item index="/index/cinemas">加盟影院</el-menu-item>
          </el-menu>

          <div class="header-right">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" :src="userStore" />
                <span class="username">{{ uname }}</span>
                <el-icon><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <router-link to="/index/userinfo">个人中心</router-link>
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore } from '../store'
import {autoDownAndUpCast} from "../api/movie.ts";
import { onMounted } from "vue";
import {ElMessage} from "element-plus";
import {autoUseTicket} from "../api/ticket.ts";

const userStore = useUserStore()

const uname = userStore.getUserName || localStorage.getItem('uname')

const handleLogout = () => {
  // 退出登录逻辑
  // 删除当前登录用户的token
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('uname')
  ElMessage.success('退出登录')
  setTimeout(function () {
    location.assign('/')
  }, 500)
}

// 静默执行自动更新
onMounted(async () => {
  await autoDownAndUpCast()
  await autoUseTicket()
})
</script>

<style scoped lang="scss">
/* 基础布局重置 */
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.full-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(45deg, #f8fafc 0%, #f0f5ff 100%);
}

.layout-container {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;

  /* 导航栏样式 - 渐变紫 */
  .header {
    width: 100%;
    height: 68px;
    background: linear-gradient(135deg, #9B5DE5 0%, #F15BB5 100%);
    box-shadow: 0 4px 20px rgba(155, 93, 229, 0.2);
    padding: 0;
    flex-shrink: 0;

    .header-content {
      display: flex;
      align-items: center;
      height: 100%;
      width: 100%;
      padding: 0 24px;
      margin: 0 auto;

      .logo {
        margin-right: 40px;
        .title {
          font-size: 26px;
          color: #fff;
          font-weight: 700;
          letter-spacing: 1px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }
      }

      /* 导航菜单样式 */
      .nav-menu {
        flex: 1;
        background: transparent;
        border-bottom: none;

        :deep(.el-menu-item) {
          height: 68px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 0 8px;
          border-radius: 8px;

          &.is-active {
            color: #FF9F1C !important;
            background: rgba(255, 255, 255, 0.15) !important;
            transform: translateY(-2px);
          }

          &:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            transform: translateY(-2px);
          }
        }
      }

      /* 用户信息区域 */
      .header-right {
        margin-right: 60px;
        .user-info {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border-radius: 24px;
          transition: all 0.3s;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);

          &:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: scale(1.05);
          }

          .username {
            margin: 0 12px;
            color: #fff;
            font-size: 14px;
            font-weight: 500;
          }

          .el-icon {
            color: rgba(255, 255, 255, 0.9);
            transition: transform 0.3s;
          }

          &:hover .el-icon {
            transform: rotate(180deg);
          }
        }
      }
    }
  }

  /* 主内容区 */
  .main-content {
    flex: 1;
    min-height: 0;
    padding: 0;
    display: flex;
    background: #f8f9fa; /* 浅灰背景 */

    .content-wrapper {
      flex: 1;
      overflow: auto;
      width: 100%;
      padding: 32px;
      max-width: 1440px;
      margin: 0 auto;
    }
  }
}

/* 动态过渡动画 */
.fade-transform-enter-active {
  animation: slideIn 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.fade-transform-leave-active {
  animation: slideOut 0.3s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(40px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-40px) scale(0.98);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header {
    height: 60px !important;

    .header-content {
      padding: 0 16px !important;

      .logo .title {
        font-size: 22px !important;
      }

      .nav-menu :deep(.el-menu-item) {
        height: 60px !important;
        font-size: 14px !important;
        margin: 0 4px !important;
        padding: 0 12px !important;
      }

      .user-info {
        padding: 6px 12px !important;
        .username {
          display: none;
        }
      }
    }
  }

  .content-wrapper {
    padding: 16px !important;
  }
}

@media (max-width: 480px) {
  .header-content {
    .nav-menu :deep(.el-menu-item) {
      padding: 0 8px !important;
      font-size: 13px !important;
    }

    .user-info {
      padding: 4px 8px !important;
    }
  }
}
</style>
