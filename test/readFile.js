import fs from "fs";
import path from "path";

export function getFileContent(fileRelativePath) {
  const fileAbsolutePath = path.resolve(__dirname, fileRelativePath);
  let result = fs.readFileSync(fileAbsolutePath, "utf8");
  result = result.trim();
  return result;
}
