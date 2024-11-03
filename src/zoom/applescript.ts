import { exec } from "node:child_process";

export function runAppleScriptFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`osascript ${filePath}`, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(error?.message || stderr);
        return;
      }
      resolve(stdout);
    });
  });
}
