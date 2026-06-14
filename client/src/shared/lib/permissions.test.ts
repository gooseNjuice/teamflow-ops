import { describe, expect, it } from 'vitest'
import {
  canArchiveTask,
  canCommentOnTask,
  canCreateTask,
  canEditTask,
  canRestoreTask,
} from './permissions'

describe('task permission helpers', () => {
  it('allows admins and managers to manage and archive tasks', () => {
    expect(canCreateTask('admin')).toBe(true)
    expect(canEditTask('admin')).toBe(true)
    expect(canCommentOnTask('admin')).toBe(true)
    expect(canArchiveTask('admin')).toBe(true)
    expect(canRestoreTask('admin')).toBe(true)

    expect(canCreateTask('manager')).toBe(true)
    expect(canEditTask('manager')).toBe(true)
    expect(canCommentOnTask('manager')).toBe(true)
    expect(canArchiveTask('manager')).toBe(true)
    expect(canRestoreTask('manager')).toBe(true)
  })

  it('allows developers to create and edit tasks only', () => {
    expect(canCreateTask('developer')).toBe(true)
    expect(canEditTask('developer')).toBe(true)
    expect(canCommentOnTask('developer')).toBe(true)
    expect(canArchiveTask('developer')).toBe(false)
    expect(canRestoreTask('developer')).toBe(false)
  })

  it('keeps viewers and missing roles read-only', () => {
    expect(canCreateTask('viewer')).toBe(false)
    expect(canEditTask('viewer')).toBe(false)
    expect(canCommentOnTask('viewer')).toBe(false)
    expect(canArchiveTask('viewer')).toBe(false)
    expect(canRestoreTask('viewer')).toBe(false)

    expect(canCreateTask(undefined)).toBe(false)
    expect(canEditTask(undefined)).toBe(false)
    expect(canCommentOnTask(undefined)).toBe(false)
    expect(canArchiveTask(undefined)).toBe(false)
    expect(canRestoreTask(undefined)).toBe(false)
  })
})
