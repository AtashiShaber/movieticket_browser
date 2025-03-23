<template>
  <div class="home-content">
    <!-- 当前上映轮播图 -->
    <div class="carousel-section">
      <el-carousel
          :interval="5000"
          trigger="hover"
          height="520px"
      >
        <el-carousel-item
            v-for="movie in currentMovies"
            :key="movie.mid"
            class="carousel-item"
        >
          <div class="carousel-container">
            <img
                :src="getHorizonImage(movie.mid)"
                class="carousel-image"
                alt="movie poster"
            />
            <div class="movie-info">
              <h3 class="title">{{ movie.mname }}</h3>
              <p class="actors">{{ movie.mactor }}</p>
              <p class="description">{{ movie.mp }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 即将上映电影 -->
    <div class="upcoming-section">
      <h2 class="section-title">即将上映</h2>
      <div v-if="upcomingMovies.length > 0">
        <el-row :gutter="24">
          <el-col
              v-for="movie in upcomingMovies"
              :key="movie.mid"
              :xs="24"
              :sm="8"
              :md="8"
              :lg="8"
              :xl="8"
          >
            <div class="movie-card">
              <div class="poster-container">
                <img
                    :src="getVerticalImage(movie.mid)"
                    class="movie-image"
                    alt="upcoming movie"
                />
              </div>
              <div class="movie-meta">
                <h4>{{ movie.mname }}</h4>
                <p class="release-date">{{ formatDate(movie.mstarttime) }}</p>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 分页 -->
        <el-pagination
            class="pagination"
            layout="prev, pager, next"
            :page-size="pageSize"
            :total="total"
            @current-change="handlePageChange"
        />
      </div>
      <div v-else class="no-data">
        最近无电影上映
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { getUpComing, listMovieUpCast } from '../../api/movie'
import type { Movie } from '../../type'

export default defineComponent({
  setup() {
    const currentMovies = ref<Movie[]>([])
    const upcomingMovies = ref<Movie[]>([])
    const currentPage = ref(1)
    const pageSize = ref(6)
    const total = ref(0)

    // 获取横向海报
    const getHorizonImage = (mid: string) => {
      try {
        return new URL(`../../assets/Movies/horizon/${mid}.jpg`, import.meta.url).href
      } catch {
        return '' // 可设置默认图片
      }
    }

    // 获取竖向海报
    const getVerticalImage = (mid: string) => {
      try {
        return new URL(`../../assets/Movies/vertical/${mid}.jpg`, import.meta.url).href
      } catch {
        return '' // 可设置默认图片
      }
    }

    const loadCurrentMovies = async () => {
      try {
        const res = await listMovieUpCast()
        currentMovies.value = res || [] // 根据实际API结构调整
      } catch (error) {
        console.error('加载当前上映电影失败:', error)
        currentMovies.value = []
      }
    }

    const loadUpcomingMovies = async () => {
      try {
        const res = await getUpComing({
          pageNum: currentPage.value,
          pageSize: pageSize.value
        })
        upcomingMovies.value = res.list || [] // 根据实际API结构调整
        total.value = res.total || 0
      } catch (error) {
        console.error('加载即将上映电影失败:', error)
        upcomingMovies.value = []
      }
    }

    const handlePageChange = (newPage: number) => {
      currentPage.value = newPage
      loadUpcomingMovies()
    }

    const formatDate = (dateStr: Date) => {
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    }

    onMounted(() => {
      loadCurrentMovies()
      loadUpcomingMovies()
    })

    return {
      currentMovies,
      upcomingMovies,
      currentPage,
      pageSize,
      total,
      handlePageChange,
      formatDate,
      getHorizonImage,
      getVerticalImage
    }
  }
})
</script>

<style scoped lang="scss">
.home-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 轮播图样式 */
.carousel-section {
  margin-bottom: 60px;

  :deep(.el-carousel) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

    .el-carousel__container {
      height: 520px !important;
    }

    .el-carousel__indicators {
      bottom: 2px;
    }

    .el-carousel__button {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
  }

  .carousel-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
  }

  .movie-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 32px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    color: white;
    z-index: 2;

    .title {
      margin: 0 0 12px;
      font-size: 28px;
      font-weight: 600;
      line-height: 1.2;
    }

    .actors {
      margin: 0 0 8px;
      font-size: 16px;
      opacity: 0.9;
    }

    .description {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      opacity: 0.85;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}

/* 即将上映样式 */
.upcoming-section {
  margin-top: 60px;

  .section-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    border-left: 4px solid #409eff;
    padding-left: 16px;
    margin-bottom: 32px;
  }

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
      padding-top: 177.78%; /* 9:16 比例 */
    }

    .movie-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
    }

    .movie-meta {
      padding: 16px;

      h4 {
        margin: 0 0 6px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
        line-height: 1.2;
      }

      .release-date {
        margin: 0;
        font-size: 13px;
        color: #666;
      }
    }
  }
}

/* 分页样式 */
.pagination {
  margin-top: 40px;
  justify-content: center;
}

/* 空状态 */
.no-data {
  text-align: center;
  color: #999;
  padding: 40px 0;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .carousel-section {
    :deep(.el-carousel) {
      .el-carousel__container {
        height: 480px !important;
      }

      .movie-info {
        padding: 24px;

        .title {
          font-size: 24px;
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .carousel-section {
    :deep(.el-carousel) {
      .el-carousel__container {
        height: 400px !important;
      }

      .movie-info {
        padding: 20px;

        .title {
          font-size: 20px;
        }

        .actors {
          font-size: 14px;
        }

        .description {
          font-size: 13px;
        }
      }
    }
  }

  .upcoming-section {
    .movie-card {
      .movie-meta {
        h4 {
          font-size: 14px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .carousel-section {
    :deep(.el-carousel) {
      .el-carousel__container {
        height: 360px !important;
      }

      .movie-info {
        padding: 16px;

        .title {
          font-size: 18px;
        }

        .description {
          display: none;
        }
      }
    }
  }

  .upcoming-section {
    .movie-card {
      .poster-container {
        padding-top: 150%;
      }

      .movie-meta {
        padding: 12px;
      }
    }
  }
}

@media (max-width: 576px) {
  .home-content {
    padding: 24px 12px;
  }

  .carousel-section {
    :deep(.el-carousel) {
      .el-carousel__container {
        height: 280px !important;
      }

      .movie-info {
        padding: 12px;

        .title {
          font-size: 16px;
        }
      }
    }
  }

  .upcoming-section {
    .movie-card {
      .poster-container {
        padding-top: 120%;
      }
    }
  }
}
</style>
