#!/usr/bin/env node

import { ZoomMonitor } from "./zoom/monitor";
import { Arduino } from "./serial/arduino";
import { OnStatusChange } from "./zoom/monitor";
import { InputStatus } from "./zoom/status";
import { sleep } from "./help/sleep";
import { Logger } from "./help/log";
import { Mode, StdIn } from "./serial/stdin";

const logger = new Logger("main", "whiteBright");

async function main() {
  const arduino = new Arduino();
  await arduino.connect();

  process.on("SIGINT", () => {
    console.log();
    logger.warn("Interrupt detected. Cleaning up...\n");
    try {
      arduino.closeServo();
    } catch (error: unknown) {
      logger.error((error as Error)?.message);
    } finally {
      process.exit();
    }
  });

  const overrides = new StdIn(arduino);
  const onStatusChange: OnStatusChange = (results) => {
    if (overrides.getMode() === Mode.MANUAL) {
      logger.warn("Manual mode enabled. Ignoring status change.");
      return;
    }

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

main().catch(logger.error);
