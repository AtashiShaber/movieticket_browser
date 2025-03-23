<template>
  <div class="container">
    <el-card class="form-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="新增用户" name="user"></el-tab-pane>
        <el-tab-pane label="新增管理员" name="admin"></el-tab-pane>
      </el-tabs>

      <!-- 用户表单 -->
      <el-form
          v-if="activeTab === 'user'"
          ref="userFormRef"
          :model="userForm"
          :rules="userRules"
          label-width="120px"
      >
        <el-form-item label="用户名" prop="uname">
          <el-input v-model="userForm.uname" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码" prop="upwd">
          <el-input
              v-model="userForm.upwd"
              type="password"
              placeholder="请输入密码"
              show-password
          />
        </el-form-item>

        <el-form-item label="手机号" prop="uphone">
          <el-input v-model="userForm.uphone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>

      <!-- 管理员表单 -->
      <el-form
          v-else
          ref="adminFormRef"
          :model="adminForm"
          :rules="adminRules"
          label-width="120px"
      >
        <el-form-item label="管理员名称" prop="adminName">
          <el-input v-model="adminForm.adminName" placeholder="请输入管理员名称" />
        </el-form-item>

        <el-form-item label="密码" prop="adminPwd">
          <el-input
              v-model="adminForm.adminPwd"
              type="password"
              placeholder="请输入密码"
              show-password
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="adminForm.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>

      <div class="submit-btn">
        <el-button type="primary" @click="handleSubmit">
          {{ activeTab === 'user' ? '创建用户' : '创建管理员' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import {ElMessage, type FormInstance, type FormRules} from 'element-plus'
import type {AdminAddVO, UserAddVO} from "../../type";
import {register} from "../../api/user.ts";
import {adminRegister} from "../../api/admin.ts";

// 表单数据
const activeTab = ref<'user' | 'admin'>('user')
const userForm = reactive<UserAddVO>({
  uname: '',
  upwd: '',
  uphone: ''
})

const adminForm = reactive<AdminAddVO>({
  adminName: '',
  adminPwd: '',
  phone: ''
})

// 表单引用
const userFormRef = ref<FormInstance>()
const adminFormRef = ref<FormInstance>()

// 验证规则
const userRules = reactive<FormRules<UserAddVO>>({
  uname: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 2, max: 16, message: '长度在2到16个字符', trigger: 'blur' }
  ],
  upwd: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 18, message: '密码长度6-18位', trigger: 'blur' }
  ],
  uphone: [
    { required: true, message: '手机号不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
})

const adminRules = reactive<FormRules<AdminAddVO>>({
  adminName: [
    { required: true, message: '名称不能为空', trigger: 'blur' },
    { min: 2, max: 16, message: '长度在2到16个字符', trigger: 'blur' }
  ],
  adminPwd: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 18, message: '密码长度6-18位', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '手机号不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
})

// 切换选项卡
const handleTabChange = () => {
  if (userFormRef.value) userFormRef.value.resetFields()
  if (adminFormRef.value) adminFormRef.value.resetFields()
}

// 提交处理
const handleSubmit = async () => {
  const formRef = activeTab.value === 'user' ? userFormRef.value : adminFormRef.value
  if (!formRef) return

  try {
    await formRef.validate()
    // 这里调用提交API
    console.log('提交数据:', activeTab.value === 'user' ? userForm : adminForm)
    if (activeTab.value === 'user') {
      register(userForm).then(() => {
        ElMessage.success("注册成功！")
      }).catch(error => {
        ElMessage.error(error)
      })
    } else if (activeTab.value === 'admin') {
      adminRegister(adminForm).then(() => {
        ElMessage.success("注册成功！")
      }).catch(error => {
        ElMessage.error(error)
      })
    }
    // 提交成功后重置表单
    formRef.resetFields()
  } catch (error) {
    console.log('表单验证失败')
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
}

.form-card {
  max-width: 800px;
  margin: 0 auto;
}

.submit-btn {
  margin-top: 24px;
  text-align: center;
}

.el-input-number {
  width: 100%;
}
</style>
