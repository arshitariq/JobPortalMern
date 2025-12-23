import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/modules/auth/store/authSlice";
import employerReducer from "@/modules/employer/store/employerSlice";

export default combineReducers({
  auth: authReducer,
  employer: employerReducer,
});
