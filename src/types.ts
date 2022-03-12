export interface FilesystemError extends Error {
  errno: number;
  syscall: string;
  code: string;
  path: string;
}
export interface KVStore<V> {
  [key: string]: V;
}
export interface FileInfo extends Record<string, any> {
  path: string;
  info: KVStore<any>;
}
