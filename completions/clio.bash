# Bash completion for clio CLI

_clio_completion() {
  local cur prev commands
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  
  # Core commands
  local core_commands="config:get config:set config:list history:list doctor plugins help version"
  
  # Tasks commands (bundled plugin)
  local tasks_commands="tasks:create tasks:list tasks:show tasks:update tasks:delete"
  
  # Available commands (core + bundled)
  commands="$core_commands $tasks_commands"
  
  # Global flags
  local flags="--help --version --format --verbose --quiet --no-color"
  
  # Command-specific flags
  case "${COMP_WORDS[1]}" in
    config:get|config:set)
      flags="$flags --global --plugin"
      ;;
    config:list)
      flags="$flags --global --json"
      ;;
    history:list)
      flags="$flags --limit --since --command"
      ;;
    doctor)
      flags="$flags --check --fix"
      ;;
    plugins)
      flags="$flags --core --verbose"
      ;;
    plugins:install)
      flags="$flags --force --tag"
      ;;
    plugins:uninstall)
      flags="$flags --force"
      ;;
    tasks:create)
      flags="$flags --title --description --priority --tags --interactive"
      ;;
    tasks:list)
      flags="$flags --status --priority --tag --format"
      ;;
    tasks:show)
      flags="$flags --format"
      ;;
    tasks:update)
      flags="$flags --title --description --status --priority --tags --interactive"
      ;;
    tasks:delete)
      flags="$flags --force"
      ;;
  esac
  
  # Suggest commands or flags
  if [[ ${cur} == -* ]]; then
    COMPREPLY=( $(compgen -W "${flags}" -- ${cur}) )
  else
    COMPREPLY=( $(compgen -W "${commands}" -- ${cur}) )
  fi
  
  return 0
}

complete -F _clio_completion clio
