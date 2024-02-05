import fs from "fs";
import os from "os";
import path from "path";
import readline from "readline";
import zlib from "zlib";

export default function startFileManager(username) {
  console.log(`Welcome to the File Manager, ${username}!`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${username}@file-manager> `,
  });

  rl.prompt();

  let currentDirectory = os.homedir();

  rl.on("line", (line) => {
    const [command, ...args] = line.trim().split(" ");

    switch (command.toLowerCase()) {
      case "help":
        displayHelp();
        break;
      case "ls":
        listFiles();
        break;
      case "cd":
        changeDirectory(args[0]);
        break;
      case "up":
        goUp();
        break;
      case "cat":
        displayFileContent(args[0]);
        break;
      case "add":
        createEmptyFile(args[0]);
        break;
      case "rn":
        renameFile(args[0], args[1]);
        break;
      case "cp":
        copyFile(args[0], args[1]);
        break;
      case "mv":
        moveFile(args[0], args[1]);
        break;
      case "rm":
        deleteFile(args[0]);
        break;
      case "os":
        osInfo(args[0]);
        break;
      case "hash":
        calculateHash(args[0]);
        break;
      case "compress":
        compressFile(args[0], args[1]);
        break;
      case "decompress":
        decompressFile(args[0], args[1]);
        break;
      case "exit":
        exitFileManager();
        break;
      default:
        console.log(
          `Invalid input: unknown command '${command}'. Type 'help' to see available commands.`
        );
        break;
    }

    rl.prompt();
  });

  function displayHelp() {
    console.log("Available commands:");
    console.log("  help - Show available commands");
    console.log("  ls - List files and directories");
    console.log("  cd <directory> - Change directory");
    console.log("  cat <filename> - Display file content");
    console.log("  up - Go to parent directory");
    console.log("  add <filename> - Create empty file");
    console.log("  rn <path_to_file> <new_filename> - Rename file");
    console.log("  cp <path_to_file> <path_to_new_directory> - Copy file");
    console.log("  mv <path_to_file> <path_to_new_directory> - Move file");
    console.log("  rm <path_to_file> - Delete file");
    console.log("  os --eol - Get default system End-Of-Line");
    console.log("  os --cpus - Get host machine CPUs info");
    console.log("  os --homedir - Get home directory");
    console.log("  os --username - Get current system user name");
    console.log("  os --architecture - Get CPU architecture");
    console.log("  hash <path_to_file> - Calculate hash for file");
    console.log(
      "  compress <path_to_file> <path_to_destination> - Compress file"
    );
    console.log(
      "  decompress <path_to_file> <path_to_destination> - Decompress file"
    );
    console.log("  exit - Exit the File Manager");
  }
  function listFiles() {
    try {
      const files = fs.readdirSync(currentDirectory);
      files.forEach((file) => console.log(file));
    } catch (error) {
      console.log("Operation failed:", error.message);
    }
  }

  function changeDirectory(directory) {
    if (!directory) {
      console.log("Invalid input: missing directory argument.");
      return;
    }

    const targetDirectory = path.resolve(currentDirectory, directory);
    if (
      fs.existsSync(targetDirectory) &&
      fs.lstatSync(targetDirectory).isDirectory()
    ) {
      currentDirectory = targetDirectory;
    } else {
      console.log("Invalid input: directory not found.");
    }
  }

  function goUp() {
    const parentDirectory = path.resolve(currentDirectory, "..");
    if (
      parentDirectory !== currentDirectory &&
      fs.existsSync(parentDirectory)
    ) {
      currentDirectory = parentDirectory;
    } else {
      console.log("Invalid input: already in root directory.");
    }
  }

  function displayFileContent(filename) {
    if (!filename) {
      console.log("Invalid input: missing filename argument.");
      return;
    }

    const filePath = path.resolve(currentDirectory, filename);
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath, "utf8");
      console.log(content);
    } else {
      console.log("Invalid input: file not found.");
    }
  }

  function createEmptyFile(filename) {
    if (!filename) {
      console.log("Invalid input: missing filename argument.");
      return;
    }

    const filePath = path.resolve(currentDirectory, filename);
    fs.writeFileSync(filePath, "");
  }

  function renameFile(oldFilename, newFilename) {
    if (!oldFilename || !newFilename) {
      console.log("Invalid input: missing arguments.");
      return;
    }

    const oldFilePath = path.resolve(currentDirectory, oldFilename);
    const newFilePath = path.resolve(currentDirectory, newFilename);
    fs.renameSync(oldFilePath, newFilePath);
  }

  function copyFile(sourcePath, destinationPath) {
    if (!sourcePath || !destinationPath) {
      console.log("Invalid input: missing arguments.");
      return;
    }

    const source = path.resolve(currentDirectory, sourcePath);
    const destination = path.resolve(currentDirectory, destinationPath);
    fs.copyFileSync(source, destination);
  }

  function moveFile(sourcePath, destinationPath) {
    if (!sourcePath || !destinationPath) {
      console.log("Invalid input: missing arguments.");
      return;
    }

    const source = path.resolve(currentDirectory, sourcePath);
    const destination = path.resolve(currentDirectory, destinationPath);
    fs.renameSync(source, destination);
  }

  function deleteFile(filename) {
    if (!filename) {
      console.log("Invalid input: missing filename argument.");
      return;
    }

    const filePath = path.resolve(currentDirectory, filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("Operation failed:", err.message);
      } else {
        console.log("File deleted successfully.");
      }
    });
  }

  function osInfo(option) {
    switch (option.toLowerCase()) {
      case "--eol":
        console.log(`End-Of-Line (EOL): ${os.EOL}`);
        break;
      case "--cpus":
        const cpus = os.cpus();
        console.log("Host machine CPUs info:");
        cpus.forEach((cpu, index) => {
          console.log(
            `CPU ${index + 1}: Model: ${cpu.model}, Speed: ${cpu.speed} MHz`
          );
        });
        break;
      case "--homedir":
        console.log(`Home directory: ${os.homedir()}`);
        break;
      case "--username":
        console.log(`Current system user name: ${os.userInfo().username}`);
        break;
      case "--architecture":
        console.log(`CPU architecture: ${os.arch()}`);
        break;
      default:
        console.log(`Invalid input: unknown option '${option}'.`);
        break;
    }
  }

async function calculateHash(fileName) {
  try {
    const fullPath = path.resolve(currDirectory, filePath);
    const hash = crypto.createHash("sha256");

    const fileStream = fs.createReadStream(fullPath);

    fileStream.on("data", (data) => {
      hash.update(data);
    });

    fileStream.on("end", () => {
      const fileHash = hash.digest("hex");
      console.log(`Hash '${filePath}': ${fileHash}`);
    });

    fileStream.on("error", (error) => {
      console.log(error);
    });
  } catch (error) {
    console.error("Operation failed:", error.message);
  }
}

  function compressFile(sourcePath, destinationPath) {
    if (!sourcePath || !destinationPath) {
      console.log("Invalid input: missing arguments.");
      return;
    }

    const source = path.resolve(currentDirectory, sourcePath);
    const destination = path.resolve(currentDirectory, destinationPath);
    const sourceStream = fs.createReadStream(source);
    const destinationStream = fs.createWriteStream(destination + ".br");
    pipeline(sourceStream, zlib.brotliCompress(), destinationStream, (err) => {
      if (err) {
        console.log("Compression failed:", err.message);
      } else {
        console.log("File compressed successfully.");
      }
    });
  }

  function decompressFile(sourcePath, destinationPath) {
    if (!sourcePath || !destinationPath) {
      console.log("Invalid input: missing arguments.");
      return;
    }

    const source = path.resolve(currentDirectory, sourcePath);
    const destination = path.resolve(currentDirectory, destinationPath);
    const sourceStream = fs.createReadStream(source);
    const destinationStream = fs.createWriteStream(
      destination.replace(".br", "")
    );
    pipeline(
      sourceStream,
      zlib.brotliDecompress(),
      destinationStream,
      (err) => {
        if (err) {
          console.log("Decompression failed:", err.message);
        } else {
          console.log("File decompressed successfully.");
        }
      }
    );
  }

  function exitFileManager() {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
    rl.close();
    process.exit(0);
  }

  console.log(`Starting working directory is: ${currentDirectory}`);
}
