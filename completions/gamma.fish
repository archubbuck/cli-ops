# Fish completion for gamma CLI

complete -c gamma -f -n "__fish_use_subcommand" -a "git:status" -d "Show Git status"
complete -c gamma -f -n "__fish_use_subcommand" -a "git:log" -d "Show Git log"
complete -c gamma -f -n "__fish_use_subcommand" -a "pr:list" -d "List pull requests"
complete -c gamma -f -n "__fish_use_subcommand" -a "help" -d "Display help"
complete -c gamma -f -n "__fish_use_subcommand" -a "version" -d "Display version"

complete -c gamma -l help -d "Show help"
complete -c gamma -l version -d "Show version"
complete -c gamma -l format -d "Output format" -xa "json yaml table csv markdown text"
complete -c gamma -l verbose -s v -d "Verbose output"
complete -c gamma -l quiet -s q -d "Suppress output"
complete -c gamma -l no-color -d "Disable colors"

complete -c gamma -n "__fish_seen_subcommand_from git:log" -l limit -s n -d "Number of commits"

complete -c gamma -n "__fish_seen_subcommand_from pr:list" -l state -s s -d "PR state" -xa "open closed all"
complete -c gamma -n "__fish_seen_subcommand_from pr:list" -l token -s t -d "GitHub token"
