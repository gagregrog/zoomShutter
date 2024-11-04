import { Monitor } from "./zoom/monitor";

async function main() {
  const monitor = new Monitor(console.log);
  monitor.run();
}

main().catch(console.error);
