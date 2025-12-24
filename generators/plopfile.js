export default function (plop) {
  // CLI generator
  plop.setGenerator('cli', {
    description: 'Create a new CLI application',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'CLI name (e.g., delta):',
      },
      {
        type: 'input',
        name: 'description',
        message: 'CLI description:',
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: 'apps/cli-{{name}}',
        base: 'templates/cli',
        templateFiles: 'templates/cli/**/*',
      },
    ],
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
        destination: 'packages/{{name}}',
        base: 'templates/package',
        templateFiles: 'templates/package/**/*',
      },
    ],
  })

  // Command generator
  plop.setGenerator('command', {
    description: 'Add a command to existing CLI',
    prompts: [
      {
        type: 'list',
        name: 'cli',
        message: 'Which CLI?',
        choices: ['alpha', 'beta', 'gamma'],
      },
      {
        type: 'input',
        name: 'name',
        message: 'Command name (e.g., export):',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Command description:',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/cli-{{cli}}/src/commands/{{name}}.ts',
        templateFile: 'templates/command.hbs',
      },
    ],
  })
}
