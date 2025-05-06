import request from "../utils/request.ts";

export function uploading(data: FormData, type: string) {
    return request({
        url: '/uploading/' + type,
        method: 'post',
        data: data
    })
}