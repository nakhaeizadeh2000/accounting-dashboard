import { Action, combineReducers, configureStore, ThunkAction } from '@reduxjs/toolkit';
import themeConfigSlice from '@/store/features/theme/themeConfigSlice';
import { baseApi } from './api';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  themeConfig: themeConfigSlice,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
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
