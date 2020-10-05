/* eslint-disable no-warning-comments */
/* eslint-disable no-console */
/* eslint-disable max-depth */
import {Command, flags} from "@oclif/command"
import * as fs from 'fs'
import * as path from 'path'
import cli from 'cli-ux'
import getFolderSizeCB from 'get-folder-size'
import util from 'util'
import {table} from 'cli-ux/lib/styled/table'

interface KVStore<V> {
  [key: string]: V;
}
interface FileInfo {
  path: string;
  info: KVStore<any>;
}

// const isDebug = Boolean(process.env.DEBUG)

export default class Execute extends Command {
  module_path_list: FileInfo[] = [];

  counted = 0;

  static description = "List & delete all node_modules we find inside [PATH]";

  static examples = [
    `$ nodekill execute ./
[XX.X MB] C:\\Users\\me\\myFiles\\node_modules`,
  ];

  static flags = {
    path: flags.string({char: "p", default: "./", required: true}),
    help: flags.help({char: "h"}),
    depth: flags.integer({char: "d", default: 5}),
    size: flags.boolean({char: "s", description: "Calculate Folder & Total Sizes (takes a minute)"}),
  };

  async run() {
    const {flags} = this.parse(Execute)

    cli.action.start('Thinking', `Searching ${path.resolve(flags.path)} for the modules.`, {stdout: true})
    // if (isDebug) console.time("directory_search")

    await this.execDirectorySearch(flags.path, 0, flags.depth)

    // if (isDebug) console.timeEnd("directory_search")

    if (flags.size) {
      cli.action.start('Thinking', "Calculating size (might take a moment)", {stdout: true})
      await this.calculateSize()
    }

    // if (isDebug) console.time("build_table")

    const tableColumnConfig: () => table.Columns<FileInfo> = () => {
      const base: any = {path: {
        header: `Folder path (${this.module_path_list.length} Items)`,
      }}
      if (flags.size) base.size = {
        header: "Size on disk",
        get: (row: any) => this.genDirSize(row, (row.info?.size < 1e7 ? "KB" : "MB")),
      }
      return base
    }

    cli.table(this.module_path_list, tableColumnConfig())
    cli.action.stop(`done. Run 'nodekill delete${flags.depth ? ' -d ' + flags.depth : ""} to delete all these folders`)

    // if (isDebug) console.timeEnd("build_table")
    let total = 0
    for (const fullFile of this.module_path_list) {
      total += fullFile.info.size
    }
    this.log(`Total: ${(flags.size ? (total / 1024 / 1024 / 1024).toFixed(2) + "GB" : "not calculated")} -- Searched ${this.counted.toFixed(0)} files`)
    // TODO: allow selection of modules to delete
    this.log(`WARNING: Your files will be permenantly deleted, double check the list.`)
    if (await cli.confirm('Confirm delete all node_modules found above? (yes/no)')) {
      await this.execDirectoryDelete(this.module_path_list)
      this.log(`Completed, your node_modules have been cleaned${flags.size ? " and you saved " + (total / 1024 / 1024 / 1024).toFixed(2) + "GB" : ""}`)
    } else {
      this.log(`Not deleted; exiting`)
    }
  }

  async execDirectorySearch(search_path: string, current_depth: number, max_depth: number) {
    try {
      if (search_path && current_depth < max_depth) {
        const abs_path = path.resolve(search_path)
        const dirs = fs.opendirSync(abs_path)
        for await (const directory of dirs) {
          const full_path = path.resolve(search_path, directory.name)
          if (directory.isDirectory() && fs.existsSync(full_path)) {
            if (directory.name === "node_modules") {
              this.module_path_list.unshift({path: full_path, info: {size: 0}})
              return
            }
            await this.execDirectorySearch(path.resolve(full_path), current_depth + 1, max_depth)
          }
          this.counted++
        }
      }
    } catch (error) {
      this.log(`Error Occured: ${error.code} [DEBUG for info]`)
      this.debug(error)
    }
  }

  async execDirectoryDelete(directories: FileInfo[]) {
    const progression = cli.progress()
    progression.start(directories.length, 0)
    // cli.action.start(`deleting node_modules`, `Initialising`, {stdout: true})
    for await (const dir of directories) {
      // cli.action.start(`deleting node_modules`, `${dir.path} ${this.genDirSize(dir)}`, {stdout: true})

      progression.increment()
      fs.rmdirSync(dir.path, {recursive: true})
    }
    // cli.action.stop(`done`)
    progression.stop()
    return true
  }

  genDirSize(dir: FileInfo, unit = "MB") {
    if (dir.info?.size) {
      switch (unit) {
      case "KB":
        return "[" + (dir.info.size / 1024).toFixed(0) + " KB]"

      case "MB":
        return "[" + (dir.info.size / 1024 / 1024).toFixed(1) + " MB]"

      case "GB":
        return "[" + (dir.info.size / 1024 / 1024 / 1024).toFixed(2) + " GB]"
      }
    }

    return "[undefined size]"
  }

  async calculateSize() {
    // if (isDebug) console.time("full_size_calc")
    const getFolderSize = util.promisify(getFolderSizeCB)

    for await (const fullFile of this.module_path_list) {
      let folderSizeFull
      try {
        folderSizeFull = await getFolderSize(fullFile.path)
      } catch (error) {
        this.log(`Error Occured: ${error.code} [DEBUG for info]`)
        this.debug(error)
      }
      fullFile.info.size = folderSizeFull
    }

    // if (isDebug) console.timeEnd("full_size_calc")
  }
}
