import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Project } from '../shared/types/project'
import type { Task, TaskPriority, TaskStatus } from '../shared/types/task'
import type { User } from '../shared/types/user'
import styles from './TaskForm.module.css'

const taskStatusOptions: TaskStatus[] = [
  'backlog',
  'todo',
  'in-progress',
  'in-review',
  'done',
]

const taskPriorityOptions: TaskPriority[] = ['low', 'medium', 'high']

const taskStatusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To do',
  'in-progress': 'In progress',
  'in-review': 'In review',
  done: 'Done',
}

const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

function isValidDateInput(value: string) {
  if (!value) {
    return true
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return false
  }

  const [, year, month, day] = match
  const date = new Date(`${value}T00:00:00`)

  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  )
}

const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Enter a task title.'),
  description: z.string().trim(),
  status: z
    .string()
    .trim()
    .refine(
      (value): value is TaskStatus => taskStatusOptions.includes(value as TaskStatus),
      'Choose a status.',
    ),
  priority: z
    .string()
    .trim()
    .refine(
      (value): value is TaskPriority =>
        taskPriorityOptions.includes(value as TaskPriority),
      'Choose a priority.',
    ),
  assigneeId: z.string().trim().min(1, 'Choose an assignee.'),
  projectId: z.string().trim().min(1, 'Choose a project.'),
  dueDate: z
    .string()
    .trim()
    .refine((value) => isValidDateInput(value), {
      message: 'Enter a valid due date.',
    }),
})

type TaskFormFieldValues = z.input<typeof taskFormSchema>
export type TaskFormValues = z.output<typeof taskFormSchema>

type TaskFormProps = {
  assignees: User[]
  projects: Project[]
  initialTask?: Task
  onSubmit?: (values: TaskFormValues) => void
  isSubmitting?: boolean
  submitLabel?: string
}

function getDefaultValues(initialTask?: Task): TaskFormFieldValues {
  return {
    title: initialTask?.title ?? '',
    description: initialTask?.description ?? '',
    status: initialTask?.status ?? '',
    priority: initialTask?.priority ?? '',
    assigneeId: initialTask?.assigneeId ?? '',
    projectId: initialTask?.projectId ?? '',
    dueDate: initialTask?.dueDate ?? '',
  }
}

function TaskForm({
  assignees,
  projects,
  initialTask,
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Validate task',
}: TaskFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<TaskFormFieldValues, unknown, TaskFormValues>({
    defaultValues: getDefaultValues(initialTask),
    mode: 'onBlur',
    resolver: zodResolver(taskFormSchema),
  })

  function handleValidSubmit(values: TaskFormValues) {
    onSubmit?.(values)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleValidSubmit)} noValidate>
      <div className={styles.formGrid}>
        <label className={styles.fullWidth} htmlFor="task-form-title">
          Title
          <input
            id="task-form-title"
            type="text"
            aria-invalid={errors.title ? 'true' : 'false'}
            {...register('title')}
          />
          {errors.title ? <span className={styles.error}>{errors.title.message}</span> : null}
        </label>

        <label className={styles.fullWidth} htmlFor="task-form-description">
          Description
          <textarea
            id="task-form-description"
            rows={3}
            aria-invalid={errors.description ? 'true' : 'false'}
            {...register('description')}
          />
          {errors.description ? (
            <span className={styles.error}>{errors.description.message}</span>
          ) : null}
        </label>

        <label htmlFor="task-form-status">
          Status
          <select
            id="task-form-status"
            aria-invalid={errors.status ? 'true' : 'false'}
            {...register('status')}
          >
            <option value="">Select status</option>
            {taskStatusOptions.map((status) => (
              <option key={status} value={status}>
                {taskStatusLabels[status]}
              </option>
            ))}
          </select>
          {errors.status ? (
            <span className={styles.error}>{errors.status.message}</span>
          ) : null}
        </label>

        <label htmlFor="task-form-priority">
          Priority
          <select
            id="task-form-priority"
            aria-invalid={errors.priority ? 'true' : 'false'}
            {...register('priority')}
          >
            <option value="">Select priority</option>
            {taskPriorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {taskPriorityLabels[priority]}
              </option>
            ))}
          </select>
          {errors.priority ? (
            <span className={styles.error}>{errors.priority.message}</span>
          ) : null}
        </label>

        <label htmlFor="task-form-assignee">
          Assignee
          <select
            id="task-form-assignee"
            aria-invalid={errors.assigneeId ? 'true' : 'false'}
            {...register('assigneeId')}
          >
            <option value="">Select assignee</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
          {errors.assigneeId ? (
            <span className={styles.error}>{errors.assigneeId.message}</span>
          ) : null}
        </label>

        <label htmlFor="task-form-project">
          Project
          <select
            id="task-form-project"
            aria-invalid={errors.projectId ? 'true' : 'false'}
            {...register('projectId')}
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.projectId ? (
            <span className={styles.error}>{errors.projectId.message}</span>
          ) : null}
        </label>

        <label htmlFor="task-form-due-date">
          Due date
          <input
            id="task-form-due-date"
            type="date"
            aria-invalid={errors.dueDate ? 'true' : 'false'}
            {...register('dueDate')}
          />
          {errors.dueDate ? (
            <span className={styles.error}>{errors.dueDate.message}</span>
          ) : null}
        </label>
      </div>

      <div className={styles.actions}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
