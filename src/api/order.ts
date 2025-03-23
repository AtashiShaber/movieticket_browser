import request from "../utils/request.ts";

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
