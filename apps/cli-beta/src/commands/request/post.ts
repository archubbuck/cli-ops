import { Args, Flags } from '@oclif/core'
import { BaseCommand } from '@/shared-commands'
import { formatJSON } from '@/shared-formatter'
import { createSpinner } from '@/shared-ui'
import { SUCCESS } from '@/shared-exit-codes'
import { HttpClient } from '../http-client.js'

export default class RequestPost extends BaseCommand {
  static override description = 'Make a POST request'

  static override examples = [
    '<%= config.bin %> <%= command.id %> https://api.example.com/data --data \'{"key":"value"}\'',
    '<%= config.bin %> <%= command.id %> https://api.example.com/data --data \'{"name":"test"}\' --header "Content-Type: application/json"',
  ]

  static override args = {
    url: Args.string({
      description: 'URL to request',
      required: true,
    }),
  }

  static override flags = {
    ...BaseCommand.baseFlags,
    data: Flags.string({
      char: 'd',
      description: 'Request body data',
      required: true,
    }),
    header: Flags.string({
      char: 'H',
      description: 'Request header (can be used multiple times)',
      multiple: true,
    }),
  }

  protected async execute(): Promise<void> {
    const { args, flags } = await this.parse(RequestPost)
    const client = new HttpClient(this.context.cacheDir)
    await client.init()

    // Parse headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (flags.header) {
      flags.header.forEach(header => {
        const [key, ...values] = header.split(':')
        if (key && values.length > 0) {
          headers[key.trim()] = values.join(':').trim()
        }
      })
    }

    const spinner = createSpinner('Sending request...')
    spinner.start()

    try {
      const response = await client.post(
        args.url,
        flags.data,
        headers
      )

      spinner.succeed('Request completed')

      const format = this.getOutputFormat()

      if (format === 'json') {
        this.log(formatJSON({
          status: response.status,
          headers: response.headers,
          body: this.tryParseJSON(response.body),
        }, { pretty: true }))
      } else {
        this.log(`\nStatus: ${response.status}\n`)
        this.log('Response:')
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
