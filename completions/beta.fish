# Fish completion for beta CLI

complete -c beta -f -n "__fish_use_subcommand" -a "request:get" -d "Make GET request"
complete -c beta -f -n "__fish_use_subcommand" -a "request:post" -d "Make POST request"
complete -c beta -f -n "__fish_use_subcommand" -a "help" -d "Display help"
complete -c beta -f -n "__fish_use_subcommand" -a "version" -d "Display version"

complete -c beta -l help -d "Show help"
complete -c beta -l version -d "Show version"
complete -c beta -l format -d "Output format" -xa "json yaml table csv markdown text"
complete -c beta -l verbose -s v -d "Verbose output"
complete -c beta -l quiet -s q -d "Suppress output"
complete -c beta -l no-color -d "Disable colors"

complete -c beta -n "__fish_seen_subcommand_from request:get" -l header -s H -d "HTTP header"
complete -c beta -n "__fish_seen_subcommand_from request:get" -l cache -d "Enable caching"
complete -c beta -n "__fish_seen_subcommand_from request:get" -l cache-ttl -d "Cache TTL in seconds"

complete -c beta -n "__fish_seen_subcommand_from request:post" -l data -s d -d "Request data"
complete -c beta -n "__fish_seen_subcommand_from request:post" -l header -s H -d "HTTP header"
