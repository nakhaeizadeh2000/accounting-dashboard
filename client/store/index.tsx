import { Action, combineReducers, configureStore, ThunkAction } from '@reduxjs/toolkit';
import themeConfigSlice from '@/store/features/theme/themeConfigSlice';
import { baseApi } from './api';
import { authMiddleware } from './redux-middlewares/auth-middleware';
import fileUploadReducer from './features/files/progress-slice';
import articleReducer from '@/store/features/article/articleSlice';
import { dropdownReducer } from '@/components/modules/dropdown/store';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  themeConfig: themeConfigSlice,
  upload: fileUploadReducer,
  article: articleReducer,
  dropdowns: dropdownReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, authMiddleware),
  // .concat(uploadProgressMiddleware),
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
