import { defineStore } from "pinia";
import type { UserDto,AdminDto } from "../type";

export const useUserStore = defineStore("user", {
    state: () => ({
        user: {} as UserDto,
    }),
    getters: {
        getUserName(): string {
            return this.user.uname
        }
    },
    actions: {
        setUser(user: UserDto) {
            // 将user的名字存入本地
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("uname", user.uname);
            this.user = user;
        },
    },
});

export const useAdminStore = defineStore("admin", {
    state: () => ({
        admin: {} as AdminDto,
    }),
    getters: {
        getAdminName(): string {
            return this.admin.adminName
        }
    },
    actions: {
        setAdmin(admin: AdminDto) {
            // 将admin的名字存入本地
            localStorage.setItem("admin", JSON.stringify(admin));
            localStorage.setItem("adminName", admin.adminName);
            this.admin = admin;
        },
    },
});
