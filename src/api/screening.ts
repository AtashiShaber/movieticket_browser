import type {Screening, ScreeningDto, ScreeningPageQueryVO, ScreeningVO} from "../type";
import request from "../utils/request.ts";


export function listScreening(data: ScreeningPageQueryVO): Promise<ScreeningDto> {
    return request({
        url: '/screening/list',
        method: 'post',
        data
    })
}

export function listScreeningByCid(data: ScreeningVO): Promise<Screening> {
    return request({
        url: '/screening/listByCid',
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
