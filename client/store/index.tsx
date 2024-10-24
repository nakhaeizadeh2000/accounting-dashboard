import { Action, combineReducers, configureStore, ThunkAction } from '@reduxjs/toolkit';
import themeConfigSlice from '@/store/features/theme/themeConfigSlice';
import { baseApi } from './api';
import { authMiddleware } from './redux-middlewares/auth-middleware';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  themeConfig: themeConfigSlice,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, authMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch;
export type IRootState = ReturnType<typeof store.getState>;

// Define the thunk action type
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  IRootState,
  unknown,
  Action<string>
>;

export default store;
