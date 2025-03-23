<template>
  <div class="user-center-container">
    <!-- 头部信息卡片 -->
    <el-card class="user-card" :body-style="{ padding: '35px' }">
      <div class="user-header">
        <div class="avatar-section">
          <el-avatar :size="80" :src="avatarUrl" class="user-avatar">
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

    <!-- 信息管理区域 -->
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

      <!-- 修改密码抽屉 -->
      <el-drawer
          v-model="pwdDrawer.visible"
          title="修改密码"
          size="30%"
          destroy-on-close
      >
        <PasswordForm
            :loading="pwdDrawer.loading"
            @submit="handlePwdSubmit"
            @cancel="pwdDrawer.visible = false"
        />
      </el-drawer>

      <!-- 修改手机抽屉 -->
      <el-drawer
          v-model="phoneDrawer.visible"
          title="修改手机号"
          size="30%"
          destroy-on-close
      >
        <PhoneForm
            :current-phone="userInfo.uphone"
            :loading="phoneDrawer.loading"
            @submit="handlePhoneSubmit"
            @cancel="phoneDrawer.visible = false"
        />
      </el-drawer>

      <!-- 充值对话框 -->
      <el-dialog
          v-model="rechargeDialog.visible"
          title="账户充值"
          width="500px"
          :close-on-click-modal="false"
      >
        <el-form
            ref="rechargeFormRef"
            :model="rechargeForm"
            :rules="rechargeRules"
            label-width="100px"
        >
          <el-form-item label="充值金额" prop="amount">
            <el-input-number
                v-model="rechargeForm.amount"
                :precision="2"
                :step="100"
                :min="0"
                :max="10000"
                controls-position="right"
                placeholder="请输入充值金额"
                class="full-width"
            >
              <template #prefix>¥</template>
            </el-input-number>
            <div class="tip-text">支持充值范围：0.00 - 10,000.00 元</div>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="rechargeDialog.visible = false">取消</el-button>
          <el-button
              type="primary"
              :loading="rechargeDialog.loading"
              @click="handleRecharge"
          >
            确认充值
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Money, User, Edit, Wallet } from '@element-plus/icons-vue'
import { basic, updatePwd, updatePhone, recharge } from '../../api/user'
import type { UserDto, updateVO } from '../../type'
import Decimal from "decimal.js";

// 用户数据
const userInfo = ref<UserDto>({
  uid: '',
  uname: '',
  umoney: 0 as unknown as Decimal,
  uphone: ''
})

// 头像相关
const avatarUrl = ref('')
const avatarFallback = computed(() =>
    userInfo.value.uname?.slice(0, 1).toUpperCase() || 'U'
)

// 格式化金额显示
const formattedMoney = computed(() =>
    Number(userInfo.value.umoney).toFixed(2)
)

// 密码修改抽屉状态
const pwdDrawer = reactive({
  visible: false,
  loading: false
})

// 手机修改抽屉状态
const phoneDrawer = reactive({
  visible: false,
  loading: false
})

// 充值相关状态
const rechargeDialog = reactive({
  visible: false,
  loading: false
})
const rechargeForm = reactive({
  amount: 0
})
const rechargeFormRef = ref<any>(null)

// 充值验证规则
const rechargeRules = reactive({
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    {
      validator: (_rule: any, value: number, callback: any) => {
        if (value < 0) {
          callback(new Error('充值金额不能为负数'))
        } else if (value > 10000) {
          callback(new Error('单笔充值金额不能超过10000元'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 初始化获取用户数据
onMounted(async () => {
  try {
    const res = await basic({} as updateVO)
    userInfo.value = res
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
})

// 密码修改处理
const handlePwdSubmit = async (formData: updateVO) => {
  pwdDrawer.loading = true
  updatePwd(formData).then(() => {
    ElMessage.success('密码修改成功')
    pwdDrawer.visible = false
    localStorage.removeItem("token")
    pwdDrawer.loading = false
    setTimeout(function () {location.assign('/')}, 500)
  }).catch((error) => {
    ElMessage.error(error)
  })
}

// 手机号修改处理
const handlePhoneSubmit = async (formData: updateVO) => {
  phoneDrawer.loading = true
  updatePhone(formData).then(() => {
    ElMessage.success('手机号修改成功')
    phoneDrawer.visible = false
    phoneDrawer.loading = false
    setTimeout(function () {location.assign('/')}, 500)
  }).catch((error) => {
    ElMessage.error(error)
  })
}

// 充值处理
const showRechargeDialog = () => {
  rechargeDialog.visible = true
}

const handleRecharge = async () => {
  try {
    await rechargeFormRef.value.validate()
    rechargeDialog.loading = true

    // 调用充值接口
    await recharge(rechargeForm.amount as unknown as Decimal)

    // 刷新用户信息
    const res = await basic({} as updateVO)
    userInfo.value = res

    ElMessage.success(`成功充值 ¥${rechargeForm.amount.toFixed(2)}`)
    rechargeDialog.visible = false
  } catch (error) {
    ElMessage.error('充值失败，请稍后重试')
  } finally {
    rechargeDialog.loading = false
  }
}

// 显示抽屉
const showPwdDialog = () => pwdDrawer.visible = true
const showPhoneDialog = () => phoneDrawer.visible = true
</script>

<style scoped lang="scss">
.user-center-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;

  .user-card {
    border-radius: 12px;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    margin-bottom: 24px;

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
          justify-content: space-between;
          padding: 16px 24px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          width: 450px;

          .balance-content {
            display: flex;
            align-items: center;
            flex-grow: 1;

            .balance-icon {
              margin-right: 16px;
              color: #67c23a;
            }

            .balance-info {
              display: flex;
              flex-direction: column;

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
            margin-left: 30px;
            white-space: nowrap;
            height: 100%;

            .el-icon {
              margin-right: 6px;
            }
          }
        }
      }
    }
  }

  .management-section {
    .info-panel {
      border-radius: 12px;

      :deep(.el-card__header) {
        background-color: #f8f9fa;
      }

      .panel-header {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 500;

        .header-icon {
          margin-right: 8px;
          color: #409eff;
        }
      }

      .info-list {
        :deep(.el-descriptions__label) {
          width: 100px;
          color: #606266;
        }

        .info-value {
          margin-right: 12px;
        }

        .edit-btn {
          padding: 0;
          margin-left: 8px;
        }

        .security-status {
          color: #67c23a;
        }
      }
    }
  }

  .full-width {
    width: 100%;
  }

  .tip-text {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }
}

@media (max-width: 768px) {
  .user-center-container {
    padding: 0 12px;

    .balance-card {
      flex-direction: column;
      width: auto !important;

      .recharge-btn {
        margin-left: 0 !important;
        margin-top: 16px;
        width: 100%;
      }
    }
  }
}
</style>