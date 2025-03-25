<template>
  <div class="container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">新增放映场次</span>
          <el-button
              type="primary"
              plain
              @click="$router.push('/index/screening/list')"
          >
            返回列表
          </el-button>
        </div>
      </template>

      <el-form
          :model="formData"
          :rules="formRules"
          ref="formRef"
          label-width="120px"
          label-position="top"
      >
        <!-- 影院选择 -->
        <el-form-item label="选择影院" prop="cid">
          <el-select
              v-model="formData.cid"
              placeholder="请选择影院"
              clearable
              @change="handleCinemaChange"
              style="width: 100%"
          >
            <el-option
                v-for="cinema in cinemaList"
                :key="cinema.cid"
                :label="cinema.cname"
                :value="cinema.cid"
            />
          </el-select>
        </el-form-item>

        <!-- 放映厅选择 -->
        <el-form-item label="选择放映厅" prop="srid">
          <el-select
              v-model="formData.srid"
              placeholder="请先选择影院"
              :disabled="!formData.cid"
              style="width: 100%"
          >
            <el-option
                v-for="room in screenroomList"
                :key="room.srid"
                :label="room.srname"
                :value="room.srid"
            />
          </el-select>
        </el-form-item>

        <!-- 电影选择 -->
        <el-form-item label="选择电影" prop="mid">
          <el-select
              v-model="formData.mid"
              placeholder="请选择正在上映的电影"
              style="width: 100%"
              @change="handleMovieChange"
          >
            <el-option
                v-for="movie in movieList"
                :key="movie.mid"
                :label="movie.mname"
                :value="movie.mid"
            />
          </el-select>
        </el-form-item>

        <!-- 日期选择 -->
        <el-form-item label="放映日期" prop="sday">
          <el-date-picker
              v-model="formData.sday"
              type="date"
              placeholder="选择放映日期"
              value-format="YYYY-MM-DD"
              :disabled="!formData.mid"
              :disabled-date="disabledDate"
              style="width: 100%"
          />
        </el-form-item>

        <!-- 时间段选择 -->
        <el-form-item label="放映时段" prop="stime">
          <el-radio-group
              v-model="formData.stime"
              :disabled="!formData.srid || !formData.sday"
          >
            <el-radio
                v-for="time in timeSlots"
                :key="time.value"
                :label="time.value"
                :disabled="isTimeDisabled(time.value)"
            >
              {{ time.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 价格输入 -->
        <el-form-item label="场次价格" prop="sprice">
          <el-input-number
              v-model="formData.sprice"
              :min="0"
              :max="200"
              :precision="2"
              :step="10"
              controls-position="right"
              style="width: 200px"
          />
          <span class="price-suffix">元</span>
        </el-form-item>

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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import type {ScreeningVO, Cinema, Movie, Screening} from '../../type'
import { addScreening } from '../../api/screening'
import { listAllCinema } from '../../api/cinema'
import { listScreenroomByCid } from '../../api/screenroom'
import { listMovieUpCast } from '../../api/movie'
import Decimal from "decimal.js";

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive<ScreeningVO>({
  mid: '',
  srid: '',
  sday: null,
  stime: '',
  sprice: 20.99
})

// 预定义时间段
const timeSlots = [
  { label: '07:00 - 09:00', value: '07:00-09:00' },
  { label: '10:00 - 12:00', value: '10:00-12:00' },
  { label: '13:00 - 15:00', value: '13:00-15:00' },
  { label: '16:00 - 18:00', value: '16:00-18:00' },
  { label: '19:00 - 21:00', value: '19:00-21:00' }
]

// 数据列表
const cinemaList = ref<Cinema[]>([])
const screenroomList = ref<any[]>([])
const movieList = ref<Movie[]>([])
const occupiedTimes = ref<string[]>([])

// 表单验证规则
const formRules = reactive<FormRules<Screening>>({
  srid: [{ required: true, message: '请选择放映厅', trigger: 'change' }],
  mid: [{ required: true, message: '请选择电影', trigger: 'change' }],
  sday: [{ required: true, message: '请选择放映日期', trigger: 'change' }],
  stime: [{ required: true, message: '请选择放映时段', trigger: 'change' }],
  sprice: [
    {
      required: true,
      message: '请输入价格',
      trigger: 'blur',
      validator: (_, value, callback) => {
        // 处理 Decimal 类型验证
        const decimalValue = new Decimal(value || 0)
        if (decimalValue.lessThan(0.01)) {
          callback(new Error('价格不能低于0.01元'))
        } else {
          callback()
        }
      }
    },
    // 保留数字类型基础验证
    {
      type: 'number',
      message: '请输入有效的数字',
      trigger: 'blur',
      transform: (value) => {
        try {
          return new Decimal(value).toNumber()
        } catch {
          return NaN
        }
      }
    }
  ]
})


onMounted(async () => {
  // 加载影院和电影数据
  try {
    const [cinemas, movies] = await Promise.all([
      listAllCinema(),
      listMovieUpCast() // 获取上映中的电影
    ])
    cinemaList.value = cinemas || []
    movieList.value = movies || []
  } catch (error) {
    ElMessage.error('数据加载失败')
  }
})

// 影院变化处理
const handleCinemaChange = async (cid: string) => {
  if (cid) {
    try {
      const res = await listScreenroomByCid(cid)
      screenroomList.value = res || []
      formData.srid = ''
    } catch (error) {
      ElMessage.error('放映厅加载失败')
    }
  }
}

// 电影变化处理
const handleMovieChange = (mid: string) => {
  const selectedMovie = movieList.value.find(m => m.mid === mid)
  if (selectedMovie) {
    formData.sday = null // 重置日期选择
  }
}

// 禁用日期
const disabledDate = (date: Date) => {
  const selectedMovie = movieList.value.find(m => m.mid === formData.mid)
  if (!selectedMovie) return true

  const day = date.getTime()
  const start = new Date(selectedMovie.mstarttime).getTime()
  const end = new Date(selectedMovie.mendtime).getTime()

  return day < start || day > end
}

// 检查时间段是否可用
const isTimeDisabled = (time: string) => {
  return occupiedTimes.value.includes(time)
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  submitting.value = true

  try {
    await addScreening(formData)
    ElMessage.success('场次添加成功')
    router.push('/admin/screening/list')
  } catch (error) {
    ElMessage.error('添加失败: ' + (error as Error).message)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  screenroomList.value = []
  occupiedTimes.value = []
}
</script>

<style scoped>
/* 复用之前的样式 */
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

.el-radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.el-radio {
  margin-right: 20px;
}

.price-suffix {
  margin-left: 10px;
  color: #606266;
}

@media (max-width: 768px) {
  .form-card {
    margin: 12px;
  }

  .el-button {
    width: 100%;
    margin-bottom: 12px;
  }
}
</style>
