<template>
  <div class="container">
    <div class="card">
      <!-- 搜索表单 -->
      <div class="search-wrapper">
        <el-form :model="queryParams" inline class="search-form">
          <el-form-item label="影院名称" class="search-item">
            <el-input
                v-model="queryParams.cname"
                placeholder="输入影院名称"
                clearable
                @change="handleSearch"
            />
          </el-form-item>

          <el-form-item label="影院地址" class="search-item">
            <el-input
                v-model="queryParams.caddress"
                placeholder="输入影院地址"
                clearable
                @change="handleSearch"
            />
          </el-form-item>

          <el-form-item label="联系电话" class="search-item">
            <el-input
                v-model="queryParams.ccall"
                placeholder="输入联系电话"
                clearable
                @change="handleSearch"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 影院表格 -->
      <el-table
          :data="cinemaData.list"
          border
          stripe
          v-loading="loading"
          header-row-class-name="table-header"
          style="width: 100%"
      >
        <el-table-column
            prop="cid"
            label="影院ID"
            min-width="250"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">
            <span class="id-cell">{{ row.cid }}</span>
          </template>
        </el-table-column>

        <el-table-column
            prop="cname"
            label="影院名称"
            min-width="150"
            header-align="center"
            align="center"
        />

        <el-table-column
            prop="caddress"
            label="影院地址"
            min-width="200"
            header-align="center"
            align="center"
        />

        <el-table-column
            prop="ccall"
            label="联系电话"
            min-width="150"
            header-align="center"
            align="center"
        />

        <!-- 操作列 -->
        <el-table-column
            label="操作"
            min-width="200"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">
            <div class="action-group">
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row.cid)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="cinemaData.total"
          :page-sizes="[10, 20, 30]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadCinemas"
          @current-change="loadCinemas"
          class="pagination"
      />
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑影院信息" width="600px">
      <el-form :model="currentCinema" label-width="80px">
        <el-form-item label="影院ID">
          <el-input v-model="currentCinema.cid" disabled />
        </el-form-item>

        <el-form-item label="影院名称" required>
          <el-input v-model="currentCinema.cname" />
        </el-form-item>

        <el-form-item label="影院地址">
          <el-input v-model="currentCinema.caddress" />
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input v-model="currentCinema.ccall" />
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
import type { Cinema, CinemaPageQueryVO } from '../../type'
import { listCinemaAdmin, updateCinema, deleteCinema } from '../../api/cinema'

// 查询参数
const queryParams = reactive<CinemaPageQueryVO>({
  pageNum: 1,
  pageSize: 10,
  cname: '',
  caddress: '',
  ccall: ''
})

// 影院数据
const cinemaData = reactive<{
  list: Cinema[],
  total: number
}>({
  list: [],
  total: 0
})

const loading = ref(false)

// 编辑相关
const dialogVisible = ref(false)
const currentCinema = ref<Cinema>({} as Cinema)

// 初始化加载数据
loadCinemas()

async function loadCinemas() {
  try {
    loading.value = true
    const res = await listCinemaAdmin(queryParams)
    cinemaData.list = res.list || []
    cinemaData.total = res.total || 0
  } catch (error) {
    ElMessage.error('加载影院数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.pageNum = 1
  loadCinemas()
}

function handleEdit(row: Cinema) {
  currentCinema.value = { ...row }
  dialogVisible.value = true
}

async function handleDelete(cid: string) {
  await ElMessageBox.confirm('确定删除该影院吗？', '警告', { type: 'warning' })
  deleteCinema(cid).then(() => {
    ElMessage.success("删除成功！")
    loadCinemas()
  }).catch((error) => {
    ElMessage.error(error)
  })
}

async function submitForm() {
  updateCinema(currentCinema.value).then(() => {
    ElMessage.success("修改成功！")
    dialogVisible.value = false
    loadCinemas()
  }).catch((error) => {
    ElMessage.error(error)
  })
}
</script>

<style scoped>
/* 复用电影列表的样式即可 */
.container {
  padding: 24px;
  max-width: 1500px;
  margin: 0 auto;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 24px;
  overflow: hidden;
}

.search-wrapper {
  padding: 16px;
  background: #f8f9fc;
  border-radius: 8px;
  margin-bottom: 24px;
}

.action-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.id-cell {
  font-family: monospace;
  letter-spacing: 0.5px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-form {
    :deep(.el-form-item) {
      width: 100%;
      margin-right: 0;
    }
  }

  :deep(.el-table) {
    .el-table__cell:nth-child(4) { display: none } /* 隐藏联系电话列 */
  }
}
</style>
