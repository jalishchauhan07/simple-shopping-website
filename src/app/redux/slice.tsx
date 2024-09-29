import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ProductState {
  product: any[];
  category: string[];
  loading: "idle" | "loading";
  error: string | null;
  selectedCategory: string;
}

const initialState: ProductState = {
  product: [],
  category: [],
  loading: "idle",
  error: null,
  selectedCategory: "",
};

const getProducts: any = createAsyncThunk("products/getProducts", async () => {
  const resp = await fetch("https://dummyjson.com/products?limit=50");
  if (!resp.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await resp.json();
  return data.products;
});

const getCategories: any = createAsyncThunk(
  "category/getCategories",
  async () => {
    const resp = await fetch("https://dummyjson.com/products/categories");
    if (!resp.ok) {
      throw new Error("Failed to fetch categories");
    }
    const data = await resp.json();
    return data;
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSelectedCategory(state, action) {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = "idle";
        state.product = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = "idle";
        state.error = action.error.message || "Failed to load products";
      })
      .addCase(getCategories.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = "idle";
        state.category = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = "idle";
        state.error = action.error.message || "Failed to load categories";
      });
  },
});

export const { setSelectedCategory } = productSlice.actions;
export default productSlice.reducer;
export { getProducts, getCategories };
