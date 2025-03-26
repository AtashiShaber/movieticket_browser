<template>
  <div class="login-container">
    <el-card class="login-card">
      <h1 class="login-title">用户注册</h1>
      <el-form :model="registerForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="registerForm.uname" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="registerForm.upwd" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="registerForm.uphone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister">注册</el-button>
          <el-button type="info" @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-link href="/login">已有账号？立即登录</el-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus"
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { register } from "../api/user.ts"

const router = useRouter();

// 注册表单数据
const registerForm = reactive({
  uname: '',
  upwd: '',
  uphone: ''
})

// 处理注册
const handleRegister = () => {
  if (!registerForm.uname || !registerForm.upwd || !registerForm.uphone) {
    ElMessage.error("请填写完整注册信息！");
    return;
  }

  // 简单的手机号格式验证
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(registerForm.uphone)) {
    ElMessage.error("请输入有效的手机号码！");
    return;
  }

  register(registerForm).then(() => {
    ElMessage.success("注册成功，请登录");
    router.push('/login');
  }).catch((error) => {
    ElMessage.error(error)
  });
}

// 重置表单
const handleReset = () => {
  registerForm.uname = ''
  registerForm.upwd = ''
  registerForm.uphone = ''
}
</script>

<style scoped>
/* 保持与登录页面一致的样式 */
.login-container {
  position: fixed;
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
  background-attachment: fixed;
  z-index: 0;
  overflow: hidden;
}

.login-card {
  width: 400px;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
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

.el-form-item:last-child {
  margin-bottom: 0;
  display: flex;
  justify-content: space-between;
}

@media (max-width: 480px) {
  .login-card {
    width: 90%;
    margin: 0 5%;
  }
}
</style>