import { skipToken } from '@reduxjs/toolkit/query'
import { baseApi } from './baseApi'
import type { SearchResult } from '../types/search'

export const emptySearchToken: typeof skipToken = skipToken

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchWorkspace: builder.query<SearchResult[], string>({
      query: (query) => {
        const searchParams = new URLSearchParams({
          q: query.trim(),
        })

        return `/search?${searchParams.toString()}`
      },
    }),
  }),
  overrideExisting: false,
})

export const { useSearchWorkspaceQuery } = searchApi
