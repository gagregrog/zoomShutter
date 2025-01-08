import { ReadlineParser, SerialPort } from "serialport";
import { sleep } from "../help/sleep";
import { Logger } from "../help/log";

const PORT_BUSY = "Error Resource temporarily unavailable Cannot lock port";

const RECONNECT_INTERVAL = 5000;

const OPEN_SERVO = "1" as const;
const CLOSE_SERVO = "2" as const;

enum Warnings {
  NOT_FOUND = "NOT_FOUND",
  BUSY = "BUSY",
  DISCONNECTED = "DISCONNECTED",
  UNKNOWN = "UNKNOWN",
  NONE = "NONE",
}

export class Arduino {
  private port: SerialPort | null = null;
  private requestedDisconnect: boolean = false;
  private logger = new Logger("arduino", "blueBright");
  private warning = Warnings.NONE;

  async connect(): Promise<this> {
    let didError = false;
    const arduino = await Arduino.find();

    if (!arduino) {
      if (this.warning !== Warnings.NOT_FOUND) {
        this.logger.warn("Could not find Arduino");
      }
      return this.reconnectAfterDelay(this.setWarning(Warnings.NOT_FOUND));
    }

    this.port = new SerialPort({
      path: arduino.path,
      baudRate: 115200,
    });

    this.port
      .pipe(new ReadlineParser({ delimiter: "\r\n" }))
      .on("data", (data) => {
        this.logger.log("message", "cyanBright")(data);
      });

    this.port.on("error", (error) => {
      didError = true;
      const warning =
        error.message === PORT_BUSY ? Warnings.BUSY : Warnings.UNKNOWN;
      if (warning === Warnings.BUSY && this.warning !== warning) {
        this.logger.warn(`Found device at ${arduino.path} but it is busy.`);
      } else if (warning === Warnings.UNKNOWN) {
        this.logger.error(error.message);
      }

      if (!this.port?.isOpen) {
        return this.reconnectAfterDelay(this.setWarning(warning));
      }
    });

    this.port.on("close", async () => {
      this.port = null;
      this.logger.warn("Connection closed");
      if (!this.requestedDisconnect) {
        return this.reconnectAfterDelay(this.setWarning(Warnings.DISCONNECTED));
      }
    });

    await sleep(200);
    if (!didError) {
      this.logger.info(`Connected on port ${arduino.path}\n`);
    }

    return this;
  }

  private async reconnectAfterDelay(announce: boolean) {
    if (announce) {
      this.logger.info(
        `Polling to connect every ${RECONNECT_INTERVAL / 1000} seconds...\n`,
      );
    }
    await sleep(RECONNECT_INTERVAL);
    return this.connect();
  }

  disconnect() {
    this.requestedDisconnect = true;
    if (this.port) {
      this.port.close();
    }
    return this;
  }

  openServo() {
    this.write(OPEN_SERVO);
    return this;
  }

  closeServo() {
    this.write(CLOSE_SERVO);
    return this;
  }

  private write(message: string) {
    if (!this.port) {
      this.logger.error("Cannot write before opening port\n");
    } else {
      this.port?.write(message);
    }

    return this;
  }

  private setWarning(warning: Warnings) {
    const didChange = warning !== this.warning;
    this.warning = warning;

    return didChange;
  }

  static async find() {
    const ports = await SerialPort.list();
    return ports.find((port) =>
      port.manufacturer?.toLowerCase().includes("arduino"),
    );
  }
}
