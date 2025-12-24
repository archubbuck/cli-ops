import { Args, Flags } from '@oclif/core'
import { BaseCommand } from '@/shared-commands'
import { formatJSON, formatTable } from '@/shared-formatter'
import { createSpinner } from '@/shared-ui'
import { SUCCESS } from '@/shared-exit-codes'
import { HttpClient } from '../http-client.js'

export default class RequestGet extends BaseCommand {
  static override description = 'Make a GET request'

  static override examples = [
    '<%= config.bin %> <%= command.id %> https://api.github.com/users/octocat',
    '<%= config.bin %> <%= command.id %> https://api.example.com/data --cache',
    '<%= config.bin %> <%= command.id %> https://api.example.com/data --header "Authorization: Bearer TOKEN"',
  ]

  static override args = {
    url: Args.string({
      description: 'URL to request',
      required: true,
    }),
  }

  static override flags = {
    ...BaseCommand.baseFlags,
    header: Flags.string({
      char: 'H',
      description: 'Request header (can be used multiple times)',
      multiple: true,
    }),
    cache: Flags.boolean({
      char: 'c',
      description: 'Use cache',
      default: false,
    }),
    'cache-ttl': Flags.integer({
      description: 'Cache TTL in seconds',
      default: 3600,
    }),
  }

  protected async execute(): Promise<void> {
    const { args, flags } = await this.parse(RequestGet)
    const client = new HttpClient(this.context.cacheDir)
    await client.init()

    // Parse headers
    const headers: Record<string, string> = {}
    if (flags.header) {
      flags.header.forEach(header => {
        const [key, ...values] = header.split(':')
        if (key && values.length > 0) {
          headers[key.trim()] = values.join(':').trim()
        }
      })
    }

    const spinner = createSpinner('Making request...')
    spinner.start()

    try {
      const response = await client.get(
        args.url,
        headers,
        flags.cache
      )

      spinner.succeed('Request completed')

      const format = this.getOutputFormat()

      if (format === 'json') {
        // Output full response as JSON
        this.log(formatJSON({
          status: response.status,
          headers: response.headers,
          body: this.tryParseJSON(response.body),
        }, { pretty: true }))
      } else {
        // Output formatted response
        this.log(`\nStatus: ${response.status}\n`)

        // Headers table
        if (this.isVerbose()) {
          this.log('Headers:')
          const headerData = Object.entries(response.headers).map(([key, value]) => ({
            key,
            value: String(value),
          }))
          this.log(formatTable(headerData, {
            columns: [
              { key: 'key', label: 'Header' },
              { key: 'value', label: 'Value' },
            ],
            style: 'simple',
          }))
          this.log('')
        }

        // Body
        this.log('Body:')
        const bodyData = this.tryParseJSON(response.body)
        if (typeof bodyData === 'object') {
          this.log(formatJSON(bodyData, { pretty: true }))
        } else {
          this.log(response.body)
        }
      }
    } catch (error) {
      spinner.fail('Request failed')
      throw error
    }

    process.exit(SUCCESS)
  }

  private tryParseJSON(text: string): unknown {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }
}
