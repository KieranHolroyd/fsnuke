import { Command, flags } from "@oclif/command";
import { FileInfo } from "./libs/types";
declare class Execute extends Command {
    module_path_list: FileInfo[];
    counted: number;
    errors: number;
    remove_vendor: boolean;
    static description: string;
    static flags: {
        path: flags.IOptionFlag<string>;
        help: import("@oclif/parser/lib/flags").IBooleanFlag<void>;
        depth: import("@oclif/parser/lib/flags").IOptionFlag<number>;
    };
    run(): Promise<void>;
    /**
     * Recursively search for temporary directories
     *
     * If the given `search_path` is a directory, recurse into it & count directory as explored.
     * Or if the given `search_path` is a file, do nothing.
     * If the directory is a node_modules, bower_components, vendor or other temporary directory,
     * add it to the list of directories to delete & return.
     *
     * If the `current_depth` is above the `max_depth`, return.
     *
     * @param {string} search_path The Folder to search
     * @param {number} current_depth The current depth of the recursion
     * @param {number} max_depth The maximum depth of the recursion
     */
    execDirectorySearch(search_path: string, current_depth: number, max_depth: number): Promise<void>;
    count(): void;
    countError(): void;
    execDirectoryDelete(directories: FileInfo[]): Promise<boolean>;
    calculateSize(): Promise<void>;
}
export = Execute;
