import { configureStore } from "@reduxjs/toolkit";
import productSlice from "./slice";

const store = configureStore({
  reducer: {
    products: productSlice,
  },
});

export default store;
