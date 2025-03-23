<template>
  <div class="container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">新增电影信息</span>
          <el-button
              type="primary"
              plain
              @click="$router.push('/index/movie/list')"
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
        <el-form-item label="电影名称" prop="mname">
          <el-input
              v-model="formData.mname"
              placeholder="请输入电影全称"
              clearable
          />
        </el-form-item>

        <el-form-item label="电影简介" prop="mp">
          <el-input
              v-model="formData.mp"
              type="textarea"
              :rows="5"
              placeholder="请输入电影简介（50-500字）"
              show-word-limit
              maxlength="500"
              resize="vertical"
          />
        </el-form-item>

        <el-form-item label="主演信息" prop="mactor">
          <el-input
              v-model="formData.mactor"
              placeholder="请输入主演名单"
              clearable
          />
          <div class="form-tip">示例：张三;李四;王五</div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="上映时间" prop="mstarttime">
              <el-date-picker
                  v-model="formData.mstarttime"
                  type="date"
                  placeholder="选择上映日期"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disabledStartDate"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="下映时间" prop="mendtime">
              <el-date-picker
                  v-model="formData.mendtime"
                  type="date"
                  placeholder="选择下映日期"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disabledEndDate"
                  style="width: 100%"
              />
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
import type { MovieDto } from '../../type'
import { addMovie } from '../../api/movie'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const formData = reactive<MovieDto>({
  mname: '',
  mp: '',
  mactor: '',
  mstarttime: null,
  mendtime: null,
  mstatus: 0 // 默认状态
})

// 表单验证规则
const formRules = reactive<FormRules<MovieDto>>({
  mname: [
    { required: true, message: '电影名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '长度需在2-50个字符之间', trigger: 'blur' }
  ],
  mp: [
    { required: true, message: '请填写电影简介', trigger: 'blur' },
    { min: 50, message: '简介至少需要50个字符', trigger: 'blur' },
    { max: 500, message: '简介不能超过500个字符', trigger: 'blur' }
  ],
  mactor: [
    { required: true, message: '请填写主演信息', trigger: 'blur' },
  ],
  mstarttime: [
    { required: true, message: '请选择上映日期', trigger: 'change' }
  ],
  mendtime: [
    { required: true, message: '请选择下映日期', trigger: 'change' },
    {
      validator: (_, value, callback) => {
        if (formData.mstarttime && value < formData.mstarttime) {
          callback(new Error('下映时间不能早于上映时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

// 禁用早于今天的上映日期
const disabledStartDate = (time: Date) => {
  return time < new Date(new Date().setHours(0, 0, 0, 0))
}

// 禁用早于开始时间的下映日期
const disabledEndDate = (time: Date) => {
  return formData.mstarttime
      ? time < new Date(formData.mstarttime)
      : false
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  submitting.value = true
  addMovie(formData).then(() => {
    ElMessage.success('电影新增成功')
    router.push('/index/movie/list')
  }).catch((error) => {
    ElMessage.error(error)
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
  margin-top: 4px;
}

:deep(.el-textarea) {
  .el-textarea__inner {
    line-height: 1.6;
    font-size: 14px;
    resize: vertical;
    min-height: 120px;
    padding: 12px;
  }

  .el-input__count {
    background: transparent;
    bottom: 5px;
    right: 10px;
  }
}

:deep(.el-date-editor) {
  width: 100%;
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
