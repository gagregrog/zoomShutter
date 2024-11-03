import { getZoomStatus } from "./zoom/zoom";

async function main() {
  return getZoomStatus();
}

main().catch(console.error);
