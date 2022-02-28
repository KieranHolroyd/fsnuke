// export {run} from '@oclif/command'

/* eslint-disable no-warning-comments, no-console, max-depth */
import { Command, flags } from "@oclif/command";
import * as fs from "fs";
import * as path from "path";
import cli from "cli-ux";
import getFolderSizeCB from "get-folder-size";
import util from "util";
import { table } from "cli-ux/lib/styled/table";
import { FileInfo, FilesystemError } from "./types";
import { opendir_error } from "./errors";
import fastFolderSize from "fast-folder-size";

// const isDebug = Boolean(process.env.DEBUG)
function isValidError(x: any): x is Error {
  return typeof x.message === "string";
}

function isFileError(x: any): x is FilesystemError {
  return typeof x.errno === "number";
}

class Execute extends Command {
  module_path_list: FileInfo[] = [];

  counted = 0;

  remove_vendor = false;

  static description =
    "List & delete all (node_modules & vendor) folders within path.";

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
    size: flags.boolean({
      char: "s",
      description: "calculate folder & total sizes (takes a minute)",
    }),
    vendor: flags.boolean({ description: "clean php composer too." }),
  };

  public async run() {
    const { flags } = this.parse(Execute);

    this.remove_vendor = flags.vendor;

    cli.action.start(
      "Thinking",
      `Searching ${path.resolve(flags.path)} for the modules.`,
      { stdout: true }
    );
    // if (isDebug) console.time("directory_search")

    await this.execDirectorySearch(flags.path, 0, flags.depth);

    // if (isDebug) console.timeEnd("directory_search")

    if (flags.size) {
      cli.action.start("Thinking", "Calculating size (might take a moment)", {
        stdout: true,
      });
      console.time("full_size_calc");
      await this.calculateSize();
      console.timeEnd("full_size_calc");
    }

    // if (isDebug) console.time("build_table")

    const tableColumnConfig: () => table.Columns<FileInfo> = () => {
      const base: any = {
        path: {
          header: `Folder path (${this.module_path_list.length} Items)`,
        },
      };
      if (flags.size)
        base.size = {
          header: "Size on disk",
          get: (row: any) =>
            this.genDirSize(row, row.info?.size < 1e7 ? "KB" : "MB"),
        };
      return base;
    };

    cli.action.stop(`done.`);
    cli.table(this.module_path_list, tableColumnConfig());

    // if (isDebug) console.timeEnd("build_table")
    let total = 0;
    for (const fullFile of this.module_path_list) {
      if (fullFile.info.size) total += fullFile.info.size;
    }
    this.log(
      `Total: ${
        flags.size
          ? (total / 1024 / 1024 / 1024).toFixed(2) + "GB"
          : "not calculated"
      } -- Searched ${this.counted.toFixed(0)} files`
    );
    // TODO: allow selection of modules to delete
    this.log(
      `WARNING: Your files will be permenantly deleted, double check the list.`
    );
    if (
      await cli.confirm("Confirm delete all node_modules found above? (yes/no)")
    ) {
      await this.execDirectoryDelete(this.module_path_list);
      this.log(
        `Completed, your node_modules have been cleaned${
          flags.size
            ? " and you saved " + (total / 1024 / 1024 / 1024).toFixed(2) + "GB"
            : ""
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
            if (
              directory.name === "node_modules" ||
              (this.remove_vendor && directory.name === "vendor")
            ) {
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
          this.counted++;
        }
      }
    } catch (e) {
      if (isValidError(e)) {
        if (isFileError(e)) opendir_error(this, e);
        this.debug(e);
      }
    }
  }

  async execDirectoryDelete(directories: FileInfo[]) {
    const progression = cli.progress();
    progression.start(directories.length, 0);
    // cli.action.start(`deleting node_modules`, `Initialising`, {stdout: true})
    await Promise.all(
      directories.map(async (dir) => {
        if (!fs.existsSync(dir.path)) return;
        progression.increment();
        fs.rmSync(dir.path, { recursive: true });
      })
    );
    // for await (const dir of directories) {
    //   // cli.action.start(`deleting node_modules`, `${dir.path} ${this.genDirSize(dir)}`, {stdout: true})

    //   progression.increment()
    //   fs.rmdirSync(dir.path, {recursive: true})
    // }
    // cli.action.stop(`done`)
    progression.stop();
    return true;
  }

  genDirSize(dir: FileInfo, unit = "MB") {
    if (dir.info?.size) {
      switch (unit) {
        case "KB":
          return "[" + (dir.info.size / 1024).toFixed(0) + " KB]";

        case "MB":
          return "[" + (dir.info.size / 1024 / 1024).toFixed(1) + " MB]";

        case "GB":
          return "[" + (dir.info.size / 1024 / 1024 / 1024).toFixed(2) + " GB]";
      }
    }

    return "[undefined size]";
  }

  async calculateSize() {
    // if (isDebug) console.time("full_size_calc")
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

    // if (isDebug) console.timeEnd("full_size_calc")
  }
}

export = Execute;
