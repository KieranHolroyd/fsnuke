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
    execDirectorySearch(search_path: string, current_depth: number, max_depth: number): Promise<void>;
    count(): void;
    countError(): void;
    execDirectoryDelete(directories: FileInfo[]): Promise<boolean>;
    calculateSize(): Promise<void>;
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
    timeIfTrue<T>(condition: boolean, time_name: string, func: (...args: any[]) => Promise<T>, func_args: any[]): Promise<T>;
}
export = Execute;
