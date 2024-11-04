import { runAppleScriptFile } from "./applescript";
import { errorToStatus, processZoomError, ZoomError } from "./errors";
import { ZoomStatus, type ZoomOsascriptResponse } from "./shared";

const ZOOM_SCRIPT = `${__dirname}/../scripts/get_zoom_status.scpt`;

export enum InputStatus {
  ON = "ON",
  OFF = "OFF",
  UNKNOWN = "UNKNOWN",
}

export type Zoom = {
  status: ZoomStatus;
  mic: InputStatus | null;
  video: InputStatus | null;
};

export type ZoomInMeeting = {
  status: ZoomStatus.IN_MEETING;
  mic: InputStatus.ON | InputStatus.OFF;
  video: InputStatus.ON | InputStatus.OFF;
};

export type ZoomNoInput = {
  status: ZoomStatus.NOT_OPEN | ZoomStatus.NO_MEETING | ZoomStatus.UNKNOWN;
  mic: null;
  video: null;
};

export async function getZoomStatus() {
  const status = await runAppleScriptFile(ZOOM_SCRIPT);
  const zoomStatus = JSON.parse(status) as ZoomOsascriptResponse;
  const zoomError = processZoomError(zoomStatus.error);

  return normalizeZoomStatus({ ...zoomStatus, error: zoomError });
}

function normalizeZoomStatus(
  zoomStatus: Omit<ZoomOsascriptResponse, "error"> & {
    error: ZoomError | null;
  },
) {
  if (
    !zoomStatus.error &&
    typeof zoomStatus.mic === "boolean" &&
    typeof zoomStatus.video === "boolean"
  ) {
    return {
      status: ZoomStatus.IN_MEETING,
      mic: zoomStatus.mic ? InputStatus.ON : InputStatus.OFF,
      video: zoomStatus.video ? InputStatus.ON : InputStatus.OFF,
    } as ZoomInMeeting;
  }

  return {
    status: errorToStatus(zoomStatus.error),
    mic: null,
    video: null,
  } as ZoomNoInput;
}
