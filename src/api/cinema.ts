import type {Cinema, CinemaDto, CinemaPageQueryVO, CinemaVO} from "../type";
import request from "../utils/request.ts";

export function listCinemaAdmin(data: CinemaPageQueryVO): Promise<Cinema> {
    return request({
        url: '/cinema/listAdmin',
        method: 'post',
        data
    })
}

// 获取影院信息
export function listCinema(data: CinemaPageQueryVO): Promise<CinemaDto> {
    return request({
        url: '/cinema/list',
        method: 'post',
        data
    })
}

export function listAllCinema(): Promise<Cinema> {
    return request({
        url: '/cinema/listAll',
        method: 'post'
    })
}

export function addCinema(data: CinemaVO) {
    return request({
        url: '/cinema/add',
        method: 'post',
        data
    })
}

export function updateCinema(data: Cinema) {
    return request({
        url: '/cinema/update',
        method: 'post',
        data
    })
}

export function deleteCinema(cid: string) {
    return request({
        url: '/cinema/delete',
        method: 'post',
        data: { cid: cid }
    })
}
