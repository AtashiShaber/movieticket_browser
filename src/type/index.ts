import Decimal from "decimal.js";

export interface updateVO {
    oldData: string,
    newData: string
}

// 登录数据
export interface AuthResponse {
    uuid: string,
    userDto: UserDto,
    expires: number
}

export interface AuthAdminResponse {
    uuid: string,
    adminDto: AdminDto,
    expires: number
}

// 分页
export interface PageQuery {
    pageNum: number,
    pageSize: number
}

// 管理员
export interface Admin {
    adminId: string,
    adminName: string,
    adminPwd: string,
    phone: string
}

export interface AdminLoginVO {
    phone: string,
    adminPwd: string
}

export interface AdminDto {
    adminId: string,
    adminName: string,
    phone: string
}

export interface AdminPageQueryVO extends PageQuery{
    adminName?: string,
    phone?: string
}

export interface AdminAddVO {
    adminName: string,
    adminPwd: string,
    phone: string
}

export interface AdminPwdVO extends Admin{
    adminNewPwd: string
}

// 普通用户
export interface User {
    uid: string,
    uname: string,
    upwd: string,
    umoney: Decimal,
    uphone: string
}

export interface UserPwdVO extends User {
    uNewPwd: string
}

export interface UserLoginVO {
    upwd: string,
    uphone: string
}

export interface UserRegisterVO {
    uname: string,
    upwd: string,
    uphone: string
}


export interface UserAddVO{
    uname: string,
    upwd: string,
    uphone: string
}

export interface UserPageQueryVO extends PageQuery{
    uname?: string,
    uphone?: string
}

export interface UserDto {
    uid: string,
    uname: string,
    umoney: Decimal,
    uphone: string
}

// 电影信息
export interface Movie {
    mid: string,
    mname: string,
    mp: string,
    mactor: string,
    mstatus: number,
    mstarttime: Date,
    mendtime: Date
}

export interface MovieDto {
    mname: string,
    mp: string,
    mactor: string,
    mstarttime: Date,
    mendtime: Date
}

export interface MoviePageQueryVO extends PageQuery {
    mname?: string,
    mactor?: string,
    mstatus?: number,
    mstarttime?: Date,
    mendtime?: Date
}

export interface MoviePreviewDto {
    mname: string,
    cname: string,
    srname: string,
    stime: string
}

// Cinema
export interface Cinema {
    cid: string,
    cname: string,
    caddress: string,
    ccall: string
}

export interface CinemaDto {
    cname: string,
    caddress: string,
    ccall: string
}

export interface CinemaVO extends CinemaDto{}

export interface CinemaPageQueryVO extends PageQuery {
    cname?: string,
    caddress?: string,
    ccall?: string
}

// Screening
export interface Screening {
    sid: string,
    mid: string,
    srid: string,
    sday: Date,
    stime: string,
    sprice: Decimal
}

export interface ScreeningDto extends Screening{
    mname: string,
    srname: string,
    cid: string,
    cname: string
}

export interface ScreeningVO {
    mid?: string,
    srid?: string,
    sday?: Date,
    stime?: string,
    sprice?: Decimal
}

export interface ScreeningMovieVO {
    mid: string,
    cid: string,
    sday: Date
}

export interface ScreeningPageQueryVO extends PageQuery {
    mname?: string,
    srname?: string,
    cname?: string,
    sday?: Date,
    stime?: string
}

// screenroom
export interface Screenroom {
    srid: string,
    cid: string,
    srname: string
}

export interface ScreenroomDto extends Screenroom {
    cname: string
}

export interface ScreenroomVO {
    cid: string,
    srname: string
}

export interface ScreenroomPageQueryVO extends PageQuery {
    cname?: string,
    srname?: string
}

// 票务信息相关
// 票的基础信息
export interface Ticket {
    tid: string,
    sid: string,
    tseat: string,
    tstatus: number
}

// 票的模糊查询
export interface TicketPageQueryVO extends PageQuery {
    mname?: string,
    cname?: string,
    srname?: string,
    sday?: Date
}

// 票的返回值信息
export interface TicketDto {
    tid: string,
    mname: string,
    cname: string,
    srname: string,
    sday: Date,
    tseat: string,
    tstatus: number
}

// 添加票的信息
export interface TicketAddVO {
    sid: string,
    tseat: string,
    tstatus: number,
    oprice: Decimal
}

// 订单相关信息
// 订单基础类
export interface Order {
    oid: string,
    uid: string,
    tid: string,
    otime: Date,
    oprice: Decimal,
    ostatus: number
}

// 添加订单
export interface OrderAddVO {
    oprice: Decimal,
    ostatus: number
}

// 订单返回信息
export interface OrderDto {
    oid: string,
    tid: string,
    mname: string,
    otime: Date,
    oprice: Decimal,
    ostatus: number,
    tstatus: number
}

// 支付信息
export interface OrderPayVO {
    oid: string,
    oprice: Decimal
}