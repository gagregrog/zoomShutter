import { ReadlineParser, SerialPort } from "serialport";
import { sleep } from "../sleep";

const RECONNECT_INTERVAL = 5000;

const OPEN_SERVO = "1" as const;
const CLOSE_SERVO = "2" as const;

export class Arduino {
  port: SerialPort | null = null;
  requestedDisconnect: boolean = false;

  async connect(): Promise<this> {
    const arduino = await Arduino.find();

    if (!arduino) {
      console.log(
        "Could not find Arduino. Trying again in",
        RECONNECT_INTERVAL / 1000,
        "seconds",
      );
      await sleep(RECONNECT_INTERVAL);
      return this.connect();
    }

    this.port = new SerialPort({
      path: arduino.path,
      baudRate: 115200,
    });

    this.port.on("error", console.error);
    this.port.on("close", () => {
      this.port = null;
      console.log("Connection to Arduino closed");
      if (!this.requestedDisconnect) {
        console.log(
          "Trying to reconnect in",
          RECONNECT_INTERVAL / 1000,
          "seconds",
        );
        setTimeout(this.connect.bind(this), RECONNECT_INTERVAL);
      }
    });

    console.log(`Connected to Arduino on port ${arduino.path}`);

    const parser = this.port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
    parser.on("data", (data) => {
      console.log("From Arduino:", data);
    });

    return this;
  }

  disconnect() {
    this.requestedDisconnect = true;
    if (this.port) {
      this.port.close();
    }
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
      console.error("Cannot write to Arduino before opening port");
    }
    return this.port?.write(message);
  }

  static async find() {
    const ports = await SerialPort.list();
    return ports.find((port) =>
      port.manufacturer?.toLowerCase().includes("arduino"),
    );
  }
}
