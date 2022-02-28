"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opendir_error = void 0;
function opendir_error(cli_ref, e) {
    switch (e.code) {
        case "ENOENT" || "ENOTDIR" || "EBADF":
            cli_ref.log(`${e.path} does not exist.`);
            break;
        case "EACCES":
            cli_ref.log(`accessing ${e.path}. Permission denied.`);
            break;
        case "EMFILE" || "ENFILE" || "ENOMEM":
            cli_ref.log(`Lack of system resources to complete this operation. throwing exception.`);
            throw e;
    }
}
exports.opendir_error = opendir_error;
