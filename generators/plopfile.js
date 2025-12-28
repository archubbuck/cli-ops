export default function (plop) {
  // Helper functions
  plop.setHelper('pascalCase', (text) => {
    return text
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
  })

  plop.setHelper('kebabCase', (text) => {
    return text.toLowerCase().replace(/\s+/g, '-')
  })

  // Plugin generator (replaces CLI generator)
  plop.setGenerator('plugin', {
    description: 'Create a new clio plugin',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Plugin name (without clio-plugin- prefix, e.g., slack):',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Plugin description:',
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author name:',
        default: 'CLI Ops Contributors',
      },
      {
        type: 'confirm',
        name: 'includeTests',
        message: 'Include test setup?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'includeCI',
        message: 'Include GitHub Actions CI?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'includeDocs',
        message: 'Include documentation template?',
        default: true,
      },
    ],
    actions: function (data) {
      const actions = [
        {
          type: 'addMany',
          destination: 'plugins/clio-plugin-{{name}}',
          base: 'templates/plugin',
          templateFiles: 'templates/plugin/**/*',
          globOptions: { dot: true },
        },
      ]

      if (data.includeTests) {
        actions.push({
          type: 'addMany',
          destination: 'plugins/clio-plugin-{{name}}',
          base: 'templates/plugin-tests',
          templateFiles: 'templates/plugin-tests/**/*',
        })
      }

      if (data.includeCI) {
        actions.push({
          type: 'add',
          path: 'plugins/clio-plugin-{{name}}/.github/workflows/ci.yml',
          templateFile: 'templates/plugin-ci.yml.hbs',
        })
      }

      if (data.includeDocs) {
        actions.push({
          type: 'add',
          path: 'plugins/clio-plugin-{{name}}/docs/README.md',
          templateFile: 'templates/plugin-docs.md.hbs',
        })
      }

      return actions
    },
  })

  // Package generator
  plop.setGenerator('package', {
    description: 'Create a new shared package',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Package name (e.g., shared-utils):',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Package description:',
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: 'libs/{{name}}',
        base: 'templates/package',
        templateFiles: 'templates/package/**/*',
      },
    ],
  })

  // Command generator (updated for plugins)
  plop.setGenerator('command', {
    description: 'Add a command to existing plugin',
    prompts: [
      {
        type: 'input',
        name: 'plugin',
        message: 'Plugin name (e.g., tasks, fetch, repo):',
      },
      {
        type: 'input',
        name: 'topic',
        message: 'Command topic (the part before ":", e.g., tasks):',
      },
      {
        type: 'input',
        name: 'name',
        message: 'Command name (the part after ":", e.g., create):',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Command description:',
      },
      {
        type: 'confirm',
        name: 'interactive',
        message: 'Include interactive prompts?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'createFixtures',
        message: 'Create test/fixtures directory for this command?',
        default: false,
      },
    ],
    actions: function (data) {
      const actions = [
        {
          type: 'add',
          path: 'plugins/clio-plugin-{{plugin}}/src/commands/{{topic}}/{{name}}.ts',
          templateFile: 'templates/command.hbs',
        },
        {
          type: 'add',
          path: 'plugins/clio-plugin-{{plugin}}/test/commands/{{topic}}/{{name}}.test.ts',
          templateFile: 'templates/command-test.hbs',
        },
      ]

      if (data.createFixtures) {
        actions.push({
          type: 'add',
          path: 'plugins/clio-plugin-{{plugin}}/test/fixtures/{{topic}}/{{name}}/.gitkeep',
          template: '',
        })
      }

      return actions
    },
  })
}
