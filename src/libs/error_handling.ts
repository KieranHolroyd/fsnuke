import { FilesystemError } from "./types";
import Execute from "../execute";

export function opendir_error(cli_ref: Execute, e: FilesystemError) {
  switch (e.code) {
    case "ENOENT" || "ENOTDIR" || "EBADF":
      cli_ref.log(`${e.path} does not exist.`);
      break;
    case "EACCES":
      cli_ref.log(`accessing ${e.path}. Permission denied.`);
      break;
    case "EMFILE" || "ENFILE" || "ENOMEM":
      cli_ref.log(
        `Lack of system resources to complete this operation. throwing exception.`
      );
      throw e;
  }
}

export function isValidError(x: any): x is Error {
  return typeof x.message === "string";
}

export function isFileError(x: any): x is FilesystemError {
  return typeof x.errno === "number";
}
