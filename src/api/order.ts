import request from "../utils/request.ts";
import type {OrderAddVO, OrderDto, PageQuery} from "../type";

// 统计今日售票数
export function countToday() : Promise<number> {
    return request({
        url: '/order/countToday',
        method: 'post'
    })
}

// 统计今日销售额
export function countTodaySales() : Promise<number> {
    return request({
        url: '/order/countTodaySales',
        method: 'post'
    })
}

// 统计今日退票率
export function refundRate() {
    return request({
        url: '/order/refundRate',
        method: 'post'
    })
}

// 查询订单
export function listOrder(data: PageQuery): Promise<OrderDto> {
    return request({
        url: '/order/list',
        method: 'post',
        data: data
    })
}

// 添加订单
export function buildOrder(data: OrderAddVO) {
    return request({
        url: '/order/build',
        method: 'post',
        data: data
    })
}

// 支付
export function payOrder(data: OrderAddVO) {
    return request({
        url: '/order/pay',
        method: 'post',
        data: data
    })
}