<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20">
      <el-col v-for="(stat, index) in stats" :key="index" :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
              <component :is="stat.icon" :style="{ color: stat.color }" />
            </div>
            <div class="stat-text">
              <div class="label">{{ stat.label }}</div>
              <div class="value">{{ stat.value }}{{ stat.unit }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 放映信息双列布局 -->
    <el-row :gutter="20" class="mt-20">
      <!-- 今日放映 -->
      <el-col :span="12">
        <el-card class="screen-card">
          <template #header>
            <div class="card-header">
              <span>今日放映</span>
              <el-pagination
                  small
                  layout="prev, pager, next"
                  :total="todayTotal"
                  :current-page="currentPageToday"
                  :page-size="pageSize"
                  @current-change="handlePageTodayChange"
              />
            </div>
          </template>
          <el-skeleton :loading="todayLoading" :count="pageSize" animated>
            <template #default>
              <el-timeline>
                <el-timeline-item
                    v-for="(screening, index) in todayScreenings"
                    :key="index"
                    placement="top"
                >
                  <el-card shadow="hover" class="screening-item">
                    <div class="screening-content">
                      <div class="movie-header" style="padding: 0;margin: 0">
                        <h1 class="movie-title">{{ screening.mname }}</h1>
                      </div>
                      <div class="screening-bottom">
                        <div class="cinema-info">
                          <span class="cinema-name">{{ screening.cname }}</span>
                          <span class="separator">|</span>
                          <span class="hall-name">{{ screening.srname }}</span>
                        </div>
                        <div class="screening-time">{{ formatFullTime(screening.stime) }}</div>
                      </div>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </template>
          </el-skeleton>
          <el-empty v-if="todayError" description="加载失败，点击重试" @click="fetchTodayScreenings" />
          <el-empty v-if="todayEmpty" description="今日暂无放映的场次" @click="fetchTodayScreenings" />
        </el-card>
      </el-col>

      <!-- 即将上映 -->
      <el-col :span="12">
        <el-card class="screen-card">
          <template #header>
            <div class="card-header">
              <span>即将上映</span>
              <el-pagination
                  small
                  layout="prev, pager, next"
                  :total="upcomingTotal"
                  :current-page="currentPageUpcoming"
                  :page-size="pageSize"
                  @current-change="handlePageUpcomingChange"
              />
            </div>
          </template>
          <el-skeleton :loading="upcomingLoading" :count="pageSize" animated>
            <template #default>
              <div class="upcoming-list">
                <el-card
                    v-for="(movie, index) in upcomingMovies"
                    :key="index"
                    shadow="hover"
                    class="upcoming-item"
                >
                  <div class="movie-content">
                    <div class="movie-header">
                      <h1 class="movie-title">{{ movie.mname }}</h1>
                      <div class="movie-meta">
                        <div class="movie-actor">{{ movie.mactor || '主演：待定' }}</div>
                        <div class="movie-date">{{ formatDate(movie.mstarttime) }}</div>
                      </div>
                    </div>
                    <div class="intro-container">
                      <span class="intro-label">简介：</span>
                      <span class="intro-content">{{ movie.mp || '暂无简介' }}</span>
                    </div>
                  </div>
                </el-card>
              </div>
            </template>
          </el-skeleton>
          <el-empty v-if="upcomingError" description="加载失败，点击重试" @click="fetchUpcomingMovies" />
          <el-empty v-if="upcomingEmpty" description="近期暂无即将上映的电影" @click="fetchUpcomingMovies" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { Wallet, Document, User, Refresh } from '@element-plus/icons-vue'
import { getCast, getUpComing } from '../api/movie'
import { countTodayScreening } from '../api/screening'
import { countTodaySales, refundRate } from '../api/order'
import type { ScreeningDto, Movie } from '../type'

// 分页参数
const pageSize = 3
const currentPageToday = ref(1)
const currentPageUpcoming = ref(1)

// 加载状态
const todayLoading = ref(false)
const todayError = ref(false)
const upcomingLoading = ref(false)
const upcomingError = ref(false)
const todayEmpty = ref(false)
const upcomingEmpty = ref(false)

// 统计数据
const sales = ref(0)
const orderCount = ref(0)
const screeningCount = ref(0)
const refundRateValue = ref(0)

// 统计卡片配置
const stats = computed(() => [
  {
    icon: Wallet,
    label: '今日销售额',
    value: "￥" + sales.value,
    unit: '',
    color: '#409EFF',
    bgColor: '#409EFF1a'
  },
  {
    icon: Document,
    label: '今日订单数',
    value: orderCount.value,
    unit: '件',
    color: '#67C23A',
    bgColor: '#67C23A1a'
  },
  {
    icon: User,
    label: '今日场次',
    value: screeningCount.value,
    unit: '场',
    color: '#E6A23C',
    bgColor: '#E6A23C1a'
  },
  {
    icon: Refresh,
    label: '退票率',
    value: refundRateValue.value,
    unit: '%',
    color: '#F56C6C',
    bgColor: '#F56C6C1a'
  }
])

// 放映数据
const todayScreenings = ref<ScreeningDto[]>([])
const todayTotal = ref(0)
const upcomingMovies = ref<Movie[]>([])
const upcomingTotal = ref(0)

// 处理分页变化
const handlePageTodayChange = (val: number) => {
  currentPageToday.value = val
  fetchTodayScreenings()
}

const handlePageUpcomingChange = (val: number) => {
  currentPageUpcoming.value = val
  fetchUpcomingMovies()
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const [salesData, screeningData, rateData] = await Promise.all([
      countTodaySales(),
      countTodayScreening(),
      refundRate()
    ])
    sales.value = salesData
    orderCount.value = 0 // 需要实现订单数接口
    screeningCount.value = screeningData
    if (isNaN(rateData)) {
      refundRateValue.value = 0
    } else  {
      refundRateValue.value = rateData
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 获取今日放映
const fetchTodayScreenings = async () => {
  try {
    todayLoading.value = true
    todayError.value = false
    todayEmpty.value = false
    const res = await getCast({
      pageNum: currentPageToday.value,
      pageSize: pageSize
    })
    todayScreenings.value = res.list || []
    todayTotal.value = res.total || 0
    if (todayTotal.value === 0){
      todayEmpty.value = true
    }
  } catch (error) {
    todayError.value = true
    console.error('今日放映加载失败:', error)
  } finally {
    todayLoading.value = false
  }
}

// 获取即将上映
const fetchUpcomingMovies = async () => {
  try {
    upcomingLoading.value = true
    upcomingError.value = false
    upcomingEmpty.value = false
    const res = await getUpComing({
      pageNum: currentPageUpcoming.value,
      pageSize: pageSize
    })
    upcomingMovies.value = res.list || []
    upcomingTotal.value = res.total || 0
    if (upcomingTotal === 0){
      upcomingEmpty.value = true
    }
  } catch (error) {
    upcomingError.value = true
    console.error('即将上映加载失败:', error)
  } finally {
    upcomingLoading.value = false
  }
}

// 完整时间格式化（处理开始结束时间）
const formatFullTime = (timeStr: string) => {
  try {
    const [start, end] = timeStr.split('-')
    const formatPart = (part: string) => {
      const [h, m] = part.split(':')
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
    }
    return `${formatPart(start)} - ${formatPart(end)}`
  } catch {
    return '时间无效'
  }
}

// 日期格式化
const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return '日期无效'
  }
}

// 初始化加载
onMounted(() => {
  fetchStatistics()
  fetchTodayScreenings()
  fetchUpcomingMovies()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 统计卡片样式 */
.stat-card {
  margin-bottom: 20px;
  height: 120px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-text .label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-text .value {
  color: #303133;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 放映卡片公共样式 */
.screen-card {
  height: 680px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

/* 今日放映样式 */
.screening-item {
  margin: 12px 0;
  transition: box-shadow 0.3s;
  position: relative;
}

.screening-item:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.screening-content {
  padding: 20px;
}

.movie-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 15px;
  color: #303133;
}

.screening-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.cinema-info {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #606266;
}

.separator {
  color: #dcdfe6;
  margin: 0 8px;
}

.hall-name {
  color: #909399;
}

.screening-time {
  font-size: 16px;
  color: #409EFF;
  font-weight: 600;
  white-space: nowrap;
}

/* 即将上映样式 */
.upcoming-list {
  height: 580px;
  overflow-y: auto;
  padding-right: 8px;
}

.upcoming-item {
  margin: 12px 0;
  transition: transform 0.3s;
}

.upcoming-item:hover {
  transform: translateX(4px);
}

.movie-content {
  padding: 5px;
}

.movie-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.movie-title {
  font-size: 20px;
  font-weight: 700;
  width: auto;
  margin: 0;
  line-height: 1.3;
}

.movie-meta {
  text-align: right;
  flex-shrink: 0;
}

.movie-actor {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.movie-date {
  font-size: 13px;
  color: #909399;
}

.intro-container {
  text-align: left;
  margin-top: 12px;
}

.intro-label {
  font-weight: 600;
  font-size: 15px;
  color: #606266;
  margin-right: 6px;
}

.intro-content {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分页器样式 */
.el-pagination {
  padding: 12px 0;
}

/* 空状态样式 */
.el-empty {
  padding: 40px 0;
  cursor: pointer;
  transition: opacity 0.3s;
}

.el-empty:hover {
  opacity: 0.8;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
  }

  .stat-card {
    height: 100px;
    margin-bottom: 12px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }

  .stat-text .value {
    font-size: 20px;
  }

  .movie-title {
    font-size: 18px;
  }

  .screening-time {
    font-size: 14px;
  }
}
</style>
