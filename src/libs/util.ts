import { stdout } from "process";

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
	*  !DEBUG_TIMING! function_name: 0.000ms
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
async function timeIfTrue<T>(
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

export { timeIfTrue };
