#!/usr/bin/env node

import { ZoomMonitor } from "./zoom/monitor";
import { Arduino } from "./serial/arduino";
import { OnStatusChange, OnStatuseChangeResult } from "./zoom/monitor";
import { InputStatus } from "./zoom/status";
import { sleep } from "./help/sleep";
import { Logger } from "./help/log";
import { Mode, StdIn } from "./serial/stdin";

const logger = new Logger("main", "whiteBright");

async function main() {
  const arduino = new Arduino();
  await arduino.connect();

  // Waits so the close command reaches the Arduino before exit.
  const shutdown = async (code: number) => {
    try {
      arduino.closeServo();
      await sleep(1500);
    } catch (error: unknown) {
      logger.error((error as Error)?.message);
    } finally {
      process.exit(code);
    }
  };

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      console.log();
      logger.warn(`${signal} received. Cleaning up...\n`);
      shutdown(0);
    });
  }

  // The monitor polls in timers, so its errors surface here, not in main().
  process.on("unhandledRejection", (reason) => {
    logger.error("Fatal:", reason);
    shutdown(1);
  });

  let lastResults: OnStatuseChangeResult | null = null;
  const syncServo = () => {
    if (lastResults?.inputs?.video === InputStatus.ON) {
      arduino.openServo();
    } else {
      arduino.closeServo();
    }
  };

  const overrides = new StdIn(arduino, syncServo);
  const onStatusChange: OnStatusChange = (results) => {
    lastResults = results;
    if (overrides.getMode() === Mode.MANUAL) {
      logger.warn("Manual mode enabled. Ignoring status change.");
      return;
    }

    syncServo();
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
