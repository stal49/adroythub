import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  user: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userRegistration: (state, action: PayloadAction<{token: string}>) => {
      state.token = action.payload.token;
    },
    userLoggedIn: (state, action:PayloadAction<{accessToken:string,refreshToken:string,user:string}>) => {
      state.token = action.payload.accessToken;
      console.log(action.payload.accessToken, 'by pratik')
      localStorage.setItem("rt", action.payload.refreshToken);
      state.user = action.payload.user;
    },
    userLoggedOut: (state) => {
      state.token = "";
      state.user = "";
    },
  },
});

export const { userRegistration, userLoggedIn, userLoggedOut } =
  authSlice.actions;

  export default authSlice.reducer;