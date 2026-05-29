import { baseApi } from './baseApi'
import type { Task } from '../types/task'

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      query: () => '/tasks',
    }),
    getTask: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
    }),
  }),
})

export const { useGetTaskQuery, useGetTasksQuery } = tasksApi
