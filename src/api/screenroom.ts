import type {Screening, ScreeningDto, Screenroom, ScreenroomDto, ScreenroomPageQueryVO, ScreenroomVO} from "../type";
import request from "../utils/request.ts";

export function listScreenroom(data: ScreenroomPageQueryVO): Promise<ScreeningDto> {
    return request({
        url: '/screenroom/list',
        method: 'post',
        data
    })
}

export function addScreenroom(data: ScreenroomVO) {
    return request({
        url: '/screenroom/add',
        method: 'post',
        data
    })
}

export function deleteScreenroom(sid: string) {
    return request({
        url: '/screenroom/delete',
        method: 'post',
        data: { sid: sid }
    })
}

export function updateScreenroom(data: Screenroom) {
    return request({
        url: '/screenroom/update',
        method: 'post',
        data
    })
}

export function listAllScreenroom(): Promise<Screening> {
    return request({
        url: '/screenroom/listAll',
        method: 'post'
    })
}

export function listScreenroomByCid(cid: string): Promise<ScreenroomDto> {
    return request({
        url: '/screenroom/listCid',
        method: 'post',
        data: { cid: cid }
    })
}
