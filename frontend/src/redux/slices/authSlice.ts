import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IEmployee } from "@/types/IEmployee";
import { Icompany } from "@/types/types";

interface User {
  email: string;
  role: string;
  tenantId: string;
  userData?: Icompany | IEmployee;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
