import { baseApi } from './baseApi'
import type { Project } from '../types/project'

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
    }),
    getProject: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
    }),
  }),
})

export const { useGetProjectQuery, useGetProjectsQuery } = projectsApi
