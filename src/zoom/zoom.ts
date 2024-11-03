import { runAppleScriptFile } from "./applescript";
import { handleZoomError } from "./errors";
import { type ZoomOsascriptResponse } from "./shared";

const ZOOM_SCRIPT = `${__dirname}/../scripts/get_zoom_status.scpt`;

export async function getZoomStatus() {
  const status = await runAppleScriptFile(ZOOM_SCRIPT);
  const { error, video, mic } = JSON.parse(status) as ZoomOsascriptResponse;

  if (error) {
    return handleZoomError(error);
  }

  console.log({ video, mic });
}
