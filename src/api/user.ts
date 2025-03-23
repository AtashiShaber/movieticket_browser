import request from '../utils/request'
import type {AuthResponse, updateVO, UserDto, UserLoginVO, UserPageQueryVO, UserRegisterVO} from "../type";
import Decimal from "decimal.js";

export function login(data: UserLoginVO): Promise<AuthResponse> {
    return request({
        url: '/user/login',
        method: 'post',
        data
    })
}

export function register(data: UserRegisterVO): Promise<null> {
    return request({
        url: '/user/register',
        method: 'post',
        data
    })
}

export function listUser(data: UserPageQueryVO): Promise<UserDto> {
    return request({
        url: '/user/list',
        method: 'post',
        data
    })
}

export function updateUser(data: UserDto): Promise<null> {
    return request({
        url: '/user/update',
        method: 'post',
        data
    })
}

export function deleteUser(uid: string): Promise<any> {
    return request({
        url: '/user/delete',
        method: 'post',
        data: { uid: uid }
    })
}

// 获取当前登录用户的基础信息
export function basic(data: updateVO): Promise<UserDto> {
    return request({
        url: '/user/basic',
        method: 'post',
        data
    })
}

// 当前用户的密码修改
export function updatePwd(data: updateVO) {
    return request({
        url: '/user/updatePwd',
        method: 'post',
        data
    })
}

// 当前用户的手机号修改
export function updatePhone(data: updateVO) {
    return request({
        url: '/user/updatePhone',
        method: 'post',
        data
    })
}

// 充值api
export function recharge(money: Decimal) {
    return request({
        url: '/user/recharge',
        method: 'post',
        data: { money: money }
    })
}