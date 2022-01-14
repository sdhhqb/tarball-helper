const fs = require("fs");

class Logger {
  constructor() {
    const output = fs.createWriteStream("./download.log");
    this.fileLogger = new console.Console({ stdout: output });
  }

  log(str) {
    this.fileLogger.log(str);
  }
}
const logger = new Logger();

module.exports = logger;
