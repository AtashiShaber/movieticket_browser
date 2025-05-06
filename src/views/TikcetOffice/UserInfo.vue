<template>
  <div class="user-center-container">
    <!-- 用户信息卡片 -->
    <el-card class="user-card" :body-style="{ padding: '35px' }">
      <div class="user-header">
        <div class="avatar-section">
          <el-avatar :size="80" class="user-avatar">
            <span class="avatar-fallback">{{ avatarFallback }}</span>
          </el-avatar>
          <div class="user-meta">
            <h2 class="user-name">{{ userInfo.uname }}</h2>
            <p class="user-id">ID: {{ userInfo.uid }}</p>
          </div>
        </div>
        <div class="balance-section">
          <div class="balance-card">
            <div class="balance-content">
              <div class="balance-icon">
                <el-icon :size="28"><Money /></el-icon>
              </div>
              <div class="balance-info">
                <span class="balance-label">账户余额</span>
                <span class="balance-amount">¥ {{ formattedMoney }}</span>
              </div>
            </div>
            <el-button
                type="primary"
                size="small"
                @click="showRechargeDialog"
                class="recharge-btn"
            >
              <el-icon><Wallet /></el-icon>
              立即充值
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 功能管理区域 -->
    <div class="management-section">
      <!-- 基本信息面板 -->
      <el-card class="info-panel">
        <template #header>
          <div class="panel-header">
            <el-icon class="header-icon"><User /></el-icon>
            <span>基本信息</span>
          </div>
        </template>
        <el-descriptions :column="1" class="info-list">
          <el-descriptions-item label="手机号码">
            <span class="info-value">{{ userInfo.uphone }}</span>
            <el-button
                type="primary"
                link
                @click="showPhoneDialog"
                class="edit-btn"
            >
              <el-icon><Edit /></el-icon> 修改
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="安全设置">
            <span class="security-status">已设置密码</span>
            <el-button
                type="primary"
                link
                @click="showPwdDialog"
                class="edit-btn"
            >
              <el-icon><Edit /></el-icon> 修改
            </el-button>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 订单查询 -->
      <el-card class="query-panel">
        <template #header>
          <div class="panel-header">
            <el-icon class="header-icon"><Tickets /></el-icon>
            <span>我的订单</span>
          </div>
        </template>
        <el-table
            :data="orderData"
            v-loading="orderLoading"
            style="width: 100%"
            stripe
        >
          <el-table-column prop="oid" label="订单号" width="220" />
          <el-table-column prop="mname" label="电影名称" />
          <el-table-column label="下单时间" width="180">
            <template #default="{row}">
              {{ formatDateTime(row.otime) }}
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120">
            <template #default="{row}">
              ¥{{ row.oprice.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="{row}">
              <el-tag :type="getOrderStatusType(row.ostatus)">
                {{ getOrderStatusText(row.ostatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{row}">
              <el-button
                  type="primary"
                  size="small"
                  :disabled="row.ostatus !== 0"
                  @click="handlePay(row)"
                  :loading="payLoading[row.oid]"
              >
                {{ row.ostatus === 0 ? '立即支付' : '已支付' }}
              </el-button>
              <el-button
                  type="danger"
                  size="small"
                  :disabled="row.tstatus !== 0"
                  @click="handleRefund(row)"
                  :loading="refundLoading[row.oid]"
              >
                退款
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            v-model:current-page="orderQuery.pageNum"
            v-model:page-size="orderQuery.pageSize"
            :total="orderTotal"
            layout="total, prev, pager, next"
            @current-change="loadOrders"
        />
      </el-card>
      <!-- 票务查询 -->
      <el-card class="query-panel">
        <template #header>
          <div class="panel-header">
            <el-icon class="header-icon"><Ticket /></el-icon>
            <span>我的票务</span>
            <div class="search-form">
              <el-input
                  v-model="ticketQuery.mname"
                  placeholder="电影名称"
                  clearable
              />
              <el-input
                  v-model="ticketQuery.cname"
                  placeholder="影院名称"
                  clearable
              />
              <el-date-picker
                  v-model="ticketQuery.sday"
                  type="date"
                  placeholder="放映日期"
                  value-format="YYYY-MM-DD"
              />
              <el-button
                  type="primary"
                  @click="loadTickets"
                  :icon="Search"
              >查询</el-button>
            </div>
          </div>
        </template>
        <el-table
            :data="ticketData"
            v-loading="ticketLoading"
            stripe
        >
          <el-table-column prop="tid" label="票号" width="220" />
          <el-table-column prop="mname" label="电影名称" />
          <el-table-column prop="cname" label="影院名称" />
          <el-table-column prop="srname" label="放映厅" width="120" />
          <el-table-column label="放映日期" width="120">
            <template #default="{row}">
              {{ formatDate(row.sday) }}
            </template>
          </el-table-column>
          <el-table-column prop="tseat" label="座位" width="120" />
          <el-table-column label="状态" width="120">
            <template #default="{row}">
              <el-tag :type="row.tstatus === 0 ? 'success' : row.tstatus === 1 ? 'info' : 'danger'">
                {{ row.tstatus === 0 ? '有效' : row.tstatus === 1 ? '已使用' : '已退款'}}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            v-model:current-page="ticketQuery.pageNum"
            v-model:page-size="ticketQuery.pageSize"
            :total="ticketTotal"
            layout="total, prev, pager, next"
            @current-change="loadTickets"
        />
      </el-card>

      <!-- 修改密码抽屉 -->
      <el-drawer v-model="pwdDrawer.visible" title="修改密码" size="30%">
        <div class="drawer-content">
          <el-form
              ref="pwdFormRef"
              :model="pwdForm"
              :rules="pwdRules"
              label-width="100px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                  v-model="pwdForm.oldPassword"
                  type="password"
                  show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                  v-model="pwdForm.newPassword"
                  type="password"
                  show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                  v-model="pwdForm.confirmPassword"
                  type="password"
                  show-password
              />
            </el-form-item>
            <div class="drawer-footer">
              <el-button @click="pwdDrawer.visible = false">取消</el-button>
              <el-button
                  type="primary"
                  :loading="pwdDrawer.loading"
                  @click="handlePwdSubmit"
              >确认修改</el-button>
            </div>
          </el-form>
        </div>
      </el-drawer>

      <!-- 修改手机抽屉 -->
      <el-drawer v-model="phoneDrawer.visible" title="修改手机号" size="30%">
        <div class="drawer-content">
          <el-form
              ref="phoneFormRef"
              :model="phoneForm"
              :rules="phoneRules"
              label-width="100px"
          >
            <el-form-item label="新手机号" prop="phone">
              <el-input v-model="phoneForm.phone" />
            </el-form-item>
            <el-form-item label="旧手机号" prop="oldPhone">
              <el-input v-model="phoneForm.oldPhone" />
            </el-form-item>
            <div class="drawer-footer">
              <el-button @click="phoneDrawer.visible = false">取消</el-button>
              <el-button
                  type="primary"
                  :loading="phoneDrawer.loading"
                  @click="handlePhoneSubmit"
              >确认修改</el-button>
            </div>
          </el-form>
        </div>
      </el-drawer>

      <!-- 充值对话框 -->
      <el-dialog
          v-model="rechargeDialog.visible"
          title="账户充值"
          width="500px"
      >
        <el-form
            ref="rechargeFormRef"
            :model="rechargeForm"
            :rules="rechargeRules"
            label-width="100px"
        >
          <el-form-item label="充值金额" prop="amount">
            <el-input
                v-model="rechargeForm.amount"
                placeholder="请输入充值金额"
                clearable
            >
              <template #prefix>¥</template>
            </el-input>
            <div class="tip-text">支持充值范围：0.01 - 10,000.00 元</div>
          </el-form-item>
        </el-form>

        <template #footer>
      <span class="dialog-footer">
        <el-button @click="rechargeDialog.visible = false">取消</el-button>
        <el-button
            type="primary"
            :loading="rechargeDialog.loading"
            @click="handleRecharge"
        >
          确认充值
        </el-button>
      </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Money, User, Edit, Wallet, Search, Tickets, Ticket
} from '@element-plus/icons-vue'
import {
  basic, updatePwd, updatePhone, recharge
} from '../../api/user'
import {listOrder, refundOrder} from '../../api/order'
import {autoUseTicket, listTicket} from '../../api/ticket'
import type {
  UserDto, OrderDto, TicketDto, TicketPageQueryVO, OrderPayVO
} from '../../type'
import Decimal from "decimal.js";
// 新增引入
import { payOrder } from '../../api/order'

// 在原有代码基础上新增支付相关状态
const payLoading = ref<Record<string, boolean>>({})

// 支付处理方法
const handlePay = async (order: OrderDto) => {
  try {
    payLoading.value[order.oid] = true

    const payData: OrderPayVO = {
      oid: order.oid,
      oprice: order.oprice
    }

    await payOrder(payData)
    ElMessage.success('支付成功')

    location.reload()
  } catch (error) {
    ElMessage.error(error || '支付失败')
  } finally {
    payLoading.value[order.oid] = false
  }
}

// 修改订单状态显示方法
const getOrderStatusType = (status: number) =>
    ({ 0: 'warning', 1: 'success', 2: 'info' }[status] || 'info')

// 用户数据
const userInfo = ref<UserDto>({
  uid: '',
  uname: '',
  umoney: 0 as unknown as Decimal,
  uphone: ''
})

// 密码修改相关
const pwdDrawer = reactive({
  visible: false,
  loading: false
})
const pwdFormRef = ref<FormInstance>()
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const pwdRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    {
      validator: (_rule, value, callback) => {
        if (value !== pwdForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 手机号修改相关
const phoneDrawer = reactive({
  visible: false,
  loading: false
})
const phoneFormRef = ref<FormInstance>()
const phoneForm = reactive({
  phone: '',
  oldPhone: ''
})
const phoneRules = reactive<FormRules>({
  phone: [
    { required: true, message: '请输入新手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入有效的手机号码',
      trigger: 'blur'
    }
  ],
  oldPhone: [
    { required: true, message: '请输入旧手机号', trigger: 'blur' }
  ]
})

// 充值相关
// 充值相关状态
const rechargeDialog = reactive({
  visible: false,
  loading: false
})
const rechargeForm = reactive({
  amount: ''
})
const rechargeFormRef = ref<any>(null)
// 充值验证规则
const rechargeRules = reactive<FormRules>({
  amount: [
    {
      required: true,
      message: '请输入充值金额',
      trigger: 'blur'
    },
    {
      validator: (_, value, callback) => {
        try {
          const amount = new Decimal(value || 0)
          if (amount.isNaN()) {
            callback(new Error('请输入有效数字'))
          } else if (amount.lessThan(0.01)) {
            callback(new Error('金额不能小于0.01元'))
          } else if (amount.greaterThan(10000)) {
            callback(new Error('单次充值不能超过10000元'))
          } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
            callback(new Error('金额格式不正确'))
          } else {
            callback()
          }
        } catch (e) {
          callback(new Error('无效的金额格式'))
        }
      },
      trigger: 'blur'
    }
  ]
})

// 订单相关
const orderData = ref<OrderDto[]>([])
const orderLoading = ref(false)
const orderTotal = ref(0)
const orderQuery = reactive({
  pageNum: 1,
  pageSize: 10
})

// 票务相关
const ticketData = ref<TicketDto[]>([])
const ticketLoading = ref(false)
const ticketTotal = ref(0)
const ticketQuery = reactive<TicketPageQueryVO>({
  pageNum: 1,
  pageSize: 10,
  mname: '',
  cname: '',
  sday: undefined
})

// 计算属性
const avatarFallback = computed(() =>
    userInfo.value.uname?.slice(0, 1).toUpperCase() || 'U'
)
const formattedMoney = computed(() =>
    userInfo.value.umoney
)

// 方法
const formatDate = (dateStr: string) =>
    new Date(dateStr).toISOString().split('T')[0]

const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

const getOrderStatusText = (status: number) =>
    ({ 0: '待支付', 1: '已支付', 2: '已取消' }[status] || '未知状态')

// 数据加载
const loadUserInfo = async () => {
  basic().then((resp) => {
    userInfo.value = resp
  }).catch((error) => {
    ElMessage.error(error)
  })
}

const loadOrders = async () => {
  try {
    orderLoading.value = true
    const res = await listOrder(orderQuery)
    orderData.value = res.list
    orderTotal.value = res.total
  } catch (error) {
    ElMessage.error('订单加载失败')
  } finally {
    orderLoading.value = false
  }
}

const loadTickets = async () => {
  try {
    ticketLoading.value = true
    const res = await listTicket(ticketQuery)
    ticketData.value = res.list
    ticketTotal.value = res.total
  } catch (error) {
    ElMessage.error('票务加载失败')
  } finally {
    ticketLoading.value = false
  }
}

// 密码修改处理
const handlePwdSubmit = async () => {
  await pwdFormRef.value?.validate()
  pwdDrawer.loading = true
  updatePwd({
    oldData: pwdForm.oldPassword,
    newData: pwdForm.newPassword
  }).then(() => {
    ElMessage.success('密码修改成功')
    pwdDrawer.visible = false
    localStorage.removeItem("token")
    setTimeout(() => {
      location.assign('/')
    }, 500)
  }).catch((error) => {
    ElMessage.error(error);
  }).finally(() => {
    pwdDrawer.loading = false
  })
}

// 手机号修改处理
const handlePhoneSubmit = async () => {
  await phoneFormRef.value?.validate()
  phoneDrawer.loading = true
  updatePhone({
    newData: phoneForm.phone,
    oldData: phoneForm.oldPhone
  }).then(() => {
    ElMessage.success('手机号修改成功')
    phoneDrawer.visible = false
    localStorage.removeItem("token")
    setTimeout(() => {
      location.assign('/')
    }, 500)
  }).catch((error) => {
    ElMessage.error(error)
  }).finally(() => {
    phoneDrawer.loading = false
  })
}

// 充值处理
const handleRecharge = async () => {
  try {
    // 执行表单验证
    await rechargeFormRef.value?.validate()

    // 转换为Decimal
    const amount = new Decimal(rechargeForm.amount)

    // 显示加载状态
    rechargeDialog.loading = true

    // 调用接口（传递字符串）
    await recharge(amount)

    // 刷新用户信息
    const res = await basic()
    userInfo.value = res

    ElMessage.success(`成功充值 ¥${amount.toFixed(2)}`)
    rechargeDialog.visible = false
  } catch (error) {
    const msg = error instanceof Error ? error.message : '充值失败'
    ElMessage.error(msg)
  } finally {
    rechargeDialog.loading = false
  }
}

// 退款相关内容
const refundLoading = ref<Record<string, boolean>>({})

const handleRefund = async (row: OrderDto) => {
  try {
    refundLoading.value[row.oid] = true
    await refundOrder(row.oid)
    ElMessage.success('退款成功')
    location.reload()
  } catch (error) {
    ElMessage.error(error || '退款失败')
  } finally {
    refundLoading.value[row.oid] = false
  }
}

// 初始化
onMounted(async () => {
  // 加载用户基本信息
  loadUserInfo().then(() => {
    // 自动使用过期的票
    autoUseTicket()
    // 加载订单和票务数据
    loadOrders()
    loadTickets()
  }).catch((error) => {
    ElMessage.error(error)
  })
})

// 显示对话框
const showPwdDialog = () => {
  pwdFormRef.value?.resetFields()
  pwdDrawer.visible = true
}

const showPhoneDialog = () => {
  phoneFormRef.value?.resetFields()
  phoneDrawer.visible = true
}

const showRechargeDialog = () => {
  rechargeFormRef.value?.resetFields()
  rechargeDialog.visible = true
}
</script>

<style scoped lang="scss">
.user-center-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;

  .user-card {
    margin-bottom: 24px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);

    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .avatar-section {
        display: flex;
        align-items: center;

        .user-avatar {
          margin-right: 20px;
          background-color: #409eff;

          .avatar-fallback {
            font-size: 32px;
            font-weight: 500;
            color: white;
          }
        }

        .user-meta {
          .user-name {
            margin: 0;
            font-size: 24px;
            color: #303133;
          }

          .user-id {
            margin: 4px 0 0;
            color: #909399;
            font-size: 14px;
          }
        }
      }

      .balance-section {
        .balance-card {
          display: flex;
          align-items: center;
          padding: 16px 24px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);

          .balance-content {
            display: flex;
            align-items: center;
            margin-right: 30px;

            .balance-icon {
              color: #67c23a;
              margin-right: 16px;
            }

            .balance-info {
              .balance-label {
                font-size: 14px;
                color: #909399;
              }

              .balance-amount {
                font-size: 24px;
                font-weight: 600;
                color: #303133;
              }
            }
          }

          .recharge-btn {
            padding: 10px 20px;
          }
        }
      }
    }
  }

  .management-section {
    .info-panel, .query-panel {
      margin-bottom: 24px;
      border-radius: 12px;

      :deep(.el-card__header) {
        background-color: #f8f9fa;
        padding: 18px 24px;
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .header-icon {
          color: #409eff;
          margin-right: 8px;
        }

        .search-form {
          display: flex;
          gap: 10px;

          .el-input, .el-date-editor {
            width: 180px;
          }
        }
      }

      .el-pagination {
        margin-top: 20px;
        justify-content: flex-end;
      }

      .drawer-content {
        padding: 20px;

        .code-input {
          display: flex;
          gap: 10px;

          .el-button {
            width: 120px;
          }
        }

        .drawer-footer {
          margin-top: 30px;
          text-align: right;
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 0 12px;

    .user-header {
      flex-direction: column;
      align-items: flex-start;

      .balance-section {
        width: 100%;
        margin-top: 20px;

        .balance-card {
          flex-direction: column;
          align-items: stretch;

          .recharge-btn {
            margin-top: 16px;
            width: 100%;
          }
        }
      }
    }

    .search-form {
      flex-direction: column;

      .el-input, .el-date-editor, button {
        width: 100% !important;
      }
    }

    :deep(.el-drawer) {
      width: 90% !important;
    }
  }

  .tip-text {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }
}
</style>