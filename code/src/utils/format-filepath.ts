import { URLBASE } from "src/api/axios";

export function formatFilePath(path?: string) {
  return path ? `${URLBASE}/api/file?path=${path}` : '';
}
