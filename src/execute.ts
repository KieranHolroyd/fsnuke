// export {run} from '@oclif/command'

/* eslint-disable no-warning-comments, no-console, max-depth */
import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
import { table } from "cli-ux/lib/styled/table";
import fastFolderSize from "fast-folder-size";
import * as fs from "fs";
import * as path from "path";
import { stdout } from "process";
import { sync as delsync } from "rimraf";
import util from "util";
import {
  isFileError,
  isValidError,
  opendir_error,
} from "./libs/error_handling";
import FileSize from "./libs/file_size";
import search_table from "./libs/search_table";
import { FileInfo } from "./libs/types";

/* DEBUG OPTIONS */
const isDebug = Boolean(process.env.DEBUG);
const isVerbose = Boolean(process.env.VERBOSE);

/* CLI Entry Class */
class Execute extends Command {
  module_path_list: FileInfo[] = [];

  counted = 0;
  errors = 0;

  remove_vendor = false;

  static description =
    "Filsystem Nuke. A tool to clean up `temp` files such as node_modules, bower_components, vendor and other temporary files.";

  static flags = {
    path: flags.string({
      description: "path to start recursion",
      char: "p",
      default: "./",
    }),
    help: flags.help({ char: "h" }),
    depth: flags.integer({
      description: "directory recursion depth",
      char: "d",
      default: 5,
    }),
  };

  /* CLI Entry function */
  public async run() {
    const { flags } = this.parse(Execute);

    console.log(`Searching ${path.resolve(flags.path)} for the modules.`);
    cli.action.start(
      "Thinking",
      `Searching ${path.resolve(flags.path)} for the modules.`,
      { stdout: true }
    );

    await this.timeIfTrue(
      isDebug,
      "directory_search",
      this.execDirectorySearch.bind(this),
      [flags.path, 0, flags.depth]
    );

    console.log(
      `Found ${this.module_path_list.length} directories. calculating size.`
    );
    cli.action.start("Thinking", "calculating space savings", {
      stdout: true,
    });
    await this.timeIfTrue(
      isDebug,
      "calculate_size",
      this.calculateSize.bind(this),
      []
    );

    const tableColumnConfig: () => table.Columns<FileInfo> = () => {
      const base: any = {
        path: {
          header: `Folder path (${this.module_path_list.length} Items)`,
        },
      };
      base.size = {
        header: "Size on disk",
        get: (row: any) => new FileSize(row.info?.size || 0).readableSize(),
      };
      return base;
    };

    cli.action.stop(`done.`);
    cli.table(this.module_path_list, tableColumnConfig());

    let total: number | FileSize = 0;
    for (const fullFile of this.module_path_list) {
      if (fullFile.info.size) total += fullFile.info.size;
    }
    total = new FileSize(total);
    this.log(
      `Total: ${total.readableSize()} -- Searched ${this.counted.toFixed(
        0
      )} files -- Experienced ${this.errors.toFixed(0)} errors. ${
        this.errors > 0 ? "run with VERBOSE=true to view errors." : ""
      }`
    );
    // TODO: allow selection of modules to delete
    this.log(
      `WARNING: Your files will be permenantly deleted, double check the list.`
    );
    if (
      await cli.confirm("Confirm delete all node_modules found above? (y/n)")
    ) {
      await this.execDirectoryDelete(this.module_path_list);
      this.log(
        `Completed, your node_modules have been cleaned${
          " and you saved " + total.readableSize()
        }`
      );
    } else {
      this.log(`Not deleted; exiting`);
    }
  }

  async execDirectorySearch(
    search_path: string,
    current_depth: number,
    max_depth: number
  ) {
    try {
      if (search_path && current_depth < max_depth) {
        const abs_path = path.resolve(search_path);
        const dirs = fs.opendirSync(abs_path);
        for await (const directory of dirs) {
          const full_path = path.resolve(search_path, directory.name);
          if (directory.isDirectory() && fs.existsSync(full_path)) {
            if (search_table.file_types.includes(directory.name)) {
              this.module_path_list.unshift({
                path: full_path,
                info: { size: 0 },
              });
              return;
            }
            await this.execDirectorySearch(
              path.resolve(full_path),
              current_depth + 1,
              max_depth
            );
          }
          this.count();
        }
      }
    } catch (e) {
      if (isVerbose && isValidError(e)) {
        if (isFileError(e)) opendir_error(this, e);
        if (!isFileError(e)) console.error(e);
      }
      this.countError();
    }
  }

  count() {
    this.counted = this.counted + 1;
  }
  countError() {
    this.errors = this.errors + 1;
  }

  async execDirectoryDelete(directories: FileInfo[]) {
    this.log(`Deleting ${directories.length} directories`);
    const progression = cli.progress();
    progression.start(directories.length, 0);
    await Promise.all(
      directories.map(async (dir) => {
        if (!fs.existsSync(dir.path)) return;
        delsync(dir.path);
        progression.increment();
      })
    );
    progression.stop();
    return true;
  }

  // readableSize(size: number) {
  //   let correct_size = 0,
  //     unit = this.decideUnit(size);

  //   switch (unit) {
  //     case "TB":
  //       correct_size = size / 1e12;
  //       break;
  //     case "GB":
  //       correct_size = size / 1e9;
  //       break;
  //     case "MB":
  //       correct_size = size / 1e6;
  //       break;
  //     case "KB":
  //       correct_size = size / 1e3;
  //       break;
  //     default:
  //       correct_size = size;
  //   }

  //   return `[${correct_size.toFixed(1)} ${unit}]`;
  // }

  // decideUnit(size: number) {
  //   if (size < 1e6) return "KB";
  //   if (size < 1e9) return "MB";
  //   if (size < 1e12) return "GB";
  //   return "TB";
  // }

  async calculateSize() {
    const getFolderSize = util.promisify(fastFolderSize);

    for await (const fullFile of this.module_path_list) {
      let folderSizeFull;
      try {
        folderSizeFull = await getFolderSize(fullFile.path);
      } catch (error) {
        if (isValidError(error)) {
          if (isFileError(error)) opendir_error(this, error);
          this.debug(error);
        }
      }
      fullFile.info.size = folderSizeFull;
    }
  }

  /** This is a debug function. enable with DEBUG=true before running fsnuke
   *  to see the time it takes to run for a given function.
   * 
   *  ```sh-session
   * $ DEBUG=true node ./bin/run
   * directory_search: 0.608ms
   * full_size_calc: 0.218ms
    ```
   *
   * ---
   *  For example:
   *  ```ts
   *  this.timeIfTrue(isDebug, "function_name", this.function_name.bind(this), [args])
   *  ```
   *
   *  expected console output:
   *  ```sh-session
   *  function_name: 0.000ms
   *  ```
   *
   * ---
   *
   * @param condition - condition to check
   * @param time_name used as `console.time(time_name)` and `console.timeEnd(time_name)`
   * @param func Async Funtion to execute and time if condition is true. NOTE: if running with a fucntion inside a class pass as `this.my_function.bind(this)` to preserve `this` in the function.
   * @param func_args Arguments to pass to the function (MUST BE ARRAY in order to be passed to function as `func(...func_args)`)
   * @returns 
   */
  async timeIfTrue<T>(
    condition: boolean,
    time_name: string,
    func: (...args: any[]) => Promise<T>,
    func_args: any[]
  ): Promise<T> {
    if (!condition) return await func(...func_args);

    console.time(time_name);
    let result = await func(...func_args);
    stdout.write(`\u001b[36m\u001b[4m!DEBUG_TIMING!\u001b[0m `);
    console.timeEnd(time_name);
    return result;
  }
}

export = Execute;
