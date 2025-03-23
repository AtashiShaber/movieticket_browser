<template>
  <div class="container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">新增影院信息</span>
          <el-button
              type="primary"
              plain
              @click="$router.push('/index/cinema/list')"
          >
            返回列表
          </el-button>
        </div>
      </template>

      <el-form
          :model="formData"
          :rules="formRules"
          ref="formRef"
          label-width="100px"
          label-position="top"
      >
        <el-form-item label="影院名称" prop="cname">
          <el-input
              v-model="formData.cname"
              placeholder="请输入影院全称"
              clearable
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="影院地址" prop="caddress">
              <el-input
                  v-model="formData.caddress"
                  placeholder="请输入详细地址"
                  clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="联系电话" prop="ccall">
              <el-input
                  v-model="formData.ccall"
                  placeholder="请输入联系电话"
                  clearable
              >
                <template #append>
                  <div class="form-tip">格式：区号-号码</div>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              @click="submitForm"
              :loading="submitting"
          >
            提交新增
          </el-button>
          <el-button
              size="large"
              @click="resetForm"
          >
            重置表单
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import type { CinemaVO } from '../../type'
import { addCinema } from '../../api/cinema'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const formData = reactive<CinemaVO>({
  cname: '',
  caddress: '',
  ccall: ''
})

// 表单验证规则
const formRules = reactive<FormRules<CinemaVO>>({
  cname: [
    { required: true, message: '影院名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '长度需在2-50个字符之间', trigger: 'blur' }
  ],
  caddress: [
    { required: true, message: '请填写详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '地址长度需在5-100个字符之间', trigger: 'blur' }
  ],
  ccall: [
    { required: true, message: '请填写联系电话', trigger: 'blur' },
    {
      pattern: /^\d{3,4}-\d{7,8}$/,
      message: '格式示例：028-12345678',
      trigger: 'blur'
    }
  ]
})

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  submitting.value = true
  addCinema(formData).then(() => {
    ElMessage.success('影院新增成功')
    router.push('/index/cinema/list')
  }).catch((error) => {
    ElMessage.error(error.message || '提交失败')
  }).finally(() => {
    submitting.value = false
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped>
/* 保持原有样式不变 */
.container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.form-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-form--label-top) .el-form-item__label {
  padding-bottom: 8px;
  font-weight: 500;
  color: #606266;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  padding: 0 8px;
}

.el-button {
  margin-top: 16px;
  min-width: 120px;
}

@media (max-width: 768px) {
  .form-card {
    margin: 12px;
  }

  .el-col {
    width: 100%;
    margin-bottom: 16px;
  }

  .el-button {
    width: 100%;
    margin-bottom: 12px;
  }
}
</style>
