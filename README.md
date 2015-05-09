# gulp-coffee-inline
Gulp package that inline all reference scripts into current source

## Usage
Reference to other script using `# @inline {filename}`

## Note
- `{filename}` is absolute path or relative path to the current file.
- Recursive references is not supported yet.
- Inline scripts will be indented to keep coffee script well-formed.
