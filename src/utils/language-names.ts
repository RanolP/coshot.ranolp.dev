export const languageDisplayNames: Record<string, string> = {
  // Web Languages
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  stylus: 'Stylus',

  // JavaScript & TypeScript
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  json: 'JSON',
  jsonc: 'JSON with Comments',

  // Web Frameworks
  vue: 'Vue',
  svelte: 'Svelte',
  astro: 'Astro',
  'angular-html': 'Angular HTML',
  'angular-ts': 'Angular TypeScript',

  // Programming Languages
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  kotlin: 'Kotlin',
  swift: 'Swift',
  'objective-c': 'Objective-C',
  scala: 'Scala',
  ruby: 'Ruby',
  php: 'PHP',
  perl: 'Perl',
  lua: 'Lua',
  dart: 'Dart',
  julia: 'Julia',
  r: 'R',
  matlab: 'MATLAB',
  'fortran-free-form': 'Fortran',
  ada: 'Ada',
  pascal: 'Pascal',
  d: 'D',
  nim: 'Nim',
  crystal: 'Crystal',
  zig: 'Zig',
  v: 'V',

  // Functional Languages
  haskell: 'Haskell',
  elm: 'Elm',
  fsharp: 'F#',
  ocaml: 'OCaml',
  scheme: 'Scheme',
  racket: 'Racket',
  clojure: 'Clojure',
  elixir: 'Elixir',
  erlang: 'Erlang',
  lisp: 'Lisp',
  purescript: 'PureScript',
  rescript: 'ReScript',

  // Shell & Scripts
  bash: 'Bash',
  shell: 'Shell',
  powershell: 'PowerShell',
  fish: 'Fish',
  zsh: 'Zsh',
  bat: 'Batch',
  makefile: 'Makefile',
  cmake: 'CMake',

  // Data & Config
  sql: 'SQL',
  graphql: 'GraphQL',
  prisma: 'Prisma',
  yaml: 'YAML',
  toml: 'TOML',
  xml: 'XML',
  csv: 'CSV',
  ini: 'INI',
  properties: 'Properties',
  dotenv: 'DotEnv',

  // Documentation
  markdown: 'Markdown',
  mdx: 'MDX',
  latex: 'LaTeX',
  asciidoc: 'AsciiDoc',
  rst: 'reStructuredText',

  // DevOps & Cloud
  dockerfile: 'Dockerfile',
  docker: 'Docker Compose',
  kubernetes: 'Kubernetes',
  terraform: 'Terraform',
  nginx: 'Nginx',
  apache: 'Apache',

  // Smart Contracts
  solidity: 'Solidity',
  vyper: 'Vyper',
  move: 'Move',
  cairo: 'Cairo',

  // Low Level
  asm: 'Assembly',
  wasm: 'WebAssembly',
  llvm: 'LLVM IR',
  cuda: 'CUDA',
  glsl: 'GLSL',
  hlsl: 'HLSL',
  wgsl: 'WGSL',

  // Other
  vim: 'Vim Script',
  'emacs-lisp': 'Emacs Lisp',
  regex: 'Regular Expression',
  diff: 'Diff',
  'git-commit': 'Git Commit',
  'git-rebase': 'Git Rebase',
  'ssh-config': 'SSH Config',
  proto: 'Protocol Buffers',
};

export function getLanguageDisplayName(language: string): string {
  return languageDisplayNames[language] || language;
}
