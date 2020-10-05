nodekill
========

Remove all node_modules recursively within child directories.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nodekill.svg)](https://npmjs.org/package/nodekill)
[![Downloads/week](https://img.shields.io/npm/dw/nodekill.svg)](https://npmjs.org/package/nodekill)
[![License](https://img.shields.io/npm/l/nodekill.svg)](https://github.com/kieranholroyd/nodekill/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g nodekill
$ nodekill COMMAND
running command...
$ nodekill (-v|--version|version)
nodekill/0.0.0 win32-x64 node-v14.13.0
$ nodekill --help [COMMAND]
USAGE
  $ nodekill COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`nodekill hello [FILE]`](#nodekill-hello-file)
* [`nodekill help [COMMAND]`](#nodekill-help-command)

## `nodekill hello [FILE]`

describe the command here

```
USAGE
  $ nodekill hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ nodekill hello
  hello world from ./src/hello.ts!
```

_See code: [src\commands\hello.ts](https://github.com/kieranholroyd/nodekill/blob/v0.0.0/src\commands\hello.ts)_

## `nodekill help [COMMAND]`

display help for nodekill

```
USAGE
  $ nodekill help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src\commands\help.ts)_
<!-- commandsstop -->
