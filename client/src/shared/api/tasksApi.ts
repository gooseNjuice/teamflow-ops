import { baseApi } from './baseApi'
import type { CreateTaskRequest, Task, UpdateTaskRequest } from '../types/task'

type GetTasksRequest = {
  archived?: boolean
  includeArchived?: boolean
}

type TaskListTagId = 'LIST' | 'ARCHIVED' | 'ALL'

function getTaskListTagId(options: GetTasksRequest | void): TaskListTagId {
  if (options?.includeArchived) {
    return 'ALL'
  }

  if (options?.archived) {
    return 'ARCHIVED'
  }

  return 'LIST'
}

const taskListTags = [
  { type: 'Task' as const, id: 'LIST' },
  { type: 'Task' as const, id: 'ARCHIVED' },
  { type: 'Task' as const, id: 'ALL' },
]

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], GetTasksRequest | void>({
      query: (options) => {
        const searchParams = new URLSearchParams()

        if (options?.includeArchived) {
          searchParams.set('includeArchived', 'true')
        } else if (options?.archived) {
          searchParams.set('archived', 'true')
        }

        const queryString = searchParams.toString()

        return queryString ? `/tasks?${queryString}` : '/tasks'
      },
      providesTags: (result, _error, options) => {
        const listTag = { type: 'Task' as const, id: getTaskListTagId(options) }

        return result
          ? [
              ...result.map((task) => ({ type: 'Task' as const, id: task.id })),
              listTag,
            ]
          : [listTag]
      },
    }),
    getTask: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Task', id: 'LIST' },
        { type: 'Task', id: 'ALL' },
      ],
    }),
    updateTask: builder.mutation<Task, UpdateTaskRequest>({
      query: ({ id, ...body }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        ...taskListTags,
      ],
    }),
    archiveTask: builder.mutation<Task, string>({
      query: (id) => ({
        url: `/tasks/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Task', id },
        ...taskListTags,
      ],
    }),
    restoreTask: builder.mutation<Task, string>({
      query: (id) => ({
        url: `/tasks/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Task', id },
        ...taskListTags,
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useArchiveTaskMutation,
  useCreateTaskMutation,
  useGetTaskQuery,
  useGetTasksQuery,
  useRestoreTaskMutation,
  useUpdateTaskMutation,
} = tasksApi
