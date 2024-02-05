import startFileManager from "./src/fileManager.js";

function main() {
  const args = process.argv.slice(2);
  let username = "";
  args.forEach((arg) => {
    if (arg.startsWith("--username=")) {
      username = arg.split("=")[1];
    }
  });

  startFileManager(username);
}

console.log("File Manager is starting...");

main();
