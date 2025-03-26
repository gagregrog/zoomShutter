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
  private isOpen: boolean = false;

  constructor(arduino: Arduino) {
    this.arduino = arduino;
    const rl = readLine.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", (line: string) => {
      const command = line.toLowerCase();
      if (command.startsWith("o") || command.startsWith("1")) {
        console.log();
        this.logger.info("Entering manual mode\n");
        this.openServo();
      } else if (command.startsWith("c") || command.startsWith("0")) {
        console.log();
        this.logger.info("Entering automatic mode\n");
        this.closeServo();
      } else if (command.startsWith("t")) {
        console.log();
        if (this.isOpen) {
          this.logger.info("Entering automatic mode\n");
          this.closeServo();
        } else {
          this.logger.info("Entering manual mode\n");
          this.openServo();
        }
      } else {
        this.logger.warn("unrecognized command\n");
      }
    });

    rl.on("close", () => {
      this.logger.info("closed\n");
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
    this.isOpen = true;
  }

  closeServo() {
    this.arduino.closeServo();
    this.mode = Mode.AUTO;
    this.isOpen = false;
  }
}
