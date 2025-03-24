<template>
  <div class="login-container">
    <el-card class="login-card">
      <h1 class="login-title">登录</h1>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="loginForm.uphone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.upwd" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-select v-model="value" class="m-2" placeholder="Select" size="large">
            <el-option
                v-for="item in role"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin">登录</el-button>
          <el-button type="info" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus"
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore,useAdminStore } from "../store"
import { login } from "../api/user.ts"
import { adminLogin } from "../api/admin.ts"
import { ref } from 'vue'
import type {AdminLoginVO, UserLoginVO} from "../type";

const value = ref(0)

const router = useRouter();
const userStore = useUserStore();
const adminStore = useAdminStore()

//默认的loginForm为空
const loginForm = reactive<UserLoginVO>({
  uphone: '',
  upwd: ''
})

const adminLoginForm: AdminLoginVO = {
  phone: '',
  adminPwd: ''
}

// 设置登录用户等级
const role = [
  {
    value: 0,
    label: '普通用户'
  },
  {
    value: 1,
    label: '管理员'
  }
]

const handleLogin = () => {
  if (!loginForm.uphone || !loginForm.upwd) {
    ElMessage.error("手机号密码为空！");
    return; // 添加return防止后续执行
  }

  if (value.value == 0) {
    login(loginForm).then((resp) => {
      // 核心修改点：解构后端返回的AuthResponse
      const { userDto, uuid } = resp;
      console.log(userDto)
      console.log(uuid)
      localStorage.setItem('token', uuid);
      // 清除当前的管理员登录
      localStorage.removeItem('adminToken')
      userStore.setUser(userDto);
      router.push('/index');
    }).catch((error) => {
      ElMessage.error(error)
    });
  } else {
    const adminForm = {
      phone: loginForm.uphone,
      adminPwd: loginForm.upwd
    };

    adminLogin(adminForm).then((resp) => {
      const { adminDto, uuid } = resp;
      localStorage.setItem('adminToken', uuid);
      // 删除当前的用户登录
      localStorage.removeItem('token')
      adminStore.setAdmin(adminDto);
      router.push('/admin');
    }).catch((error) => {
      ElMessage.error(error)
    });
  }
}


// 重置数据
const  handleReset = () => {
  loginForm.uphone = ''
  loginForm.upwd = ''
  adminLoginForm.phone = ''
  adminLoginForm.adminPwd = ''
  value.value = 0
}
</script>


<style scoped>
/* 新增全局样式重置 */
:deep(body) {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

.login-container {
  position: fixed;  /* 使用 fixed 定位确保覆盖整个屏幕 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('../assets/illust_119880925_20240805_194629.png'),rgba(0, 0, 0, 0.3);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* 保持背景固定 */
  z-index: 0;
  overflow: hidden; /* 防止出现滚动条 */
}

.login-card {
  width: 400px;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px); /* 毛玻璃效果 */
  background-color: rgba(255, 255, 255, 0.95); /* 更透明的背景 */
  position: relative;
  z-index: 1;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 500;
}

/* 优化按钮间距 */
.el-form-item:last-child {
  margin-bottom: 0;
  display: flex;
  justify-content: space-between;
}

/* 响应式适配 */
@media (max-width: 480px) {
  .login-card {
    width: 90%;
    margin: 0 5%;
  }
}
</style>
