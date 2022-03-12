# FSNuke

Filsystem Nuke. A tool to clean up `temp` files such as node_modules, bower_components, vendor and other temporary files.
Useful for saving disk space from node modules, or any other bloated dependency folders that are not needed on inactive projects.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/fsnuke.svg)](https://npmjs.org/package/fsnuke)
[![Downloads/week](https://img.shields.io/npm/dw/fsnuke.svg)](https://npmjs.org/package/fsnuke)
[![License](https://img.shields.io/npm/l/fsnuke.svg)](https://github.com/kieranholroyd/fsnuke/blob/master/package.json)

<!-- toc -->

- [fsnuke](#fsnuke)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g fsnuke
$ fsnuke --help
List & delete all (node_modules & vendor) folders within path.

USAGE
  $ fsnuke

OPTIONS
  -d, --depth=depth  Search Folder Depth [default: 5]
  -h, --help         show CLI help
  -p, --path=path    [default: ./]

  --vendor           clean php composer too.
```

<!-- usagestop -->

_Build it yourself_

```sh
$ git clone https://github.com/kieranholroyd/fsnuke
*or*
$ gh repo clone kieranholroyd/fsnuke
...
$ cd fsnuke
$ npm install
open another terminal
Term1 $ npm run dev
Term2 $ npm start -- {FSNuke ARGS}
```

I suggest making a fake project with some small deps, and setting the --path argument while testing, the just run `npm install` to try again.
