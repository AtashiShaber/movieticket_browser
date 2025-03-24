import type {TicketAddVO, TicketDto, TicketPageQueryVO} from "../type";
import request from "../utils/request.ts";

// 创建票务
export function buildTicket(data: TicketAddVO) {
    return request({
        url: '/ticket/build',
        method: 'post',
        data: data
    })
}

// 查询票务
export function listTicket(data: TicketPageQueryVO): Promise<TicketDto> {
    return request({
        url: '/ticket/list',
        method: 'post',
        data: data
    })
}