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
  private onAuto: () => void;

  constructor(arduino: Arduino, onAuto: () => void) {
    this.arduino = arduino;
    this.onAuto = onAuto;
    const rl = readLine.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", (line: string) => {
      const command = line.toLowerCase();
      if (command.startsWith("o") || command.startsWith("1")) {
        this.enterManual();
      } else if (command.startsWith("c") || command.startsWith("0")) {
        this.enterAuto();
      } else if (command.startsWith("t")) {
        if (this.mode === Mode.MANUAL) {
          this.enterAuto();
        } else {
          this.enterManual();
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

  private enterManual() {
    console.log();
    this.logger.info("Entering manual mode\n");
    this.arduino.openServo();
    this.mode = Mode.MANUAL;
  }

  private enterAuto() {
    console.log();
    this.logger.info("Entering automatic mode\n");
    this.mode = Mode.AUTO;
    this.onAuto();
  }
}
