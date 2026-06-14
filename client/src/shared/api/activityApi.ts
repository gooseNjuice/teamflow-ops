import { baseApi } from './baseApi'
import type { TaskActivity } from '../types/activity'

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTaskActivity: builder.query<TaskActivity[], string>({
      query: (taskId) => `/tasks/${taskId}/activity`,
      providesTags: (result, _error, taskId) => {
        const listTag = { type: 'TaskActivity' as const, id: `TASK-${taskId}` }

        return result
          ? [
              ...result.map((activity) => ({
                type: 'TaskActivity' as const,
                id: activity.id,
              })),
              listTag,
            ]
          : [listTag]
      },
    }),
  }),
  overrideExisting: false,
})

export const { useGetTaskActivityQuery } = activityApi
