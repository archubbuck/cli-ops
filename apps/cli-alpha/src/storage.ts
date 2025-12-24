import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import type { Task, TaskList } from './types.js'
import { TaskListSchema } from './types.js'

/**
 * Task storage manager
 */
export class TaskStorage {
  private dataFile: string

  constructor(dataDir: string) {
    this.dataFile = join(dataDir, 'tasks.json')
  }

  /**
   * Initialize storage
   */
  async init(): Promise<void> {
    const dir = this.dataFile.split('/').slice(0, -1).join('/')
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    if (!existsSync(this.dataFile)) {
      await this.save({ tasks: [], version: '1.0.0' })
    }
  }

  /**
   * Load all tasks
   */
  async load(): Promise<TaskList> {
    try {
      const content = await readFile(this.dataFile, 'utf-8')
      const data = JSON.parse(content)
      return TaskListSchema.parse(data)
    } catch {
      return { tasks: [], version: '1.0.0' }
    }
  }

  /**
   * Save all tasks
   */
  async save(taskList: TaskList): Promise<void> {
    const validated = TaskListSchema.parse(taskList)
    await writeFile(this.dataFile, JSON.stringify(validated, null, 2))
  }

  /**
   * Get task by ID
   */
  async getById(id: string): Promise<Task | null> {
    const { tasks } = await this.load()
    return tasks.find(t => t.id === id) || null
  }

  /**
   * Create task
   */
  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const taskList = await this.load()
    const now = Date.now()
    
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).slice(2, 11),
      createdAt: now,
      updatedAt: now,
    }

    taskList.tasks.push(newTask)
    await this.save(taskList)
    
    return newTask
  }

  /**
   * Update task
   */
  async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
    const taskList = await this.load()
    const index = taskList.tasks.findIndex(t => t.id === id)
    
    if (index === -1) {
      return null
    }

    taskList.tasks[index] = {
      ...taskList.tasks[index],
      ...updates,
      updatedAt: Date.now(),
    }

    await this.save(taskList)
    return taskList.tasks[index]
  }

  /**
   * Delete task
   */
  async delete(id: string): Promise<boolean> {
    const taskList = await this.load()
    const index = taskList.tasks.findIndex(t => t.id === id)
    
    if (index === -1) {
      return false
    }

    taskList.tasks.splice(index, 1)
    await this.save(taskList)
    
    return true
  }

  /**
   * List tasks with filters
   */
  async list(filters?: {
    status?: string
    priority?: string
    tag?: string
  }): Promise<Task[]> {
    const { tasks } = await this.load()
    
    if (!filters) {
      return tasks
    }

    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) {
        return false
      }
      if (filters.priority && task.priority !== filters.priority) {
        return false
      }
      if (filters.tag && !task.tags.includes(filters.tag)) {
        return false
      }
      return true
    })
  }
}
