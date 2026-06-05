import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getToken } from '../lib/authToken'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = getToken()

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      return headers
    },
  }),
  tagTypes: ['Task'],
  endpoints: () => ({}),
})
