# Bash completion for alpha CLI

_alpha_completion() {
  local cur prev commands
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  
  # Available commands
  commands="tasks:create tasks:list tasks:show tasks:update tasks:delete help version"
  
  # Available flags
  local flags="--help --version --format --verbose --quiet --no-color"
  
  # Command-specific flags
  case "${COMP_WORDS[1]}" in
    tasks:create)
      flags="$flags --title --description --priority --tags --interactive"
      ;;
    tasks:list)
      flags="$flags --status --priority --tag"
      ;;
    tasks:update)
      flags="$flags --title --description --status --priority --tags --interactive"
      ;;
    tasks:delete)
      flags="$flags --force"
      ;;
  esac
  
  # Flag value completions
  case "$prev" in
    --format)
      COMPREPLY=( $(compgen -W "json yaml table csv markdown text" -- "$cur") )
      return 0
      ;;
    --status)
      COMPREPLY=( $(compgen -W "todo in-progress done cancelled" -- "$cur") )
      return 0
      ;;
    --priority)
      COMPREPLY=( $(compgen -W "low medium high urgent" -- "$cur") )
      return 0
      ;;
  esac
  
  # Complete commands or flags
  if [[ "$cur" == -* ]]; then
    COMPREPLY=( $(compgen -W "$flags" -- "$cur") )
  else
    COMPREPLY=( $(compgen -W "$commands" -- "$cur") )
  fi
  
  return 0
}

complete -F _alpha_completion alpha
