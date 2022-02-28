"use strict";
// export {run} from '@oclif/command'
const tslib_1 = require("tslib");
/* eslint-disable no-warning-comments, no-console, max-depth */
const command_1 = require("@oclif/command");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const cli_ux_1 = tslib_1.__importDefault(require("cli-ux"));
const util_1 = tslib_1.__importDefault(require("util"));
const errors_1 = require("./errors");
const fast_folder_size_1 = tslib_1.__importDefault(require("fast-folder-size"));
// const isDebug = Boolean(process.env.DEBUG)
function isValidError(x) {
    return typeof x.message === "string";
}
function isFileError(x) {
    return typeof x.errno === "number";
}
class Execute extends command_1.Command {
    constructor() {
        super(...arguments);
        this.module_path_list = [];
        this.counted = 0;
        this.remove_vendor = false;
    }
    async run() {
        const { flags } = this.parse(Execute);
        this.remove_vendor = flags.vendor;
        cli_ux_1.default.action.start("Thinking", `Searching ${path.resolve(flags.path)} for the modules.`, { stdout: true });
        // if (isDebug) console.time("directory_search")
        await this.execDirectorySearch(flags.path, 0, flags.depth);
        // if (isDebug) console.timeEnd("directory_search")
        if (flags.size) {
            cli_ux_1.default.action.start("Thinking", "Calculating size (might take a moment)", {
                stdout: true,
            });
            console.time("full_size_calc");
            await this.calculateSize();
            console.timeEnd("full_size_calc");
        }
        // if (isDebug) console.time("build_table")
        const tableColumnConfig = () => {
            const base = {
                path: {
                    header: `Folder path (${this.module_path_list.length} Items)`,
                },
            };
            if (flags.size)
                base.size = {
                    header: "Size on disk",
                    get: (row) => { var _a; return this.genDirSize(row, ((_a = row.info) === null || _a === void 0 ? void 0 : _a.size) < 1e7 ? "KB" : "MB"); },
                };
            return base;
        };
        cli_ux_1.default.action.stop(`done.`);
        cli_ux_1.default.table(this.module_path_list, tableColumnConfig());
        // if (isDebug) console.timeEnd("build_table")
        let total = 0;
        for (const fullFile of this.module_path_list) {
            if (fullFile.info.size)
                total += fullFile.info.size;
        }
        this.log(`Total: ${flags.size
            ? (total / 1024 / 1024 / 1024).toFixed(2) + "GB"
            : "not calculated"} -- Searched ${this.counted.toFixed(0)} files`);
        // TODO: allow selection of modules to delete
        this.log(`WARNING: Your files will be permenantly deleted, double check the list.`);
        if (await cli_ux_1.default.confirm("Confirm delete all node_modules found above? (yes/no)")) {
            await this.execDirectoryDelete(this.module_path_list);
            this.log(`Completed, your node_modules have been cleaned${flags.size
                ? " and you saved " + (total / 1024 / 1024 / 1024).toFixed(2) + "GB"
                : ""}`);
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
                                (this.remove_vendor && directory.name === "vendor")) {
                                this.module_path_list.unshift({
                                    path: full_path,
                                    info: { size: 0 },
                                });
                                return;
                            }
                            await this.execDirectorySearch(path.resolve(full_path), current_depth + 1, max_depth);
                        }
                        this.counted++;
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
            if (isValidError(e)) {
                if (isFileError(e))
                    errors_1.opendir_error(this, e);
                this.debug(e);
            }
        }
    }
    async execDirectoryDelete(directories) {
        const progression = cli_ux_1.default.progress();
        progression.start(directories.length, 0);
        // cli.action.start(`deleting node_modules`, `Initialising`, {stdout: true})
        await Promise.all(directories.map(async (dir) => {
            if (!fs.existsSync(dir.path))
                return;
            progression.increment();
            fs.rmSync(dir.path, { recursive: true });
        }));
        // for await (const dir of directories) {
        //   // cli.action.start(`deleting node_modules`, `${dir.path} ${this.genDirSize(dir)}`, {stdout: true})
        //   progression.increment()
        //   fs.rmdirSync(dir.path, {recursive: true})
        // }
        // cli.action.stop(`done`)
        progression.stop();
        return true;
    }
    genDirSize(dir, unit = "MB") {
        var _a;
        if ((_a = dir.info) === null || _a === void 0 ? void 0 : _a.size) {
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
        var e_2, _a;
        // if (isDebug) console.time("full_size_calc")
        const getFolderSize = util_1.default.promisify(fast_folder_size_1.default);
        try {
            for (var _b = tslib_1.__asyncValues(this.module_path_list), _c; _c = await _b.next(), !_c.done;) {
                const fullFile = _c.value;
                let folderSizeFull;
                try {
                    folderSizeFull = await getFolderSize(fullFile.path);
                }
                catch (error) {
                    if (isValidError(error)) {
                        if (isFileError(error))
                            errors_1.opendir_error(this, error);
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
        // if (isDebug) console.timeEnd("full_size_calc")
    }
}
Execute.description = "List & delete all (node_modules & vendor) folders within path.";
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
    size: command_1.flags.boolean({
        char: "s",
        description: "calculate folder & total sizes (takes a minute)",
    }),
    vendor: command_1.flags.boolean({ description: "clean php composer too." }),
};
module.exports = Execute;
