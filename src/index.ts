import { ZoomMonitor } from "./zoom/monitor";
import { Arduino } from "./serial/arduino";
import { OnStatusChange } from "./zoom/monitor";
import { InputStatus } from "./zoom/status";
import { sleep } from "./help/sleep";
import { Logger } from "./help/log";

async function main() {
  const arduino = new Arduino();
  await arduino.connect();
  const onStatusChange: OnStatusChange = (results) => {
    if (results.inputs?.video === InputStatus.ON) {
      arduino.openServo();
    } else {
      arduino.closeServo();
    }
  };

  try {
    const monitor = new ZoomMonitor(onStatusChange, { log: true });
    monitor.run();
  } catch (error) {
    arduino.closeServo();
    await sleep(1500);
    arduino.disconnect();
    throw error;
  }
}

main().catch(new Logger("main", "whiteBright").error);
