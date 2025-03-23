<template>
  <div class="cinema-page">
    <!-- 搜索栏 -->
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8" :md="8" :lg="8">
          <div class="search-item">
            <el-input
                v-model="searchName"
                placeholder="影院名称"
                clearable
                @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><OfficeBuilding /></el-icon>
              </template>
            </el-input>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8" :md="8" :lg="8">
          <div class="search-item">
            <el-input
                v-model="searchAddress"
                placeholder="影院地址"
                clearable
                @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Location /></el-icon>
              </template>
            </el-input>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8" :md="8" :lg="8">
          <div class="search-item">
            <el-input
                v-model="searchPhone"
                placeholder="联系电话"
                clearable
                @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </div>
        </el-col>
      </el-row>
      <div class="search-action">
        <el-button
            type="primary"
            @click="handleSearch"
            :icon="Search"
            class="search-btn"
        >
          立即搜索
        </el-button>
      </div>
    </div>

    <!-- 影院列表 -->
    <div class="cinema-list">
      <el-row v-loading="loading" :gutter="24">
        <el-col
            v-for="cinema in cinemaList"
            :xs="24"
            :sm="12"
            :md="12"
            :lg="12"
            :xl="12"
        >
          <div class="cinema-card">
            <div class="cinema-info">
              <div class="header">
                <h3 class="name">{{ cinema.cname }}</h3>
                <el-tag effect="light" type="success" size="small">
                  <el-icon><Star /></el-icon>
                  加盟店
                </el-tag>
              </div>
              <div class="details">
                <div class="info-item">
                  <el-icon><Location /></el-icon>
                  <span class="text">{{ cinema.caddress }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Phone /></el-icon>
                  <a :href="`tel:${cinema.ccall}`" class="phone-link">
                    {{ cinema.ccall }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <div v-if="!loading && cinemaList.length === 0" class="no-data">
        <el-empty description="暂无相关影院信息" />
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
            background
            :page-size="pageSize"
            :total="total"
            :current-page="currentPage"
            layout="prev, pager, next, jumper"
            @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import {
  Star,
  OfficeBuilding,
  Location,
  Phone,
  Search
} from '@element-plus/icons-vue'
import { listCinema } from '../../api/cinema'
import type { CinemaDto, CinemaPageQueryVO } from '../../type'

export default defineComponent({
  components: { Star },
  setup() {
    const cinemaList = ref<CinemaDto[]>([])
    const loading = ref(false)
    const searchName = ref('')
    const searchAddress = ref('')
    const searchPhone = ref('')
    const currentPage = ref(1)
    const pageSize = 6
    const total = ref(0)

    const loadCinemas = async () => {
      try {
        loading.value = true
        const params: CinemaPageQueryVO = {
          pageNum: currentPage.value,
          pageSize: pageSize,
          cname: searchName.value,
          caddress: searchAddress.value,
          ccall: searchPhone.value
        }

        const res = await listCinema(params)
        cinemaList.value = res.list || []
        total.value = res.total || 0
      } catch (error) {
        console.error('加载数据失败:', error)
        cinemaList.value = []
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadCinemas()
    }

    const handlePageChange = (newPage: number) => {
      currentPage.value = newPage
      loadCinemas()
    }

    onMounted(() => {
      loadCinemas()
    })

    return {
      cinemaList,
      loading,
      searchName,
      searchAddress,
      searchPhone,
      currentPage,
      pageSize,
      total,
      Star,
      OfficeBuilding,
      Location,
      Phone,
      Search,
      handleSearch,
      handlePageChange
    }
  }
})
</script>

<style scoped lang="scss">
.cinema-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;

  .search-section {
    margin-bottom: 40px;
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);

    .search-item {
      margin-bottom: 16px;

      :deep(.el-input) {
        .el-input__wrapper {
          background: #f8fafc;
          padding: 0 16px;

          .el-icon {
            color: #64748b;
            margin-right: 8px;
          }
        }
      }
    }

    .search-action {
      text-align: center;
      margin-top: 16px;

      .search-btn {
        width: 200px;
        height: 40px;
        font-weight: 500;
        letter-spacing: 1px;
      }
    }
  }

  .cinema-list {
    .cinema-card {
      background: #fff;
      border-radius: 12px;
      margin-bottom: 24px;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
      }

      .cinema-info {
        padding: 24px;

        .header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          .name {
            margin: 0 12px 0 0;
            font-size: 18px;
            color: #1e293b;
            font-weight: 600;
          }

          .el-tag {
            border-radius: 6px;
            padding: 0 8px;
            height: 26px;

            .el-icon {
              margin-right: 4px;
            }
          }
        }

        .details {
          .info-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;

            .el-icon {
              color: #64748b;
              font-size: 16px;
              margin-right: 12px;
            }

            .text {
              color: #475569;
              line-height: 1.5;
            }

            .phone-link {
              color: #3b82f6;
              text-decoration: none;
              transition: color 0.3s;

              &:hover {
                color: #2563eb;
                text-decoration: underline;
              }
            }
          }
        }
      }
    }
  }

  .pagination-wrapper {
    margin-top: 40px;
    display: flex;
    justify-content: center;
  }

  .no-data {
    padding: 40px 0;
    background: #fff;
    border-radius: 12px;
  }
}

@media (max-width: 768px) {
  .cinema-page {
    padding: 20px 12px;

    .search-section {
      padding: 16px;

      .search-item {
        margin-bottom: 12px;
      }

      .search-btn {
        width: 100%;
      }
    }

    .cinema-card {
      .cinema-info {
        padding: 16px !important;

        .header {
          flex-wrap: wrap;

          .name {
            font-size: 16px !important;
            margin-bottom: 8px;
          }
        }

        .details {
          .info-item {
            font-size: 13px !important;
          }
        }
      }
    }
  }
}
</style>
