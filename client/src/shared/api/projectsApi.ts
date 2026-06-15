import { baseApi } from './baseApi'
import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from '../types/project'

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: (result) =>
        result
          ? [
              ...result.map((project) => ({
                type: 'Project' as const,
                id: project.id,
              })),
              { type: 'Project' as const, id: 'LIST' },
            ]
          : [{ type: 'Project' as const, id: 'LIST' }],
    }),
    getProject: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result) => [
        { type: 'Project', id: 'LIST' },
        ...(result ? [{ type: 'Project' as const, id: result.id }] : []),
      ],
    }),
    updateProject: builder.mutation<Project, UpdateProjectRequest>({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useCreateProjectMutation,
  useGetProjectQuery,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} = projectsApi
