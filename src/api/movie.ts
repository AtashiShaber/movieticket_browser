import request from '../utils/request'
import type {Movie, MovieDto, MoviePageQueryVO, MoviePreviewDto, PageQuery} from "../type";

// 模糊查询电影并支持分页
export function listMovie(data: MoviePageQueryVO): Promise<Movie>{
    return request({
        url: '/movie/listAdmin',
        method: 'post',
        data
    })
}

// 不返回mid的模糊查询，支持分页
export function listMovieUser(data: MoviePageQueryVO): Promise<MovieDto>{
    return request({
        url: '/movie/list',
        method: 'post',
        data
    })
}

// 获取正在上映的所有电影
export function listMovieUpCast(): Promise<Movie> {
    return request({
        url: '/movie/listUpCast',
        method: 'post'
    })
}

// 修改电影信息
export function updateMovie(data: Movie) {
    return request({
        url: '/movie/update',
        method: 'post',
        data
    })
}

// 删除电影
export function deleteMovie(mid: string) {
    return request({
        url: '/movie/delete',
        method: 'post',
        data: { mid: mid }
    })
}

// 增加电影
export function addMovie(data: MovieDto) : Promise<string> {
    return request({
        url: '/movie/add',
        method: 'post',
        data
    })
}

// 下映电影
export function downCast(mid: string) {
    return request({
        url: '/movie/downcast',
        method: 'post',
        data: { mid: mid }
    })
}

// 电影上映
export function upCast(mid: string) {
    return request({
        url: '/movie/upcast',
        method: 'post',
        data: { mid: mid }
    })
}

// 电影的自动上下映
export function autoDownAndUpCast() {
    return request({
        url: '/movie/auto',
        method: 'post'
    })
}

// 获取今日上映的电影
export function getCast(data: PageQuery): Promise<MoviePreviewDto> {
    return request({
        url: '/movie/getCast',
        method: 'post',
        data
    })
}

// 获取即将上映的电影（七日内）,支持分页
export function getUpComing(data: PageQuery): Promise<Movie> {
    return request({
        url: '/movie/upComing',
        method: 'post',
        data
    })
}
