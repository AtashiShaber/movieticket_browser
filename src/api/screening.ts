import type {Screening, ScreeningDto, ScreeningMovieVO, ScreeningPageQueryVO, ScreeningVO} from "../type";
import request from "../utils/request.ts";


export function listScreening(data: ScreeningPageQueryVO): Promise<ScreeningDto> {
    return request({
        url: '/screening/list',
        method: 'post',
        data
    })
}

// 传入ScreeningVO（实际只需要srid（放映厅id）与sday（放映日期YYYY-MM-DD）的信息即可）获取该天的放映信息
export function listScreeningByCid(data: ScreeningVO): Promise<Screening> {
    return request({
        url: '/screening/listByCid',
        method: 'post',
        data
    })
}

// 获取当前电影的当前日期的放映信息
export function listScreeningByMid(data: ScreeningMovieVO): Promise<ScreeningDto> {
    return request({
        url: '/screening/listByMid',
        method: 'post',
        data
    })
}

export function addScreening(data: ScreeningVO) {
    return request({
        url: '/screening/add',
        method: 'post',
        data
    })
}

export function updateScreening(data: Screening) {
    return request({
        url: '/screening/update',
        method: 'post',
        data
    })
}

export function deleteScreening(sid: string) {
    return request({
        url: '/screening/delete',
        method: 'post',
        data: { sid: sid }
    })
}

// 统计今日放映次数
export function countTodayScreening() : Promise<number> {
    return request({
        url: '/screening/countToday'
    })
}
