import { Logger } from "../help/log";
import { ZoomStatus } from "../zoom/shared";
import { getZoomStatus, Inputs } from "../zoom/status";

enum Interval {
  FAST = 500,
  SLOW = 5_000,
}

export type OnStatuseChangeResult = {
  status: ZoomStatus;
  inputs: Inputs | null;
  previousStatus: ZoomStatus;
};

export type OnStatusChange = (
  result: OnStatuseChangeResult,
) => void | Promise<void>;

export class ZoomMonitor {
  status: ZoomStatus = ZoomStatus.UNKNOWN;
  inputs: Inputs | null = null;
  interval: Interval = Interval.FAST;
  onChange: OnStatusChange;
  log: boolean = false;
  logger = new Logger("zoom", "blue");

  constructor(onChange: OnStatusChange, options?: { log?: boolean }) {
    this.onChange = onChange;
    this.log = Boolean(options?.log);
  }

  run() {
    this.loop();
  }

  loop() {
    setTimeout(async () => {
      await this.processStatus();
      this.loop();
    }, this.interval);
  }

  async processStatus() {
    const { status, inputs } = await getZoomStatus();
    this.interval = getPollIntervalMs(status);

    const didChange =
      status !== this.status ||
      this.inputs?.mic !== inputs?.mic ||
      this.inputs?.video !== inputs?.video;

    if (didChange) {
      const results = {
        status,
        inputs,
        previousStatus: this.status,
      };

      if (this.log) this.logger.info(prettyStatus(results), "\n");

      try {
        await this.onChange(results);
      } catch (e) {
        this.logger.error("(onChange)", (e as Error)?.message);
      }
    }
    this.status = status;
    this.inputs = inputs;
  }
}

function getPollIntervalMs(status: ZoomStatus) {
  switch (status) {
    case ZoomStatus.IN_MEETING:
      return Interval.FAST;
    case ZoomStatus.NOT_OPEN:
    case ZoomStatus.NO_MEETING:
    case ZoomStatus.UNKNOWN:
    default:
      return Interval.SLOW;
  }
}

function prettyStatus(result: OnStatuseChangeResult) {
  switch (result.status) {
    case ZoomStatus.NO_MEETING:
      if (result.previousStatus === ZoomStatus.IN_MEETING) {
        return "Meeting ended";
      }
      return "Waiting for meeting";
    case ZoomStatus.NOT_OPEN:
      return "Application Closed";
    case ZoomStatus.IN_MEETING:
      if (result.previousStatus === ZoomStatus.NO_MEETING) {
        return `Meeting joined ${result.inputs}`;
      }
      return `Input changed: ${result.inputs}`;
    case ZoomStatus.UNKNOWN:
    default:
      return "Unknown status";
  }
}
