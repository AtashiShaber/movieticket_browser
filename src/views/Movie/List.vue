<template>
  <div class="container">
    <div class="card">
      <!-- 优化后的搜索表单 -->
      <div class="search-wrapper">
        <el-form :model="queryParams" inline class="search-form">
          <el-form-item label="电影名称" class="search-item">
            <el-input
                v-model="queryParams.mname"
                placeholder="输入电影名称"
                clearable
                @change="handleSearch"
            />
          </el-form-item>

          <el-form-item label="主演" class="search-item">
            <el-input
                v-model="queryParams.mactor"
                placeholder="输入主演姓名"
                clearable
                @change="handleSearch"
            />
          </el-form-item>

          <el-form-item label="状态" class="search-item">
            <el-select
                v-model="queryParams.mstatus"
                placeholder="全部状态"
                clearable
                @change="handleSearch"
                @clear="handleStatusClear"
                style="width: 120px"
            >
              <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="上映时间" class="search-item">
            <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                @change="handleDateChange"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 优化后的电影表格 -->
      <el-table
          :data="movieData.list"
          border
          stripe
          v-loading="loading"
          header-row-class-name="table-header"
          style="width: 100%"
      >
        <el-table-column
            prop="mid"
            label="电影ID"
            min-width="250"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">
            <span class="id-cell">{{ row.mid }}</span>
          </template>
        </el-table-column>

        <el-table-column
            prop="mname"
            label="电影名称"
            min-width="150"
            header-align="center"
            align="center"
        />

        <el-table-column
            prop="mp"
            label="简介"
            min-width="200"
            header-align="center"
            align="center"
        />

        <el-table-column
            prop="mactor"
            label="主演"
            min-width="150"
            header-align="center"
            align="center"
        />

        <el-table-column
            label="状态"
            min-width="100"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">
            <el-tag
                :type="statusTagType[row.mstatus]"
                class="status-tag"
            >
              {{ statusMap[row.mstatus] || '未知状态' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
            label="上映时间"
            min-width="150"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.mstarttime) }}
          </template>
        </el-table-column>

        <el-table-column
            label="下映时间"
            min-width="150"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.mendtime) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column
            label="操作"
            min-width="250"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">
            <div class="action-group">
              <!-- 上下映按钮 -->
              <el-button
                  v-if="row.mstatus !== 1"
                  type="success"
                  size="small"
                  @click="handleCast(row.mid, 'up')"
              >
                上映
              </el-button>
              <el-button
                  v-if="row.mstatus === 1"
                  type="warning"
                  size="small"
                  @click="handleCast(row.mid, 'down')"
              >
                下映
              </el-button>
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row.mid)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="movieData.total"
          :page-sizes="[10, 20, 30]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadMovies"
          @current-change="loadMovies"
          class="pagination"
      />
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑电影信息" width="600px">
      <el-form :model="currentMovie" label-width="80px">
        <!-- 原有表单项保持不变 -->
        <el-form-item label="电影ID">
          <el-input v-model="currentMovie.mid" disabled />
        </el-form-item>

        <el-form-item label="电影名称" required>
          <el-input v-model="currentMovie.mname" />
        </el-form-item>

        <el-form-item label="简介">
          <el-input type="textarea"
                    :rows="1"
                    autosize
                    v-model="currentMovie.mp" />
        </el-form-item>

        <el-form-item label="主演">
          <el-input v-model="currentMovie.mactor" />
        </el-form-item>

        <!-- 修正状态显示 -->
        <el-form-item label="当前状态">
          <el-tag :type="statusTagType[currentMovie.mstatus]">
            {{ statusMap[currentMovie.mstatus] || '未知状态' }}
          </el-tag>
        </el-form-item>

        <!-- 修正时间输入 -->
        <el-form-item label="上映时间" required>
          <el-date-picker
              v-model="currentMovie.mstarttime"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
          />
        </el-form-item>

        <el-form-item label="下映时间" required>
          <el-date-picker
              v-model="currentMovie.mendtime"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import type { Movie, MoviePageQueryVO } from '../../type'
import {listMovie, updateMovie, deleteMovie, upCast, downCast} from '../../api/movie'
import { onMounted } from "vue";

// 状态选项配置修正
const statusOptions = [
  { value: -1, label: '全部' },
  { value: 0, label: '未上映' },
  { value: 1, label: '上映中' },
  { value: 2, label: '已下映' }
]

// 查询参数初始化修正
const queryParams = reactive<MoviePageQueryVO>({
  pageNum: 1,
  pageSize: 10,
  mname: '',
  mactor: '',
  mstatus: -1 // 初始值为-1表示"全部"
})

const handleStatusClear = () => {
  queryParams.mstatus = -1 // 强制重置为第一个选项的值（假设第一个选项的 value 是 -1）
  loadMovies() // 立即触发数据刷新
}

// 强化状态显示处理
const statusMap: Record<number, string> = {
  [-1]: '全部', // 可选添加
  0: '未上映',
  1: '上映中',
  2: '已下映',
}

const statusTagType: Record<number, string> = {
  0: 'info',
  1: 'success',
  2: 'danger'
}

const dateRange = ref<string[]>([])

// 电影数据
const movieData = reactive<{
  list: Movie[],
  total: number
}>({
  list: [],
  total: 0
})

const loading = ref(false)

// 编辑相关
const dialogVisible = ref(false)
const currentMovie = ref<Movie>({} as Movie)

// 新增日期处理逻辑
const handleDateChange = (dates: string[]) => {
  if (dates && dates.length === 2) {
    queryParams.mstarttime = dates[0]
    queryParams.mendtime = dates[1]
  } else {
    queryParams.mstarttime = undefined
    queryParams.mendtime = undefined
  }
  loadMovies()
}

// 初始化加载数据
loadMovies()

async function loadMovies() {
  try {
    loading.value = true

    // 添加时间戳防止缓存
    const params = {
      ...queryParams,
      _t: Date.now() // 强制获取最新数据
    }

    // 处理时间范围
    if (dateRange.value?.length === 2) {
      params.mstarttime = dateRange.value[0]
      params.mendtime = dateRange.value[1]
    } else {
      delete params.mstarttime
      delete params.mendtime
    }

    const res = await listMovie(params)
    movieData.list = res.list || []
    movieData.total = res.total || 0
  } catch (error) {
    ElMessage.error('加载电影数据失败')
  } finally {
    loading.value = false
  }
}

// 优化搜索处理
const handleSearch = () => {
  queryParams.pageNum = 1 // 重置到第一页
  loadMovies()
}

// 优化日期格式化
const formatDate = (dateStr: string | Date) => {
  try {
    return dateStr ? dayjs(dateStr).format('YYYY-MM-DD') : '-'
  } catch {
    return '无效日期'
  }
}

function handleEdit(row: Movie) {
  currentMovie.value = { ...row }
  dialogVisible.value = true
}

async function handleDelete(mid: string) {
  await ElMessageBox.confirm('确定删除该电影吗？', '警告', { type: 'warning' })
  deleteMovie(mid).then(() => {
    ElMessage.success("删除成功！")
    loadMovies()
    location.reload()
  }).catch((error) => {
    ElMessage.success(error)
  })
}

async function submitForm() {
  updateMovie(currentMovie.value).then(() => {
    ElMessage.success("修改成功！")
    dialogVisible.value = false
    loadMovies()
    location.reload()
  }).catch((error) => {
    ElMessage.error(error)
  })
}

// 新增上下映处理函数
const handleCast = async (mid: string, type: 'up' | 'down') => {
  try {
    await ElMessageBox.confirm(
        `确定要${type === 'up' ? '上映' : '下映'}该电影吗？`,
        '操作确认',
        { type: 'warning' }
    )

    const apiFn = type === 'up' ? upCast : downCast
    await apiFn(mid)

    ElMessage.success(`${type === 'up' ? '上映' : '下映'}操作成功`)
    loadMovies() // 操作成功后刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`操作失败: ${(error as Error).message || '未知错误'}`)
    }
  }
}

// 添加防抖处理（防止频繁请求）
let debounceTimer: number
const debounceLoad = () => {
  clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(loadMovies, 300)
}

// 组件挂载时加载数据
onMounted(() => {
  debounceLoad()
})
</script>

<style scoped>
/* 新增按钮组样式 */
.action-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
/* 新增状态选择器样式 */
:deep(.el-select) {
  .el-input__inner {
    padding-right: 30px;
  }

  .el-select__caret {
    line-height: 32px;
  }
}

/* 新增关键样式 */
:deep(.el-table) {
  /* 确保表头与内容列宽一致 */
  table-layout: fixed;

  .el-table__cell {
    padding: 12px 0;

    .cell {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.status-tag {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;

  /* 不同状态的颜色定义 */
  &--0 { background: #f4f4f5; color: #909399; }
  &--1 { background: #f0f9eb; color: #67c23a; }
  &--2 { background: #fef0f0; color: #f56c6c; }
}

.time-cell {
  font-family: monospace;
  letter-spacing: 0.5px;
}

/* 优化搜索区域 */
.search-wrapper {
  padding: 16px;
  background: #f8f9fc;
  border-radius: 8px;
  margin-bottom: 24px;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
    margin-right: 24px;

    .el-form-item__label {
      font-weight: 500;
    }
  }
}

.status-tag {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
}

/* 其他样式参考之前的实现 */
.container {
  padding: 24px;
  max-width: 1500px;
  margin: 0 auto;
  display: grid;
  gap: 32px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 24px;
  overflow: hidden;
}

/* 表格全局样式 */
:deep(.el-table) {
  table-layout: fixed;
  font-size: 14px;

  .el-table__header-wrapper,
  .el-table__body-wrapper {
    width: 100% !important;
  }

  .el-table__cell {
    padding: 12px 0;
    vertical-align: middle;

    .cell {
      padding: 0 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.5;
    }
  }

  /* 表头样式 */
  .table-header th {
    background: #f8f9fc !important;
    height: 56px;
    font-weight: 600;
    color: #1f2d3d;

    .cell {
      font-size: 18px;
      align-items: center;
    }
  }
}

/* ID列特殊处理 */
.id-cell {
  display: inline-block;
  max-width: 100%;
  font-family: monospace;
  letter-spacing: 0.5px;
}

/* 操作按钮组 */
.action-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 分页器样式 */
.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式优化 */
@media (max-width: 1200px) {
  :deep(.el-table) {
    .el-table__cell:nth-child(4) { display: none } /* 隐藏主演列 */
  }
}

@media (max-width: 992px) {
  :deep(.el-table) {
    .el-table__cell:nth-child(3) { display: none } /* 隐藏制片方列 */
  }
}

@media (max-width: 768px) {
  .search-form {
    :deep(.el-form-item) {
      width: 100%;
      margin-right: 0;
    }
  }

  :deep(.el-table) {
    .el-table__cell:nth-child(6) { display: none } /* 隐藏下映时间列 */

    .status-tag {
      padding: 4px 8px;
      font-size: 12px;
    }
  }
}
</style>
