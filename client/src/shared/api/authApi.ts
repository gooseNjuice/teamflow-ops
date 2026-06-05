import { baseApi } from './baseApi'
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../types/auth'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    getCurrentUser: builder.query<AuthUser, void>({
      query: () => '/auth/me',
    }),
  }),
})

export const {
  useGetCurrentUserQuery,
  useLoginMutation,
  useRegisterMutation,
} = authApi
