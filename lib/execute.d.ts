import { Command, flags } from "@oclif/command";
import { FileInfo } from "./types";
declare class Execute extends Command {
    module_path_list: FileInfo[];
    counted: number;
    remove_vendor: boolean;
    static description: string;
    static flags: {
        path: flags.IOptionFlag<string>;
        help: import("@oclif/parser/lib/flags").IBooleanFlag<void>;
        depth: import("@oclif/parser/lib/flags").IOptionFlag<number>;
        size: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        vendor: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
    execDirectorySearch(search_path: string, current_depth: number, max_depth: number): Promise<void>;
    execDirectoryDelete(directories: FileInfo[]): Promise<boolean>;
    genDirSize(dir: FileInfo, unit?: string): string;
    calculateSize(): Promise<void>;
}
export = Execute;
