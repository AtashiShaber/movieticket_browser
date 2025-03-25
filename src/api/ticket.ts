import type {Ticket, TicketAddVO, TicketDto, TicketPageQueryVO} from "../type";
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

// 查询当前放映的票
export function listTicketBySid(sid: string): Promise<Ticket> {
    return request({
        url: '/ticket/listBySid',
        method: 'post',
        data: {
            sid: sid
        }
    })
}

// 票的自动使用
export function autoUseTicket() {
    return request({
        url: '/ticket/autoUse',
        method: 'post'
    })
}