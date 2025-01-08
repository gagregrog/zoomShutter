import * as readLine from "readline";
import { Arduino } from "./arduino";
import { Logger } from "../help/log";

export enum Mode {
  AUTO = "AUTO",
  MANUAL = "MANUAL",
}

export class StdIn {
  private logger = new Logger("stdin", "white");
  private arduino: Arduino;
  private mode: Mode = Mode.AUTO;

  constructor(arduino: Arduino) {
    this.arduino = arduino;
    const rl = readLine.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", (line: string) => {
      if (line.toLowerCase().startsWith("open")) {
        console.log();
        this.logger.info("Entering manual mode");
        this.openServo();
      } else if (line.toLowerCase().startsWith("close")) {
        console.log();
        this.logger.info("Entering automatic mode");
        this.closeServo();
      } else {
        this.logger.warn("unrecognized command");
      }
    });

    rl.on("close", () => {
      this.logger.info("closed");
    });

    rl.on("error", (err: Error) => {
      this.logger.error(err.message);
    });
  }

  getMode() {
    return this.mode;
  }

  openServo() {
    this.arduino.openServo();
    this.mode = Mode.MANUAL;
  }

  closeServo() {
    this.arduino.closeServo();
    this.mode = Mode.AUTO;
  }
}
