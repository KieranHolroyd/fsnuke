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

_Build it yourself_

```sh
$ git clone https://github.com/kieranholroyd/nodekill
...
$ cd nodekill
$ npm install
open another terminal
Term1 $ npm run dev
Term2 $ npm start -- NODEKILL ARGS
```

I suggest making a fake project with some small deps, and setting the --path argument while testing, the just run `npm install` to try again.
This was thrown together in a few hours, when i needed to backup all my files and didn't have a huge amount of time, also windows fucking sucks at multi-threaded IO. this saved me like 6 hours of 1kb file transfers, be free.
