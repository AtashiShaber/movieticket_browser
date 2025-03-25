<template>
  <div class="hot-container">
    <!-- 电影列表 -->
    <div class="movie-scroll-wrapper">
      <ul class="movie-list">
        <li
            v-for="movie in movies"
            :key="movie.mid"
            class="movie-item"
            :class="{ 'active-movie': selectedMovie === movie.mid }"
            @click="selectMovie(movie.mid)"
        >
          <img
              :src="getMovieImage(movie.mid)"
              :alt="movie.mname"
              class="movie-poster"
          >
          <div class="movie-title">{{ movie.mname }}</div>
        </li>
      </ul>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <div class="date-selector">
        <el-radio-group v-model="selectedDate" @change="handleDateChange">
          <el-radio-button
              v-for="(date, index) in dateOptions"
              :key="index"
              :label="date.value"
          >
            {{ date.label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="cinema-selector">
        <el-select
            v-model="selectedCinema"
            placeholder="选择影院"
            @change="handleCinemaChange"
            clearable
            style="width: 240px"
        >
          <el-option
              v-for="cinema in cinemas"
              :key="cinema.cid"
              :label="cinema.cname"
              :value="cinema.cid"
          />
        </el-select>
      </div>
    </div>

    <!-- 场次列表 -->
    <div class="screening-section">
      <el-empty
          v-if="filteredScreenings.length === 0"
          description="暂无放映信息"
          :image-size="100"
      />
      <div v-else class="screening-grid">
        <el-card
            v-for="screening in filteredScreenings"
            :key="screening.sid"
            class="screening-card"
        >
          <template #header>
            <div class="screening-header">
              <span class="movie-name">{{ screening.mname }}</span>
              <div class="screening-info">
                <el-tag type="warning" size="small">{{ screening.srname }}</el-tag>
                <span class="screening-time">{{ screening.stime }}</span>
              </div>
            </div>
          </template>
          <div class="screening-body">
            <div class="price-section">
              <span class="price-label">票价：</span>
              <span class="price-value">¥{{ screening.sprice.toFixed(2) }}</span>
            </div>
            <el-button
                type="primary"
                size="small"
                @click="openSeatSelection(screening)"
            >
              立即选座
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 选座对话框 -->
    <el-dialog
        v-model="seatDialogVisible"
        :title="`${selectedScreening?.mname} - 选择座位`"
        width="800px"
    >
      <div class="seat-map-container">
        <div class="screen-indicator">银幕位置</div>
        <div class="seat-map">
          <div
              v-for="row in 9"
              :key="row"
              class="seat-row"
          >
            <span class="row-number">{{ row.toString().padStart(2, '0') }}</span>
            <el-button
                v-for="col in 9"
                :key="col"
                :type="getSeatStatus(row, col)"
                :disabled="isSeatOccupied(row, col)"
                @click="selectSeat(row, col)"
                class="seat-button"
            >
              {{ col.toString().padStart(2, '0') }}
            </el-button>
          </div>
        </div>
        <div class="seat-legend">
          <div class="legend-item">
            <div class="seat-sample available"></div>
            <span>可选</span>
          </div>
          <div class="legend-item">
            <div class="seat-sample selected"></div>
            <span>已选</span>
          </div>
          <div class="legend-item">
            <div class="seat-sample occupied"></div>
            <span>已售</span>
          </div>
        </div>
        <div class="selection-tip">* 每次只能选择一个座位</div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <div class="selected-info">已选座位：{{ selectedSeat || '无' }}</div>
          <div class="action-buttons">
            <el-button @click="seatDialogVisible = false">取消</el-button>
            <el-button
                type="primary"
                :disabled="!selectedSeat"
                @click="handlePayment"
            >
              确认支付（¥{{ totalPrice }}）
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 支付确认对话框 -->
    <el-dialog
        v-model="paymentDialogVisible"
        title="确认支付"
        width="500px"
    >
      <div class="payment-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="电影名称">{{ selectedScreening?.mname }}</el-descriptions-item>
          <el-descriptions-item label="放映时间">
            {{ formatDate(selectedScreening?.sday) }} {{ selectedScreening?.stime }}
          </el-descriptions-item>
          <el-descriptions-item label="座位号">{{ selectedSeat }}</el-descriptions-item>
          <el-descriptions-item label="总金额">
            <span class="price">¥{{ totalPrice }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="paymentDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="confirmPayment"
            :loading="paymentLoading"
        >
          立即支付
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import type {
  Movie,
  Cinema,
  ScreeningDto,
  ScreeningMovieVO,
} from '../../type'
import { listScreeningByMid } from "../../api/screening.ts"
import { buildTicket, listTicketBySid } from "../../api/ticket.ts"
import {  payOrder } from "../../api/order.ts"
import { listMovieUpCast } from "../../api/movie.ts"
import { listAllCinema } from "../../api/cinema.ts"

// 响应式状态
const movies = ref<Movie[]>([])
const cinemas = ref<Cinema[]>([])
const screenings = ref<ScreeningDto[]>([])
const occupiedSeats = ref<string[]>([])
const seatDialogVisible = ref(false)

// 选中状态
const selectedMovie = ref<string>('')
const selectedCinema = ref<string>('')
const selectedDate = ref<string>('')
const selectedScreening = ref<ScreeningDto>()
const selectedSeat = ref<string>('')

// 支付相关状态
const paymentDialogVisible = ref(false)
const paymentLoading = ref(false)

// 计算属性
const dateOptions = computed(() => {
  const base = dayjs()
  return [
    { label: '今日', value: base.format('YYYY-MM-DD') },
    { label: '明日', value: base.add(1, 'day').format('YYYY-MM-DD') },
    { label: '后日', value: base.add(2, 'day').format('YYYY-MM-DD') }
  ]
})

const filteredScreenings = computed(() => {
  return screenings.value.filter(s =>
      dayjs(s.sday).isAfter(dayjs().subtract(1, 'day')) &&
      s.cid === selectedCinema.value &&
      s.mid === selectedMovie.value
  )
})

const totalPrice = computed(() => {
  return selectedScreening.value?.sprice?.toFixed(2) || '0.00'
})

// 方法
const getMovieImage = (mid: string) => {
  return new URL(`../../assets/Movies/vertical/${mid}.jpg`, import.meta.url).href
}

const formatTime = (time: string) => {
  return dayjs(time).format('HH:mm')
}

const formatDate = (dateStr?: string) => {
  return dayjs(dateStr).format('YYYY-MM-DD')
}

const selectMovie = (mid: string) => {
  selectedMovie.value = mid
  if (selectedCinema.value) loadScreenings()
}

const handleCinemaChange = () => {
  screenings.value = []
  if (selectedMovie.value) loadScreenings()
}

const handleDateChange = () => {
  screenings.value = []
  if (selectedMovie.value && selectedCinema.value) {
    loadScreenings()
  }
}

const loadScreenings = async () => {
  try {
    if (!selectedMovie.value || !selectedCinema.value) return

    const params: ScreeningMovieVO = {
      mid: selectedMovie.value,
      cid: selectedCinema.value,
      sday: selectedDate.value
    }

    const res = await listScreeningByMid(params)
    screenings.value = res
  } catch (error) {
    ElMessage.error('场次加载失败')
  }
}

const openSeatSelection = async (screening: ScreeningDto) => {
  try {
    const res = await listTicketBySid(screening.sid)
    occupiedSeats.value = res.map(t => t.tseat) || []

    selectedScreening.value = screening
    selectedSeat.value = ''
    seatDialogVisible.value = true
  } catch (error) {
    ElMessage.error('座位信息加载失败')
  }
}

const getSeatNumber = (row: number, col: number) => {
  return `${row.toString().padStart(2, '0')}${col.toString().padStart(2, '0')}`
}

const isSeatOccupied = (row: number, col: number) => {
  return occupiedSeats.value.includes(getSeatNumber(row, col))
}

const getSeatStatus = (row: number, col: number) => {
  const seat = getSeatNumber(row, col)
  if (isSeatOccupied(row, col)) return 'info'
  return seat === selectedSeat.value ? 'success' : 'primary'
}

const selectSeat = (row: number, col: number) => {
  const seat = getSeatNumber(row, col)
  selectedSeat.value = selectedSeat.value === seat ? '' : seat
}

const handlePayment = () => {
  paymentDialogVisible.value = true
}

const confirmPayment = async () => {
  paymentLoading.value = true
  if (!selectedScreening.value || !selectedSeat.value) return
  buildTicket({
    sid: selectedScreening.value.sid,
    tseat: selectedSeat.value,
    tstatus: 0,
    oprice: new Decimal(totalPrice.value)
  }).then(() =>  {
    ElMessage.success('支付成功')
    paymentDialogVisible.value = false
    seatDialogVisible.value = false
    loadScreenings()
  }).catch((error) => {
    ElMessage.error('支付失败:' + error)
  }).finally(() => {
    paymentLoading.value = false
  })
}

// 初始化
onMounted(async () => {
  try {
    const [movieRes, cinemaRes] = await Promise.all([
      listMovieUpCast(),
      listAllCinema()
    ])

    movies.value = movieRes || []
    cinemas.value = cinemaRes || []
    selectedDate.value = dateOptions.value[0].value

    // 默认选择第一个电影和影院
    if (movies.value.length > 0) {
      selectedMovie.value = movies.value[0].mid
    }
    if (cinemas.value.length > 0) {
      selectedCinema.value = cinemas.value[0].cid
    }
  } catch (error) {
    ElMessage.error('数据加载失败')
  }
})
</script>

<style scoped>
.hot-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.movie-scroll-wrapper {
  overflow-x: auto;
  padding-bottom: 15px;
}

.movie-list {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}

.movie-item {
  flex: 0 0 180px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.movie-item:hover {
  transform: translateY(-5px);
}

.active-movie {
  border: 2px solid var(--el-color-primary);
}

.movie-poster {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.movie-title {
  padding: 12px;
  font-size: 14px;
  text-align: center;
  background: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #000;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  align-items: center;
  flex-wrap: wrap;
}

.date-selector {
  min-width: 300px;
}

.cinema-selector {
  flex: 0 0 240px;
}

.screening-section {
  min-height: 400px;
}

.screening-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.screening-card {
  transition: box-shadow 0.3s;
}

.screening-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.screening-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.movie-name {
  font-weight: 500;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.screening-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.screening-time {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.price-section {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 12px;
}

.price-label {
  color: var(--el-text-color-secondary);
}

.price-value {
  color: var(--el-color-primary);
  font-size: 18px;
  font-weight: 500;
}

.seat-map-container {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  position: relative;
}

.screen-indicator {
  text-align: center;
  padding: 12px;
  margin-bottom: 20px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 4px;
  font-weight: 500;
}

.seat-map {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.row-number {
  width: 40px;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.seat-button {
  min-width: 40px;
  height: 32px;
  padding: 0 5px;
  border-radius: 4px;
  transition: all 0.2s;
}

.seat-button.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.seat-legend {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seat-sample {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.available {
  background: var(--el-color-primary);
}

.selected {
  background: var(--el-color-success);
}

.occupied {
  background: var(--el-color-info-light-5);
}

.selection-tip {
  margin-top: 16px;
  color: var(--el-color-danger);
  text-align: center;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-info {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.price {
  color: var(--el-color-primary);
  font-size: 24px;
  font-weight: 500;
}

.payment-content {
  line-height: 1.8;
}
</style>