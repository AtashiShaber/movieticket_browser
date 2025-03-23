import request from '../utils/request'
import type {AdminAddVO, AdminDto, AdminLoginVO, AdminPageQueryVO, Admin, AuthAdminResponse, updateVO} from "../type";

export function adminLogin(data: AdminLoginVO): Promise<AuthAdminResponse> {
    return request({
        url: '/admin/login',
        method: 'post',
        data
    })
}

export function adminRegister(data: AdminAddVO): Promise<null> {
    return request({
        url: '/admin/register',
        method: 'post',
        data
    })
}

export function listAdmin(data: AdminPageQueryVO): Promise<AdminDto[]> {
    return request({
        url: '/admin/list',
        method: 'post',
        data
    })
}

export function updateAdmin(data: Admin) {
    return request({
        url: '/admin/update',
        method: 'post',
        data
    })
}

// 获取当前登录管理员的基础信息
export function basic(data: updateVO): Promise<AdminDto> {
    return request({
        url: '/admin/basic',
        method: 'post',
        data
    })
}

// 修改当期登录管理员的登录密码
export function updatePwd(data: updateVO) {
    return request({
        url: '/admin/updatePwd',
        method: 'post',
        data
    })
}

// 修改当前登录管理员的手机号
export function updatePhone(data: updateVO) {
    return request({
        url: '/admin/updatePhone',
        method: 'post',
        data
    })
}