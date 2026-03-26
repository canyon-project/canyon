type LogLevel = "info" | "warn" | "error";

function pad(num: number, width = 2): string {
  return String(num).padStart(width, "0");
}

function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = pad(date.getMilliseconds(), 3);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds},${milliseconds}`;
}

function emit(level: LogLevel, ...messages: unknown[]): void {
  const prefix = `${level} - ${formatTimestamp(new Date())} -- >`;
  const line = messages
    .map((message) => {
      if (typeof message === "string") {
        return message;
      }

      if (message instanceof Error) {
        return message.stack || message.message;
      }

      try {
        return JSON.stringify(message);
      } catch {
        return String(message);
      }
    })
    .join(" ");
  console[level](`${prefix} ${line}`);
}

export const logger = {
  info: (...messages: unknown[]) => emit("info", ...messages),
  warn: (...messages: unknown[]) => emit("warn", ...messages),
  error: (...messages: unknown[]) => emit("error", ...messages),
};
