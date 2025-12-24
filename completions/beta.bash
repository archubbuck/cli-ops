# Bash completion for beta CLI

_beta_completion() {
  local cur prev commands
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  
  commands="request:get request:post help version"
  
  local flags="--help --version --format --verbose --quiet --no-color"
  
  case "${COMP_WORDS[1]}" in
    request:get)
      flags="$flags --header --cache --cache-ttl"
      ;;
    request:post)
      flags="$flags --header --data"
      ;;
  esac
  
  case "$prev" in
    --format)
      COMPREPLY=( $(compgen -W "json yaml table csv markdown text" -- "$cur") )
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

complete -F _beta_completion beta
