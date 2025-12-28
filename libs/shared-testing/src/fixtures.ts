import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * Create a temporary directory for testing
 */
export async function createTempDir(prefix: string = 'test-'): Promise<string> {
  return mkdtemp(join(tmpdir(), prefix))
}

/**
 * Remove temporary directory
 */
export async function removeTempDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true })
}

/**
 * Create test fixture files
 */
export async function createFixture(
  dir: string,
  files: Record<string, string>
): Promise<void> {
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(dir, filePath)
    const dirPath = fullPath.split('/').slice(0, -1).join('/')
    
    await mkdir(dirPath, { recursive: true })
    await writeFile(fullPath, content)
  }
}

/**
 * Test fixture manager
 */
export class FixtureManager {
  private tempDirs: string[] = []

  /**
   * Create a new temp directory
   */
  async createDir(prefix?: string): Promise<string> {
    const dir = await createTempDir(prefix)
    this.tempDirs.push(dir)
    return dir
  }

  /**
   * Create fixture files in a temp directory
   */
  async create(
    files: Record<string, string>,
    prefix?: string
  ): Promise<string> {
    const dir = await this.createDir(prefix)
    await createFixture(dir, files)
    return dir
  }

  /**
   * Clean up all temp directories
   */
  async cleanup(): Promise<void> {
    await Promise.all(this.tempDirs.map(dir => removeTempDir(dir)))
    this.tempDirs = []
  }
}

/**
 * Create fixture manager
 */
export function createFixtureManager(): FixtureManager {
  return new FixtureManager()
}
