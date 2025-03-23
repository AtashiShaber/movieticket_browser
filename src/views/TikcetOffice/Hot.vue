<template>
  <div class="hot-showing">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
          v-model="searchQuery"
          placeholder="输入电影名或演员进行搜索"
          clearable
          @keyup.enter="handleSearch"
          class="search-input"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 电影列表 -->
    <div class="movie-list">
      <el-row v-loading="loading" :gutter="24">
        <el-col
            v-for="movie in movieList"
            :key="movie.mid"
            :xs="24"
            :sm="6"
            :md="6"
            :lg="6"
            :xl="6"
        >
          <div class="movie-card">
            <div class="poster-container">
              <img
                  :src="getVerticalImage(movie.mid)"
                  class="movie-image"
                  alt="movie poster"
              />
            </div>
            <div class="movie-meta">
              <h4 class="title">{{ movie.mname }}</h4>
              <p class="actors">{{ movie.mactor }}</p>
              <p class="showtime">{{ formatDate(movie.mstarttime) }} 上映</p>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <div v-if="!loading && movieList.length === 0" class="no-data">
        未找到相关电影
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
            background
            layout="prev, pager, next"
            :page-size="pageSize"
            :total="total"
            @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { listMovie } from '../../api/movie'
import type { Movie, MoviePageQueryVO } from '../../type'

export default defineComponent({
  setup() {
    const movieList = ref<Movie[]>([])
    const loading = ref(false)
    const searchQuery = ref('')
    const currentPage = ref(1)
    const pageSize = 16
    const total = ref(0)

    // 获取竖向海报
    const getVerticalImage = (mid: string) => {
      try {
        return new URL(`/src/assets/Movies/vertical/${mid}.jpg`, import.meta.url).href
      } catch {
        return '' // 可设置默认图片
      }
    }

    // 日期格式化
    const formatDate = (dateStr: Date) => {
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    }

    // 获取电影数据
    const loadMovies = async () => {
      try {
        loading.value = true
        const params: MoviePageQueryVO = {
          pageNum: currentPage.value,
          pageSize: pageSize,
          mstatus: 1,
          mname: searchQuery.value,
          mactor: searchQuery.value
        }

        const res = await listMovie(params)
        movieList.value = res.list || []
        total.value = res.total || 0
      } catch (error) {
        console.error('加载数据失败:', error)
        movieList.value = []
      } finally {
        loading.value = false
      }
    }

    // 处理搜索
    const handleSearch = () => {
      currentPage.value = 1
      loadMovies()
    }

    // 处理分页
    const handlePageChange = (newPage: number) => {
      currentPage.value = newPage
      loadMovies()
    }

    onMounted(() => {
      loadMovies()
    })

    return {
      movieList,
      loading,
      searchQuery,
      currentPage,
      pageSize,
      total,
      getVerticalImage,
      formatDate,
      handleSearch,
      handlePageChange
    }
  }
})
</script>

<style scoped lang="scss">
.hot-showing {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

  .search-bar {
    margin-bottom: 40px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    .search-input {
      :deep(.el-input-group__append) {
        background-color: var(--el-color-primary);
        color: white;
      }
    }
  }

  .movie-list {
    min-height: 600px;
    position: relative;

    .movie-card {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      margin-bottom: 24px;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      }

      .poster-container {
        position: relative;
        width: 100%;
        padding-top: 142%; // 7:10比例

        .movie-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }
      }

      .movie-meta {
        padding: 16px;
        text-align: center;

        .title {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .actors {
          margin: 0 0 8px;
          font-size: 12px;
          color: #666;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .showtime {
          margin: 0;
          font-size: 12px;
          color: var(--el-color-primary);
          font-weight: 500;
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
    text-align: center;
    color: #999;
    padding: 60px 0;
    background: #f8f9fa;
    border-radius: 8px;
  }
}

@media (max-width: 992px) {
  .hot-showing {
    padding: 24px 12px;

    .movie-card {
      .movie-meta {
        padding: 12px;

        .title {
          font-size: 14px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .hot-showing {
    .movie-list {
      .el-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>
