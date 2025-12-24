import { z } from 'zod'

/**
 * Task status
 */
export const TaskStatus = z.enum(['todo', 'in-progress', 'done', 'cancelled'])
export type TaskStatus = z.infer<typeof TaskStatus>

/**
 * Task priority
 */
export const TaskPriority = z.enum(['low', 'medium', 'high', 'urgent'])
export type TaskPriority = z.infer<typeof TaskPriority>

/**
 * Task schema
 */
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: TaskStatus.default('todo'),
  priority: TaskPriority.default('medium'),
  tags: z.array(z.string()).default([]),
  createdAt: z.number(),
  updatedAt: z.number(),
  completedAt: z.number().optional(),
})

export type Task = z.infer<typeof TaskSchema>

/**
 * Task list schema
 */
export const TaskListSchema = z.object({
  tasks: z.array(TaskSchema),
  version: z.string().default('1.0.0'),
})

export type TaskList = z.infer<typeof TaskListSchema>
