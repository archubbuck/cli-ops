# Fish completion for clio CLI

# Core commands
complete -c clio -f -n '__fish_use_subcommand' -a 'config:get' -d 'Get configuration value'
complete -c clio -f -n '__fish_use_subcommand' -a 'config:set' -d 'Set configuration value'
complete -c clio -f -n '__fish_use_subcommand' -a 'config:list' -d 'List all configuration'
complete -c clio -f -n '__fish_use_subcommand' -a 'history:list' -d 'Show command history'
complete -c clio -f -n '__fish_use_subcommand' -a 'doctor' -d 'Check installation health'
complete -c clio -f -n '__fish_use_subcommand' -a 'plugins' -d 'Manage plugins'
complete -c clio -f -n '__fish_use_subcommand' -a 'plugins:install' -d 'Install a plugin'
complete -c clio -f -n '__fish_use_subcommand' -a 'plugins:uninstall' -d 'Uninstall a plugin'
complete -c clio -f -n '__fish_use_subcommand' -a 'plugins:list' -d 'List installed plugins'
complete -c clio -f -n '__fish_use_subcommand' -a 'plugins:update' -d 'Update all plugins'
complete -c clio -f -n '__fish_use_subcommand' -a 'plugins:link' -d 'Link local plugin'
complete -c clio -f -n '__fish_use_subcommand' -a 'help' -d 'Display help'
complete -c clio -f -n '__fish_use_subcommand' -a 'version' -d 'Show version'

# Tasks commands (bundled plugin)
complete -c clio -f -n '__fish_use_subcommand' -a 'tasks:create' -d 'Create a new task'
complete -c clio -f -n '__fish_use_subcommand' -a 'tasks:list' -d 'List all tasks'
complete -c clio -f -n '__fish_use_subcommand' -a 'tasks:show' -d 'Show task details'
complete -c clio -f -n '__fish_use_subcommand' -a 'tasks:update' -d 'Update a task'
complete -c clio -f -n '__fish_use_subcommand' -a 'tasks:delete' -d 'Delete a task'

# Global flags
complete -c clio -l help -d 'Show help'
complete -c clio -l version -d 'Show version'
complete -c clio -l format -d 'Output format' -a 'json yaml table'
complete -c clio -l verbose -d 'Verbose output'
complete -c clio -l quiet -d 'Quiet mode'
complete -c clio -l no-color -d 'Disable colors'

# config:get / config:set flags
complete -c clio -n '__fish_seen_subcommand_from config:get config:set' -l global -d 'Global configuration'
complete -c clio -n '__fish_seen_subcommand_from config:get config:set' -l plugin -d 'Plugin configuration'

# config:list flags
complete -c clio -n '__fish_seen_subcommand_from config:list' -l global -d 'Show global config only'
complete -c clio -n '__fish_seen_subcommand_from config:list' -l json -d 'Output as JSON'

# history:list flags
complete -c clio -n '__fish_seen_subcommand_from history:list' -l limit -d 'Limit results'
complete -c clio -n '__fish_seen_subcommand_from history:list' -l since -d 'Show since date'
complete -c clio -n '__fish_seen_subcommand_from history:list' -l command -d 'Filter by command'

# doctor flags
complete -c clio -n '__fish_seen_subcommand_from doctor' -l check -d 'Check specific'
complete -c clio -n '__fish_seen_subcommand_from doctor' -l fix -d 'Auto-fix issues'

# plugins:install flags
complete -c clio -n '__fish_seen_subcommand_from plugins:install' -l force -d 'Force installation'
complete -c clio -n '__fish_seen_subcommand_from plugins:install' -l tag -d 'Install specific version'

# plugins:uninstall flags
complete -c clio -n '__fish_seen_subcommand_from plugins:uninstall' -l force -d 'Skip confirmation'

# tasks:create flags
complete -c clio -n '__fish_seen_subcommand_from tasks:create' -l title -d 'Task title'
complete -c clio -n '__fish_seen_subcommand_from tasks:create' -l description -d 'Task description'
complete -c clio -n '__fish_seen_subcommand_from tasks:create' -l priority -d 'Priority' -a 'low medium high'
complete -c clio -n '__fish_seen_subcommand_from tasks:create' -l tags -d 'Tags (comma-separated)'
complete -c clio -n '__fish_seen_subcommand_from tasks:create' -l interactive -d 'Interactive mode'

# tasks:list flags
complete -c clio -n '__fish_seen_subcommand_from tasks:list' -l status -d 'Filter by status' -a 'todo in-progress done'
complete -c clio -n '__fish_seen_subcommand_from tasks:list' -l priority -d 'Filter by priority' -a 'low medium high'
complete -c clio -n '__fish_seen_subcommand_from tasks:list' -l tag -d 'Filter by tag'

# tasks:show flags (inherits global --format)

# tasks:update flags
complete -c clio -n '__fish_seen_subcommand_from tasks:update' -l title -d 'Task title'
complete -c clio -n '__fish_seen_subcommand_from tasks:update' -l description -d 'Task description'
complete -c clio -n '__fish_seen_subcommand_from tasks:update' -l status -d 'Status' -a 'todo in-progress done'
complete -c clio -n '__fish_seen_subcommand_from tasks:update' -l priority -d 'Priority' -a 'low medium high'
complete -c clio -n '__fish_seen_subcommand_from tasks:update' -l tags -d 'Tags (comma-separated)'
complete -c clio -n '__fish_seen_subcommand_from tasks:update' -l interactive -d 'Interactive mode'

# tasks:delete flags
complete -c clio -n '__fish_seen_subcommand_from tasks:delete' -l force -d 'Skip confirmation'
