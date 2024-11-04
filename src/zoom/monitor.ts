import { ZoomStatus } from "../zoom/shared";
import { getZoomStatus, Inputs } from "../zoom/status";

enum Interval {
  FAST = 500,
  SLOW = 5_000,
}

export type OnStatusChange = (
  status: ZoomStatus,
  inputs: Inputs | null,
) => void | Promise<void>;

export class ZoomMonitor {
  status: ZoomStatus = ZoomStatus.UNKNOWN;
  inputs: Inputs | null = null;
  interval: Interval = Interval.FAST;
  onChange: OnStatusChange;

  constructor(onChange: OnStatusChange) {
    this.onChange = onChange;
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
    if (
      status !== this.status ||
      this.inputs?.mic !== inputs?.mic ||
      this.inputs?.video !== inputs?.video
    ) {
      await this.onChange(status, inputs);
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
