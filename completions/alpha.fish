# Fish completion for alpha CLI

# Commands
complete -c alpha -f -n "__fish_use_subcommand" -a "tasks:create" -d "Create a new task"
complete -c alpha -f -n "__fish_use_subcommand" -a "tasks:list" -d "List all tasks"
complete -c alpha -f -n "__fish_use_subcommand" -a "tasks:show" -d "Show task details"
complete -c alpha -f -n "__fish_use_subcommand" -a "tasks:update" -d "Update a task"
complete -c alpha -f -n "__fish_use_subcommand" -a "tasks:delete" -d "Delete a task"
complete -c alpha -f -n "__fish_use_subcommand" -a "help" -d "Display help"
complete -c alpha -f -n "__fish_use_subcommand" -a "version" -d "Display version"

# Global flags
complete -c alpha -l help -d "Show help"
complete -c alpha -l version -d "Show version"
complete -c alpha -l format -d "Output format" -xa "json yaml table csv markdown text"
complete -c alpha -l verbose -s v -d "Verbose output"
complete -c alpha -l quiet -s q -d "Suppress output"
complete -c alpha -l no-color -d "Disable colors"

# tasks:create flags
complete -c alpha -n "__fish_seen_subcommand_from tasks:create" -l title -s t -d "Task title"
complete -c alpha -n "__fish_seen_subcommand_from tasks:create" -l description -s d -d "Task description"
complete -c alpha -n "__fish_seen_subcommand_from tasks:create" -l priority -s p -d "Task priority" -xa "low medium high urgent"
complete -c alpha -n "__fish_seen_subcommand_from tasks:create" -l tags -s g -d "Task tags"
complete -c alpha -n "__fish_seen_subcommand_from tasks:create" -l interactive -s i -d "Interactive mode"

# tasks:list flags
complete -c alpha -n "__fish_seen_subcommand_from tasks:list" -l status -s s -d "Filter by status" -xa "todo in-progress done cancelled"
complete -c alpha -n "__fish_seen_subcommand_from tasks:list" -l priority -s p -d "Filter by priority" -xa "low medium high urgent"
complete -c alpha -n "__fish_seen_subcommand_from tasks:list" -l tag -s g -d "Filter by tag"

# tasks:update flags
complete -c alpha -n "__fish_seen_subcommand_from tasks:update" -l title -s t -d "New title"
complete -c alpha -n "__fish_seen_subcommand_from tasks:update" -l description -s d -d "New description"
complete -c alpha -n "__fish_seen_subcommand_from tasks:update" -l status -s s -d "New status" -xa "todo in-progress done cancelled"
complete -c alpha -n "__fish_seen_subcommand_from tasks:update" -l priority -s p -d "New priority" -xa "low medium high urgent"
complete -c alpha -n "__fish_seen_subcommand_from tasks:update" -l tags -s g -d "New tags"
complete -c alpha -n "__fish_seen_subcommand_from tasks:update" -l interactive -s i -d "Interactive mode"

# tasks:delete flags
complete -c alpha -n "__fish_seen_subcommand_from tasks:delete" -l force -s f -d "Skip confirmation"
