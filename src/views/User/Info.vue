<template>
  <div class="admin-profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息管理</span>
        </div>
      </template>

      <!-- 基本信息展示 -->
      <div v-loading="loading">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="管理员ID">{{ adminInfo.adminId }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ adminInfo.adminName }}</el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ adminInfo.phone }}
            <el-button type="text" @click="showPhoneDialog">修改</el-button>
          </el-descriptions-item>
        </el-descriptions>

        <div class="action-buttons">
          <el-button type="primary" @click="showPwdDialog">修改密码</el-button>
        </div>
      </div>
    </el-card>

    <!-- 修改密码对话框 -->
    <el-dialog
        v-model="pwdDialog.visible"
        title="修改密码"
        width="30%"
        @closed="resetPwdForm"
    >
      <el-form
          ref="pwdFormRef"
          :model="pwdForm"
          :rules="pwdRules"
          label-width="100px"
      >
        <el-form-item label="旧密码" prop="oldData">
          <el-input
              v-model="pwdForm.oldData"
              type="password"
              show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newData">
          <el-input
              v-model="pwdForm.newData"
              type="password"
              show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handlePwdSubmit">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 修改手机号对话框 -->
    <el-dialog
        v-model="phoneDialog.visible"
        title="修改手机号"
        width="30%"
        @closed="resetPhoneForm"
    >
      <el-form
          ref="phoneFormRef"
          :model="phoneForm"
          :rules="phoneRules"
          label-width="100px"
      >
        <el-form-item label="旧手机号" prop="oldData">
          <el-input v-model="phoneForm.oldData" />
        </el-form-item>
        <el-form-item label="新手机号" prop="newData">
          <el-input v-model="phoneForm.newData" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="phoneDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handlePhoneSubmit">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {basic, updatePhone, updatePwd} from '../../api/admin'
import type { AdminDto, updateVO } from '../../type'

// 管理员基本信息
const loading = ref(true)
const adminInfo = reactive<AdminDto>({
  adminId: '',
  adminName: '',
  phone: ''
})

// 密码修改相关
const pwdDialog = reactive({
  visible: false
})
const pwdFormRef = ref<FormInstance>()
const pwdForm = reactive<updateVO>({
  oldData: '',
  newData: ''
})
const pwdRules = reactive<FormRules>({
  oldData: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newData: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
})

// 手机号修改相关
const phoneDialog = reactive({
  visible: false
})
const phoneFormRef = ref<FormInstance>()
const phoneForm = reactive<updateVO>({
  oldData: '',
  newData: ''
})
const phoneRules = reactive<FormRules>({
  oldData: [
    { required: true, message: '请输入旧手机号', trigger: 'blur' }
  ],
  newData: [
    { required: true, message: '请输入新手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
})

// 生命周期钩子
onMounted(async () => {
  await fetchBasicInfo()
})

// 获取基本信息
const fetchBasicInfo = async () => {
  try {
    const res = await basic({} as updateVO) // 根据实际API调整参数
    Object.assign(adminInfo, res)
  } catch (error) {
    ElMessage.error('获取信息失败')
  } finally {
    loading.value = false
  }
}

// 密码修改逻辑
const showPwdDialog = () => {
  pwdDialog.visible = true
}

const resetPwdForm = () => {
  pwdFormRef.value?.resetFields()
}

const handlePwdSubmit = async () => {
  await pwdFormRef.value?.validate()
  updatePwd(pwdForm).then(() => {
    ElMessage.success('密码修改成功')
    pwdDialog.visible = false
    resetPwdForm()
    localStorage.removeItem('adminToken')
    setTimeout(function () {
      location.assign('/')
    },500)
  }).catch((error) => {
    ElMessage.error(error)
  })
}

// 手机号修改逻辑
const showPhoneDialog = () => {
  phoneDialog.visible = true
}

const resetPhoneForm = () => {
  phoneFormRef.value?.resetFields()
}

const handlePhoneSubmit = async () => {
  await phoneFormRef.value?.validate()
  // 更新成功删除当前登录信息
  updatePhone(phoneForm).then(() => {
    ElMessage.success('手机号修改成功')
    phoneDialog.visible = false
    resetPhoneForm()
    localStorage.removeItem('adminToken')
    setTimeout(function () {
      location.assign('/')
    },500)
  }).catch((error) => {
    ElMessage.error(error)
  })
}
</script>

<style scoped>
.admin-profile-container {
  max-width: 800px;
  margin: 20px auto;
}

.profile-card {
  margin: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.action-buttons {
  margin-top: 20px;
  text-align: center;
}

:deep(.el-descriptions__body) {
  background-color: #fafafa;
}

.el-button--text {
  margin-left: 10px;
}
</style>