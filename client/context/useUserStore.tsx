import {create} from 'zustand';
import * as api from '../utils/api';
import {User} from "../.expo/types/model";

interface UserStore {
    userData:User|null;
    fetchUserData:()=>Promise<void>;
    setBalanceFromSnapshot:(balance:number)=>void;
}

export const useUserStore = create<UserStore>((set) => ({
    userData: null,
    fetchUserData: async () => {
        const {ok, data} = await api.get("/auth/profile");
        if(ok){
            set({userData:data});
            console.log(data.id);
        } else {
            console.log("Profile fetch failed:", data);
        }
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
