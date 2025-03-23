<template>
  <div class="container">
    <el-card class="main-card" shadow="never">
      <!-- 搜索和操作区域 -->
      <div class="search-container">
        <el-form :model="queryParams" class="search-form">
          <el-row :gutter="20" justify="space-between" align="middle">
            <el-col :xs="24" :sm="18" :md="20" :lg="20">
              <el-row :gutter="15">
                <el-col :xs="24" :sm="8" :md="6" :lg="6">
                  <el-form-item label="影院名称" label-width="80px">
                    <el-input
                        v-model="queryParams.cname"
                        placeholder="输入影院名称"
                        clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="8" :md="6" :lg="6">
                  <el-form-item label="放映厅名称" label-width="100px">
                    <el-input
                        v-model="queryParams.srname"
                        placeholder="输入放映厅名称"
                        clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="8" :md="6" :lg="4">
                  <el-form-item>
                    <el-button type="primary" @click="handleSearch">
                      <el-icon><Search /></el-icon>
                      搜索
                    </el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>

            <el-col :xs="24" :sm="6" :md="4" :lg="4" class="action-col">
              <el-button
                  type="primary"
                  plain
                  @click="handleAdd"
                  class="add-button"
              >
                <el-icon><Plus /></el-icon>
                新增
              </el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <el-table
            :data="tableData"
            border
            stripe
            v-loading="loading"
            style="width: 100%"
            height="100%"
        >
          <el-table-column prop="cname" label="影院名称" min-width="150" />
          <el-table-column prop="srname" label="放映厅名称" min-width="120" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button
                  type="primary"
                  size="small"
                  plain
                  @click="handleEdit(row)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                  type="danger"
                  size="small"
                  plain
                  @click="handleDelete(row.srid)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :total="pageTotal"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑放映厅' : '新增放映厅'"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form
          :model="formData"
          :rules="rules"
          ref="formRef"
          label-width="100px"
          label-position="left"
      >
        <el-form-item label="所属影院：" prop="cid">
          <el-select
              v-model="formData.cid"
              placeholder="请选择所属影院"
              class="full-width"
              clearable
              filterable
          >
            <el-option
                v-for="item in cinemaOptions"
                :key="item.cid"
                :label="item.cname"
                :value="item.cid"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="放映厅名称：" prop="srname">
          <el-input
              v-model="formData.srname"
              placeholder="请输入放映厅名称"
              clearable
              maxlength="50"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
              type="primary"
              :loading="submitting"
              @click="submitForm"
          >
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { addScreenroom, deleteScreenroom, listScreenroom, updateScreenroom } from '../../api/screenroom'
import { listAllCinema } from '../../api/cinema'
import type { Cinema, Screenroom, ScreenroomPageQueryVO, ScreenroomVO } from '../../type'

interface ExtendedScreenroomPageQueryVO extends ScreenroomPageQueryVO {
  srname?: string
}

// 响应式数据
const queryParams = reactive<ExtendedScreenroomPageQueryVO>({
  pageNum: 1,
  pageSize: 10,
  cname: '',
  srname: ''
})

const tableData = ref<Screenroom[]>([])
const pageTotal = ref(0)
const cinemaOptions = ref<Cinema[]>([])
const loading = ref(false)
const submitting = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref('')
const formData = reactive<ScreenroomVO>({
  cid: '',
  srname: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  cid: [{ required: true, message: '请选择所属影院', trigger: 'change' }],
  srname: [
    { required: true, message: '请输入放映厅名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
  ]
})

// 表单引用
const formRef = ref<FormInstance>()

// 生命周期钩子
onMounted(() => {
  initPage()
})

// 初始化页面
const initPage = async () => {
  try {
    loading.value = true
    await Promise.all([fetchData(), loadCinemas()])
  } catch (error) {
    console.error('初始化失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载影院列表
const loadCinemas = async () => {
  try {
    cinemaOptions.value = await listAllCinema()
  } catch (error) {
    ElMessage.error('加载影院列表失败')
    console.error('加载影院列表失败:', error)
  }
}

// 获取放映厅数据
const fetchData = async () => {
  try {
    loading.value = true
    const res = await listScreenroom(queryParams)
    tableData.value = res.list
    pageTotal.value = res.total
  } catch (error) {
    ElMessage.error('数据加载失败')
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  queryParams.pageNum = 1
  fetchData()
}

// 分页处理
const handlePageChange = (val: number) => {
  queryParams.pageNum = val
  fetchData()
}

const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  fetchData()
}

// 新增处理
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 编辑处理
const handleEdit = (row: Screenroom) => {
  isEdit.value = true
  currentId.value = row.srid
  formData.cid = row.cid
  formData.srname = row.srname
  dialogVisible.value = true
}

// 删除处理
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该放映厅吗？此操作不可恢复！', '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    })
    await deleteScreenroom(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 提交表单
const submitForm = async () => {
  try {
    submitting.value = true
    await formRef.value?.validate()

    if (isEdit.value) {
      updateScreenroom({
        srid: currentId.value,
        ...formData
      }).then(() => {
        ElMessage.success('更新成功')
        resetForm()
        dialogVisible.value = false
        fetchData()
      }).catch((error) => {
        ElMessage.error(error)
      })
    } else {
      addScreenroom(formData).then(() => {
        ElMessage.success('新增成功')
        resetForm()
        dialogVisible.value = false
        fetchData()
      }).catch((error) => {
        ElMessage.error(error)
      })
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  currentId.value = ''
}

</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;

  .main-card {
    height: auto;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-light);

    :deep(.el-card__body) {
      height: calc(100% - 55px);
      display: flex;
      flex-direction: column;
    }
  }
}

.search-container {
  margin-bottom: 16px;

  .search-form {
    :deep(.el-form-item) {
      margin-bottom: 0;

      .el-form-item__label {
        padding-right: 8px;
      }
    }

    .action-col {
      display: flex;
      justify-content: flex-end;
      padding-right: 10px;
    }

    .add-button {
      width: 100%;
      max-width: 120px;
    }
  }

  @media (max-width: 768px) {
    .el-col {
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .action-col {
      justify-content: flex-start !important;
      padding-right: 0;
    }
  }
}

.table-container {
  flex: 1;
  min-height: 300px;
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
}

.dialog-footer {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);
}

.full-width {
  width: 100%;
}
</style>
