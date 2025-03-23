// api/auth.ts
import axios from '../utils/request';
import type {AdminDto, LoginForm, UserDto} from "../type";

interface LoginResponse {
    uuid: string;
    userInfo: UserDto | AdminDto;
}

export const login = (form: LoginForm) =>
    axios.post<LoginResponse>('/user/login', form);

export const adminLogin = (form: LoginForm) =>
    axios.post<LoginResponse>('/admin/login', form);

export const refreshToken = (oldUuid: string) =>
    axios.post<{ newUuid: string }>('/api/auth/refresh', { oldUuid });
