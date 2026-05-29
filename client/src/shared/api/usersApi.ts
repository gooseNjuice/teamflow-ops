import { baseApi } from './baseApi'
import type { User } from '../types/user'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
    }),
    getUser: builder.query<User, string>({
      query: (id) => `/users/${id}`,
    }),
  }),
})

export const { useGetUserQuery, useGetUsersQuery } = usersApi
