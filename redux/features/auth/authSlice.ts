import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getCookie, setCookie, removeCookie } from "../utils/cookies";

const initialState = {
  token: getCookie("at") || "",
  user: getCookie("user") ? JSON.parse(getCookie("user") as string) : "",
  activationToken: getCookie("activation_token") || "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userRegistration: (state, action: PayloadAction<{ token: string }>) => {
      // Short-lived cookie so the activation token survives a refresh/new tab;
      // matches the backend's 5m ACTIVATION_SECRET JWT expiry.
      setCookie("activation_token", action.payload.token, 10 / (24 * 60));
      state.activationToken = action.payload.token;
    },
    clearActivationToken: (state) => {
      removeCookie("activation_token");
      state.activationToken = "";
    },

    userLoggedIn: (state, action: PayloadAction<{ accessToken: string; user: string }>) => {
      setCookie("at", action.payload.accessToken, 10);
      setCookie("user", JSON.stringify(action.payload.user), 10); 
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
    },
    userLoggedOut: (state) => {
      removeCookie("at");
      removeCookie("user");
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

export const { userRegistration, clearActivationToken, userLoggedIn, userLoggedOut, checkAuth, updateUserCourses } = authSlice.actions;

export default authSlice.reducer;

