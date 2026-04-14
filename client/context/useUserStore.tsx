import {create} from 'zustand';
import * as api from '../utils/api';
import {User} from "../.expo/types/model";

interface UserStore {
    userData:User|null;
    fetchUserData:()=>Promise<User | null>;
    setBalanceFromSnapshot:(balance:number)=>void;
}

export const useUserStore = create<UserStore>((set) => ({
    userData: null,
    fetchUserData: async () => {
        const {ok, data} = await api.get("/auth/profile");
        if(ok && data){
            const profile = data as User;
            set({userData:profile});
            return profile;
        }
        return null;
    },
    setBalanceFromSnapshot: (balance:number) => {
        set((state) => {
            if (!state.userData) {
                return state;
            }

            return {
                userData: {
                    ...state.userData,
                    balance,
                },
            };
        });
    },
}));
