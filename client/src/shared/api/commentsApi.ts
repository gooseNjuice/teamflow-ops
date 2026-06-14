import { baseApi } from './baseApi'
import type { CreateTaskCommentRequest, TaskComment } from '../types/comment'

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTaskComments: builder.query<TaskComment[], string>({
      query: (taskId) => `/tasks/${taskId}/comments`,
      providesTags: (result, _error, taskId) => {
        const listTag = { type: 'TaskComment' as const, id: `TASK-${taskId}` }

        return result
          ? [
              ...result.map((comment) => ({
                type: 'TaskComment' as const,
                id: comment.id,
              })),
              listTag,
            ]
          : [listTag]
      },
    }),
    createTaskComment: builder.mutation<TaskComment, CreateTaskCommentRequest>({
      query: ({ taskId, body }) => ({
        url: `/tasks/${taskId}/comments`,
        method: 'POST',
        body: { body },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'TaskComment', id: `TASK-${taskId}` },
        { type: 'TaskActivity', id: `TASK-${taskId}` },
      ],
    }),
  }),
  overrideExisting: false,
})

export const { useCreateTaskCommentMutation, useGetTaskCommentsQuery } = commentsApi
