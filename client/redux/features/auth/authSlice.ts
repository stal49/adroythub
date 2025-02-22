import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getCookie, setCookie, removeCookie } from "../utils/cookies";

const initialState = {
  token: getCookie("at") || "", 
  user: getCookie("user") ? JSON.parse(getCookie("user") as string) : "", 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userRegistration: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    userLoggedIn: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; user: string }>) => {
      setCookie("at", action.payload.accessToken, 10);
      setCookie("user", JSON.stringify(action.payload.user), 10); 
      state.token = action.payload.accessToken;
      localStorage.setItem("rt", action.payload.refreshToken);
      state.user = action.payload.user;
    },
    userLoggedOut: (state) => {
      removeCookie("at");
      localStorage.removeItem("rt");
      state.token = "";
      state.user = "";
    },
    checkAuth: (state) => {
      const token = getCookie("at");
      if (!token) {
        state.token = "";
        state.user = "";
      }
    },
    updateUserCourses: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          courses: [...state.user.courses, action.payload], // Add new course
        };
        setCookie("user", JSON.stringify(state.user), 10); // Update user in cookies
      }
    },
  },
});

export const { userRegistration, userLoggedIn, userLoggedOut, checkAuth, updateUserCourses } = authSlice.actions;

export default authSlice.reducer;

