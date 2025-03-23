<template>
  <div class="container">
    <!-- 管理员表格 -->
    <div class="card">
      <el-table
          :data="adminData.list"
          border
          stripe
          v-loading="adminLoading"
          header-row-class-name="table-header"
      >
        <el-table-column
            prop="adminId"
            label="管理员ID"
            min-width="220"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">
            <span class="id-cell">{{ row.adminId }}</span>
          </template>
        </el-table-column>

        <el-table-column
            prop="adminName"
            label="姓名"
            min-width="150"
            header-align="center"
            align="center"
        />

        <el-table-column
            prop="phone"
            label="手机号"
            min-width="200"
            header-align="center"
            align="center"
        />
      </el-table>

      <el-pagination
          v-model:current-page="adminQuery.pageNum"
          v-model:page-size="adminQuery.pageSize"
          :total="adminData.total"
          :page-sizes="[10, 20, 30]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadAdmins"
          @current-change="loadAdmins"
          class="pagination"
      />
    </div>

    <!-- 用户表格 -->
    <!-- 用户表格 -->
    <div class="card">
      <el-table
          :data="userData.list"
          border
          stripe
          v-loading="userLoading"
          header-row-class-name="table-header"
      >
        <el-table-column
            prop="uid"
            label="用户ID"
            min-width="220"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">
            <span class="id-cell">{{ row.uid }}</span>
          </template>
        </el-table-column>

        <el-table-column
            prop="uname"
            label="姓名"
            min-width="150"
            header-align="center"
            align="center"
        />

        <el-table-column
            prop="uphone"
            label="手机号"
            min-width="200"
            header-align="center"
            align="center"
        />

        <el-table-column
            label="账户余额"
            min-width="200"
            header-align="center"
            align="right"
        >
          <template #default="{ row }">
            <span class="money-cell">￥{{ row.umoney }}</span>
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            min-width="220"
            header-align="center"
            align="center"
        >
          <template #default="{ row }">
            <div class="action-group">
              <el-button type="primary" @click="handleEditUser(row)">编辑</el-button>
              <el-button type="danger" @click="handleDeleteUser(row.uid)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="userQuery.pageNum"
          v-model:page-size="userQuery.pageSize"
          :total="userData.total"
          :page-sizes="[10, 20, 30]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadUsers"
          @current-change="loadUsers"
          class="pagination"
      />
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="30%">
      <el-form :model="currentItem" label-width="80px">
        <template v-if="currentItemType === 'admin'">
          <el-form-item label="管理员ID">
            <el-input v-model="currentItem.adminId" disabled />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="currentItem.adminName" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="currentItem.phone" />
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="用户ID">
            <el-input v-model="currentItem.uid" disabled />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="currentItem.uname" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="currentItem.uphone" />
          </el-form-item>
          <el-form-item label="账户余额">
            <el-input-number
                v-model="currentItem.umoney"
                :precision="2"
                :step="0.1"
                :min="0"
            />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type {AdminDto, AdminPageQueryVO, UserDto, UserPageQueryVO} from "../../type";
import { listAdmin } from '../../api/admin'
import {deleteUser, listUser, updateUser} from '../../api/user'

// 管理员相关
const adminQuery = reactive<AdminPageQueryVO>({
  pageNum: 1,
  pageSize: 10,
  adminName: '',
  phone: ''
})

const adminData = reactive<{
  list: AdminDto[],
  total: number
}>({
  list: [],
  total: 0
})

const adminLoading = ref(false)

// 用户相关
const userQuery = reactive<UserPageQueryVO>({
  pageNum: 1,
  pageSize: 10,
  uname: '',
  uphone: ''
})

const userData = reactive<{
  list: UserDto[],
  total: number
}>({
  list: [],
  total: 0
})

const userLoading = ref(false)

// 编辑相关
const dialogVisible = ref(false)
const currentItem = ref<UserDto>({} as any)

// 初始化加载数据
loadAdmins()
loadUsers()

async function loadAdmins() {
  try {
    adminLoading.value = true
    const res = await listAdmin(adminQuery)
    console.log(res)
    adminData.list = res.list || []
    adminData.total = res.total || 0
  } catch (error) {
    ElMessage.error('加载管理员数据失败')
  } finally {
    adminLoading.value = false
  }
}

async function loadUsers() {
  try {
    userLoading.value = true
    const res = await listUser(userQuery)
    userData.list = res.list || []
    userData.total = res.total || 0
  } catch (error) {
    ElMessage.error('加载用户数据失败')
  } finally {
    userLoading.value = false
  }
}

function handleEditUser(row: UserDto) {
  currentItem.value = { ...row }
  dialogVisible.value = true
}


async function handleDeleteUser(uid: string) {
  await ElMessageBox.confirm('确定删除该用户吗？', '警告', { type: 'warning' })
  deleteUser(uid).then(() => {
    ElMessage.success('删除成功')
    loadUsers()
  }).catch((error) => {
    console.log(error)
    ElMessage.error(error)
  })
}

async function submitForm() {
  updateUser(currentItem.value as UserDto).then(() => {
    ElMessage.success('修改成功！')
    dialogVisible.value = false
    loadUsers()
  }).catch((error) => {
    ElMessage.error(error)
  })
}
</script>

<style scoped>
.container {
  padding: 24px;
  max-width: 1440px;
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

/* 金额列样式 */
.money-cell {
  font-weight: 500;
  color: #67c23a;
  padding-right: 16px;
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
@media (max-width: 768px) {
  .container {
    padding: 16px;
    gap: 24px;
  }

  .card {
    padding: 16px;
    border-radius: 8px;
  }

  :deep(.el-table) {
    font-size: 13px;

    .el-table__cell {
      padding: 8px 0;

      .cell {
        padding: 0 12px;
      }

      &:nth-child(3) {
        display: none; /* 隐藏手机号列 */
      }
    }
  }

  .action-group {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  :deep(.el-table) {
    .el-table__cell {
      &:nth-child(4) {
        display: none; /* 在小屏设备隐藏余额列 */
      }
    }
  }
}
</style>
