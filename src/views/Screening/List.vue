<template>
  <div class="container">
    <div class="card">
      <!-- 搜索表单 -->
      <div class="search-wrapper">
        <el-form :model="queryParams" inline class="search-form">
          <el-row :gutter="16">
            <el-col :span="5">
              <el-form-item label="电影名称">
                <el-input
                    v-model="queryParams.mname"
                    placeholder="输入电影名称"
                    clearable
                    @blur="handleSearch"
                />
              </el-form-item>
            </el-col>

            <el-col :span="5">
              <el-form-item label="放映厅">
                <el-input
                    v-model="queryParams.srname"
                    placeholder="输入放映厅名称"
                    clearable
                    @blur="handleSearch"
                />
              </el-form-item>
            </el-col>

            <el-col :span="5">
              <el-form-item label="影院名称">
                <el-input
                    v-model="queryParams.cname"
                    placeholder="输入影院名称"
                    clearable
                    @blur="handleSearch"
                />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="放映日期">
                <el-date-picker
                    v-model="queryParams.sday"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                    @change="handleSearch"
                />
              </el-form-item>
            </el-col>

            <el-col :span="3">
              <el-form-item>
                <el-button @click="resetSearch">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table
          :data="screeningData.list"
          border
          stripe
          v-loading="loading"
          style="width: 100%"
      >
        <el-table-column
            prop="mname"
            label="电影名称"
            min-width="180"
            header-align="center"
            align="center"
        />

        <el-table-column
            prop="cname"
            label="所属影院"
            min-width="150"
            header-align="center"
            align="center"
        />

        <el-table-column
            prop="srname"
            label="放映厅"
            min-width="120"
            header-align="center"
            align="center"
        />

        <el-table-column
            label="放映日期"
            min-width="120"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">{{ row.sday }}</template>
        </el-table-column>

        <el-table-column
            prop="stime"
            label="放映时段"
            min-width="150"
            header-align="center"
            align="center"
        />

        <el-table-column
            label="票价"
            min-width="100"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">￥{{ formatPrice(row.sprice) }}</template>
        </el-table-column>

        <el-table-column
            label="操作"
            width="200"
            header-align="center"
            align="center"
            fixed="right"
        >
          <template #default="{ row }">
            <div class="action-group">
              <el-button type="primary" size="small" @click="handleEdit(row)"
              >编辑</el-button
              >
              <el-button type="danger" size="small" @click="handleDelete(row.sid)"
              >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="screeningData.total"
          :page-sizes="[10, 20, 30]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination"
      />

      <!-- 编辑对话框 -->
      <el-dialog
          v-model="editDialogVisible"
          title="编辑放映场次"
          width="800px"
          @closed="handleDialogClose"
      >
        <el-form
            :model="formData"
            :rules="formRules"
            ref="editFormRef"
            label-width="100px"
        >
          <el-form-item label="电影" prop="mid">
<!--            在电影选择器添加change事件-->
            <el-select
                v-model="formData.mid"
                @change="handleMovieChange"
                placeholder="选择电影"
                filterable
                style="width: 100%"
            >
              <!-- options -->
              <el-option
                  v-for="movie in movieList"
                  :key="movie.mid"
                  :label="movie.mname"
                  :value="movie.mid"
              />
            </el-select>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="影院" prop="cid">
                <el-select
                    v-model="formData.cid"
                    placeholder="选择影院"
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
            </el-col>
            <el-col :span="12">
              <el-form-item label="放映厅" prop="srid">
                <el-select
                    v-model="formData.srid"
                    placeholder="选择放映厅"
                    :disabled="!formData.cid"
                    :aria-selected="formData.srid"
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
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="放映日期" prop="sday">
                <el-date-picker
                    v-model="formData.sday"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                    :disabled-date="disabledDate"
                    @change="updateAvailableTimes"
                    style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="放映时段" prop="stime">
                <el-select
                    v-model="formData.stime"
                    placeholder="选择时段"
                    style="width: 100%"
                >
                  <el-option
                      v-for="time in availableTimes"
                      :key="time.value"
                      :label="time.label"
                      :value="time.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="场次价格" prop="sprice">
            <el-input-number
                v-model="formData.sprice"
                :min="0.01"
                :max="200"
                :precision="2"
                controls-position="right"
                style="width: 200px"
            />
            <span class="price-suffix">元</span>
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitEdit">
            保存修改
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  listScreening,
  deleteScreening,
  updateScreening, listScreeningByCid,
} from '../../api/screening'
import { listScreenroomByCid } from '../../api/screenroom'
import { listAllCinema } from '../../api/cinema'
import { listMovieUpCast } from '../../api/movie'
import type {
  ScreeningDto,
  Cinema,
  Movie,
  ScreenroomDto,
  ScreeningPageQueryVO, ScreeningVO,
} from '../../type'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'
import isBetween from "dayjs/plugin/isBetween";

// 数据状态
const loading = ref(false)
const submitting = ref(false)
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()

// 查询参数
const queryParams = reactive<ScreeningPageQueryVO>({
  pageNum: 1,
  pageSize: 10,
  mname: '',
  srname: '',
  cname: '',
  sday: undefined,
})

// 表格数据
const screeningData = reactive<{
  list: ScreeningDto[]
  total: number
}>({
  list: [],
  total: 0,
})

// 表单数据
const formData = reactive({
  sid: '',
  mid: '',
  cid: '',
  srid: '',
  sday: '',
  stime: '',
  sprice: 0,
})

// 格式化价格
const formatPrice = (price: Decimal) => {
  return new Decimal(price).toDecimalPlaces(2).toString()
}

// 选项数据
const cinemaList = ref<Cinema[]>([])
const movieList = ref<Movie[]>([])
const screenroomList = ref<ScreenroomDto[]>([])
const availableTimes = ref<Array<{ value: string; label: string }>>([])

const timeOptions = [
  { label: '07:00-09:00', value: '07:00-09:00' },
  { label: '10:00-12:00', value: '10:00-12:00' },
  { label: '13:00-15:00', value: '13:00-15:00' },
  { label: '16:00-18:00', value: '16:00-18:00' },
  { label: '19:00-21:00', value: '19:00-21:00' },
]

// 表单验证规则
const formRules = reactive<FormRules<typeof formData>>({
  mid: [{ required: true, message: '请选择电影', trigger: 'change' }],
  cid: [{ required: true, message: '请选择影院', trigger: 'change' }],
  srid: [{ required: true, message: '请选择放映厅', trigger: 'change' }],
  sday: [
    { required: true, message: '请选择日期', trigger: 'change' },
    {
      validator: (_, value, callback) => {
        if (dayjs(value).isBefore(dayjs(), 'day')) {
          callback(new Error('不能选择过去的日期'))
        } else {
          callback()
        }
      },
    },
  ],
  stime: [
    { required: true, message: '请选择时段', trigger: 'change' },
    {
      validator: (_, value, callback) => {
        if (!availableTimes.value.some(t => t.value === value)) {
          callback(new Error('该时段不可用'))
        } else {
          callback()
        }
      },
    },
  ],
  sprice: [
    {
      required: true,
      message: '请输入价格',
      trigger: 'blur',
      validator: (_, value, callback) => {
        const decimalValue = new Decimal(value || 0)
        if (decimalValue.lessThan(0.01)) {
          callback(new Error('价格不能低于0.01元'))
        } else {
          callback()
        }
      },
    },
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
      },
    },
  ],
})

// 初始化加载
onMounted(async () => {
  await Promise.all([loadScreenings(), loadBasicData()])
})

// 加载基础数据
const loadBasicData = async () => {
  try {
    const [cinemaRes, movieRes] = await Promise.all([
      listAllCinema(),
      listMovieUpCast(),
    ])
    cinemaList.value = cinemaRes || []
    movieList.value = movieRes || []
  } catch (error) {
    ElMessage.error('基础数据加载失败')
  }
}

// 加载放映列表
const loadScreenings = async () => {
  try {
    loading.value = true
    const params = {
      ...queryParams,
      sday: queryParams.sday ? dayjs(queryParams.sday).toDate() : undefined,
    }
    const res = await listScreening(params)
    screeningData.list = res.list || []
    screeningData.total = res.total || 0
  } catch (error) {
    ElMessage.error('加载放映列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  queryParams.pageNum = 1
  loadScreenings()
}

// 重置搜索
const resetSearch = () => {
  queryParams.pageNum = 1
  queryParams.mname = ''
  queryParams.srname = ''
  queryParams.cname = ''
  queryParams.sday = undefined
  loadScreenings()
}

// 分页处理
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  loadScreenings()
}

const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  loadScreenings()
}

// 更新可用时间段
const updateAvailableTimes = async () => {
  if (formData.cid && formData.srid && formData.sday) {
    try {
      const screeningVO: ScreeningVO = {
        mid: '',
        srid: formData.srid,
        sday: new Date(formData.sday),
        stime: '',
        sprice: 0
      }
      const res = await listScreeningByCid(screeningVO)
      const occupiedTimes = new Set(res.map((item: any) => item.stime))
      availableTimes.value = timeOptions.filter(
          t => !occupiedTimes.has(t.value) || t.value === formData.stime
      )
    } catch (error) {
      console.error('获取时间段失败:', error)
      availableTimes.value = [...timeOptions]
    }
  } else {
    availableTimes.value = [...timeOptions]
  }
}

// 修改handleEdit方法
const handleEdit = async (row: ScreeningDto) => {
  Object.assign(formData, {
    sid: row.sid,
    mid: row.mid,
    cid: row.cid,
    srid: row.srid,
    sday: dayjs(row.sday).format('YYYY-MM-DD'),
    stime: row.stime,
    sprice: new Decimal(row.sprice).toNumber(),
  })

  try {
    if (formData.cid) {
      // 等待放映厅加载完成
      await handleCinemaChange(formData.cid)
      // 等待DOM更新
      await nextTick()
      // 设置默认选中
      formData.srid = row.srid
    }
    await updateAvailableTimes()
    editDialogVisible.value = true
  } catch (error) {
    ElMessage.error('初始化编辑数据失败')
  }
}

// 修改handleCinemaChange方法
const handleCinemaChange = async (cid: string) => {
  screenroomList.value = []
  formData.srid = ''
  if (cid) {
    try {
      const res = await listScreenroomByCid(cid)
      screenroomList.value = res || []
      // 确保数据响应式更新
      await nextTick()
    } catch (error) {
      ElMessage.error('加载放映厅失败')
    }
  }
}

// 提交修改
const submitEdit = async () => {
  try {
    await editFormRef.value?.validate()
    submitting.value = true

    const params = {
      sid: formData.sid,
      mid: formData.mid,
      srid: formData.srid,
      sday: new Date(formData.sday),
      stime: formData.stime,
      sprice: new Decimal(formData.sprice),
    }

    await updateScreening(params)
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    loadScreenings()
  } catch (error) {
    console.error('修改失败:', error)
  } finally {
    submitting.value = false
  }
}

// 删除操作
const handleDelete = async (sid: string) => {
  await ElMessageBox.confirm('确定删除该场次吗？', '警告', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'warning',
  })

  deleteScreening(sid).then(() => {
    ElMessage.success('删除成功')
    loadScreenings()
  }).catch((error) => {
    ElMessage.error(error)
  })
}

// 扩展dayjs功能
dayjs.extend(isBetween)

const disabledDate = (date: Date) => {
  const today = dayjs().startOf('day') // 当天零点
  const currentDate = dayjs(date).startOf('day')

  // 1. 强制禁用所有历史日期
  if (currentDate.isBefore(today)) return true

  // 2. 当选择电影时校验上映周期
  if (formData.mid) {
    const selectedMovie = movieList.value.find(m => m.mid === formData.mid)
    if (selectedMovie?.mstarttime && selectedMovie?.mendtime) {
      const releaseStart = dayjs(selectedMovie.mstarttime).startOf('day')
      const releaseEnd = dayjs(selectedMovie.mendtime).startOf('day')

      // 返回true表示禁用（日期不在上映周期内）
      return !currentDate.isBetween(releaseStart, releaseEnd, 'day', '[]')
    }

    // 如果电影没有上映周期数据，禁用所有日期
    return true
  }

  // 没有选择电影时允许选择今天及之后的日期
  return false
}

// 添加电影切换处理
const handleMovieChange = (mid: string) => {
  // 清除已选日期和时段
  formData.sday = ''
  formData.stime = ''
  availableTimes.value = [...timeOptions]
}

// 关闭对话框重置表单
const handleDialogClose = () => {
  editFormRef.value?.resetFields()
  availableTimes.value = []
}
</script>

<style scoped>
.container {
  padding: 24px;
  max-width: 1500px;
  margin: 0 auto;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.search-wrapper {
  margin-bottom: 24px;

  .el-form-item {
    margin-bottom: 0;
  }

  .el-row {
    align-items: center;
  }

  .el-col {
    margin-bottom: 12px;
  }
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.price-suffix {
  margin-left: 10px;
  color: #666;
}

:deep(.el-dialog) {
  .el-form-item__content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .search-wrapper .el-col {
    width: 100%;
    margin-bottom: 8px;
  }

  :deep(.el-table) {
    .el-table__cell:nth-child(2),
    .el-table__cell:nth-child(3) {
      display: none;
    }
  }
}
</style>
