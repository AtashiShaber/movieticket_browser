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
            this.admin = admin;
        },
    },
});
