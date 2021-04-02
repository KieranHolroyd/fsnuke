# nodekill

Remove all node_modules recursively within child directories.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@ndkieran/nodekill.svg)](https://npmjs.org/package/@ndkieran/nodekill)
[![Downloads/week](https://img.shields.io/npm/dw/@ndkieran/nodekill.svg)](https://npmjs.org/package/@ndkieran/nodekill)
[![License](https://img.shields.io/npm/l/@ndkieran/nodekill.svg)](https://github.com/kieranholroyd/nodekill/blob/master/package.json)

<!-- toc -->

- [nodekill](#nodekill)
- [Usage](#usage)
- [Commands](#commands)
  <!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @ndkieran/nodekill
$ nodekill --help
List & delete all (node_modules & vendor) folders within path.

USAGE
  $ nodekill

OPTIONS
  -d, --depth=depth  Search Folder Depth [default: 5]
  -h, --help         show CLI help
  -p, --path=path    [default: ./]

  -s, --size         calculate folder & total sizes (takes a minute)

  --vendor           clean php composer too.
```

<!-- usagestop -->

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

<!-- commandsstop -->
