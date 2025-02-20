import { configureStore, combineReducers, Reducer } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { api } from './api/authApi';
import authReducer from '../store/slices/authSlice';
import { marketplaceApi } from './api/marketPlaceApi';
import { knowledgeApi } from './api/knowledgeApi';
import cartReducer from "../store/slices/cart.slice";
import { usersApi } from './api/usersApi';

const persitsConfig = {
  key: 'root',
  storage,
};



const rootReducer: Reducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  [api.reducerPath]: api.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [marketplaceApi.reducerPath]: marketplaceApi.reducer,
  [knowledgeApi.reducerPath]: knowledgeApi.reducer,
});

const persistedReducer = persistReducer(persitsConfig, rootReducer);

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      api.middleware,
      marketplaceApi.middleware,
      knowledgeApi.middleware,
      usersApi.middleware
    ),
});

export const persistor = persistStore(store);
setupListeners(store.dispatch);
