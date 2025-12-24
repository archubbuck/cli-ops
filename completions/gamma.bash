# Bash completion for gamma CLI

_gamma_completion() {
  local cur prev commands
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  
  commands="git:status git:log pr:list help version"
  
  local flags="--help --version --format --verbose --quiet --no-color"
  
  case "${COMP_WORDS[1]}" in
    git:log)
      flags="$flags --limit"
      ;;
    pr:list)
      flags="$flags --state --token"
      ;;
  esac
  
  case "$prev" in
    --format)
      COMPREPLY=( $(compgen -W "json yaml table csv markdown text" -- "$cur") )
      return 0
      ;;
    --state)
      COMPREPLY=( $(compgen -W "open closed all" -- "$cur") )
      return 0
      ;;
  esac
  
  if [[ "$cur" == -* ]]; then
    COMPREPLY=( $(compgen -W "$flags" -- "$cur") )
  else
    COMPREPLY=( $(compgen -W "$commands" -- "$cur") )
  fi
  
  return 0
}

complete -F _gamma_completion gamma
