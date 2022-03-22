"use strict";
// export {run} from '@oclif/command'
const tslib_1 = require("tslib");
/* eslint-disable no-warning-comments, no-console, max-depth */
const command_1 = require("@oclif/command");
const cli_ux_1 = tslib_1.__importDefault(require("cli-ux"));
const fast_folder_size_1 = tslib_1.__importDefault(require("fast-folder-size"));
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const process_1 = require("process");
const rimraf_1 = require("rimraf");
const util_1 = tslib_1.__importDefault(require("util"));
const error_handling_1 = require("./libs/error_handling");
const file_size_1 = tslib_1.__importDefault(require("./libs/file_size"));
/* DEBUG OPTIONS */
const isDebug = Boolean(process.env.DEBUG);
const isVerbose = Boolean(process.env.VERBOSE);
/* CLI Entry Class */
class Execute extends command_1.Command {
    constructor() {
        super(...arguments);
        this.module_path_list = [];
        this.counted = 0;
        this.errors = 0;
        this.remove_vendor = false;
    }
    /* CLI Entry function */
    async run() {
        const { flags } = this.parse(Execute);
        console.log(`Searching ${path.resolve(flags.path)} for the modules.`);
        cli_ux_1.default.action.start("Thinking", `Searching ${path.resolve(flags.path)} for the modules.`, { stdout: true });
        await this.timeIfTrue(isDebug, "directory_search", this.execDirectorySearch.bind(this), [flags.path, 0, flags.depth]);
        console.log(`Found ${this.module_path_list.length} directories. calculating size.`);
        cli_ux_1.default.action.start("Thinking", "calculating space savings", {
            stdout: true,
        });
        await this.timeIfTrue(isDebug, "calculate_size", this.calculateSize.bind(this), []);
        const tableColumnConfig = () => {
            const base = {
                path: {
                    header: `Folder path (${this.module_path_list.length} Items)`,
                },
            };
            base.size = {
                header: "Size on disk",
                get: (row) => { var _a; return new file_size_1.default(((_a = row.info) === null || _a === void 0 ? void 0 : _a.size) || 0).readableSize(); },
            };
            return base;
        };
        cli_ux_1.default.action.stop(`done.`);
        cli_ux_1.default.table(this.module_path_list, tableColumnConfig());
        let total = 0;
        for (const fullFile of this.module_path_list) {
            if (fullFile.info.size)
                total += fullFile.info.size;
        }
        total = new file_size_1.default(total);
        this.log(`Total: ${total.readableSize()} -- Searched ${this.counted.toFixed(0)} files -- Experienced ${this.errors.toFixed(0)} errors. ${this.errors > 0 ? "run with VERBOSE=true to view errors." : ""}`);
        // TODO: allow selection of modules to delete
        this.log(`WARNING: Your files will be permenantly deleted, double check the list.`);
        if (await cli_ux_1.default.confirm("Confirm delete all node_modules found above? (y/n)")) {
            await this.execDirectoryDelete(this.module_path_list);
            this.log(`Completed, your node_modules have been cleaned${" and you saved " + total.readableSize()}`);
        }
        else {
            this.log(`Not deleted; exiting`);
        }
    }
    async execDirectorySearch(search_path, current_depth, max_depth) {
        var e_1, _a;
        try {
            if (search_path && current_depth < max_depth) {
                const abs_path = path.resolve(search_path);
                const dirs = fs.opendirSync(abs_path);
                try {
                    for (var dirs_1 = tslib_1.__asyncValues(dirs), dirs_1_1; dirs_1_1 = await dirs_1.next(), !dirs_1_1.done;) {
                        const directory = dirs_1_1.value;
                        const full_path = path.resolve(search_path, directory.name);
                        if (directory.isDirectory() && fs.existsSync(full_path)) {
                            if (directory.name === "node_modules" ||
                                directory.name === "vendor") {
                                this.module_path_list.unshift({
                                    path: full_path,
                                    info: { size: 0 },
                                });
                                return;
                            }
                            await this.execDirectorySearch(path.resolve(full_path), current_depth + 1, max_depth);
                        }
                        this.count();
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (dirs_1_1 && !dirs_1_1.done && (_a = dirs_1.return)) await _a.call(dirs_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        catch (e) {
            if (isVerbose && error_handling_1.isValidError(e)) {
                if (error_handling_1.isFileError(e))
                    error_handling_1.opendir_error(this, e);
                if (!error_handling_1.isFileError(e))
                    console.error(e);
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
    async execDirectoryDelete(directories) {
        this.log(`Deleting ${directories.length} directories`);
        const progression = cli_ux_1.default.progress();
        progression.start(directories.length, 0);
        await Promise.all(directories.map(async (dir) => {
            if (!fs.existsSync(dir.path))
                return;
            rimraf_1.sync(dir.path);
            progression.increment();
        }));
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
        var e_2, _a;
        const getFolderSize = util_1.default.promisify(fast_folder_size_1.default);
        try {
            for (var _b = tslib_1.__asyncValues(this.module_path_list), _c; _c = await _b.next(), !_c.done;) {
                const fullFile = _c.value;
                let folderSizeFull;
                try {
                    folderSizeFull = await getFolderSize(fullFile.path);
                }
                catch (error) {
                    if (error_handling_1.isValidError(error)) {
                        if (error_handling_1.isFileError(error))
                            error_handling_1.opendir_error(this, error);
                        this.debug(error);
                    }
                }
                fullFile.info.size = folderSizeFull;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
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
    async timeIfTrue(condition, time_name, func, func_args) {
        if (!condition)
            return await func(...func_args);
        console.time(time_name);
        let result = await func(...func_args);
        process_1.stdout.write(`\u001b[36m\u001b[4m!DEBUG_TIMING!\u001b[0m `);
        console.timeEnd(time_name);
        return result;
    }
}
Execute.description = "Filsystem Nuke. A tool to clean up `temp` files such as node_modules, bower_components, vendor and other temporary files.";
Execute.flags = {
    path: command_1.flags.string({
        description: "path to start recursion",
        char: "p",
        default: "./",
    }),
    help: command_1.flags.help({ char: "h" }),
    depth: command_1.flags.integer({
        description: "directory recursion depth",
        char: "d",
        default: 5,
    }),
};
module.exports = Execute;
