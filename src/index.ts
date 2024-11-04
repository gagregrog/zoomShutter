import { ZoomMonitor } from "./zoom/monitor";
import { Arduino } from "./serial/arduino";
import { OnStatusChange } from "./zoom/monitor";
import { InputStatus } from "./zoom/status";
import { sleep } from "./sleep";

async function main() {
  const arduino = new Arduino();
  await arduino.connect();
  const onStatusChange: OnStatusChange = (status, inputs) => {
    console.log(status, inputs);
    if (inputs?.video === InputStatus.ON) {
      arduino.openServo();
    } else {
      arduino.closeServo();
    }
  };

  try {
    const monitor = new ZoomMonitor(onStatusChange);
    monitor.run();
  } catch (error) {
    arduino.closeServo();
    await sleep(1500);
    arduino.disconnect();
    throw error;
  }
}

main().catch(console.error);
