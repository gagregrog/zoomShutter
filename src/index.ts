import { getZoomStatus } from "./zoom/status";

async function main() {
  const status = await getZoomStatus();
  console.log(status);
}

main().catch(console.error);
