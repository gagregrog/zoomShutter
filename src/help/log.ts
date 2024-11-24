import colors from "yoctocolors-cjs";

type LoggerFn = (...args: unknown[]) => void;
type FormatKey = keyof typeof colors;
type Format = (typeof colors)[FormatKey];

export class Logger {
  log: (prefix: string, prefixFormatter: FormatKey) => LoggerFn;
  info: LoggerFn;
  success: LoggerFn;
  warn: LoggerFn;
  error: LoggerFn;
  private context: string;
  private contextFormatter: Format;

  constructor(context: string, contextFormatter: FormatKey) {
    this.context = context;
    this.contextFormatter = colors[contextFormatter];

    this.log = (prefix: string, prefixFormat: keyof typeof colors) =>
      this.buildLogger(console.log, prefix, colors[prefixFormat]);
    this.info = this.buildLogger(console.log, "info", colors.green);
    this.success = this.buildLogger(console.log, "success", colors.cyanBright);
    this.warn = this.buildLogger(console.log, "warning", colors.yellow);
    this.error = this.buildLogger(console.error, "error", colors.red);
  }

  private buildLogger(
    logger: typeof console.log | typeof console.error,
    prefix: string,
    prefixFormatter: Format,
  ) {
    return (...args: unknown[]) => {
      logger(
        `[${this.contextFormatter(this.context.toUpperCase())}:${prefixFormatter(prefix.toUpperCase())}]`,
        ...args,
      );
    };
  }
}
