export interface LogMessage {
  type: 'info' | 'warn' | 'error' | 'fatal' | 'debug';
  title: string;
  message: string;
  addInfo?: object;
}

export function logger(data: LogMessage) {
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const pid = process.pid;

  // NestJS 风格的颜色
  const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bright: '\x1b[1m',
  };

  const typeConfig = {
    log: { color: colors.green, label: 'LOG' },
    info: { color: colors.green, label: 'LOG' },
    warn: { color: colors.yellow, label: 'WARN' },
    error: { color: colors.red, label: 'ERROR' },
    debug: { color: colors.magenta, label: 'DEBUG' },
    verbose: { color: colors.blue, label: 'VERBOSE' },
  };

  const config = typeConfig[data.type.toLowerCase()] || typeConfig.log;

  // 构建消息内容
  let messageContent = data.message;

  // 如果有附加信息，添加到消息后面
  if (data.addInfo && Object.keys(data.addInfo).length > 0) {
    const tags = Object.entries(data.addInfo)
      .map(([key, value]) => {
        const valueStr =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
        return `${key}=${valueStr}`;
      })
      .join(' ');
    messageContent += ` ${tags}`;
  }

  // NestJS 风格的日志行
  const logLine = `${colors.green}[Nest] ${pid}${colors.reset}  - ${timestamp}     ${config.color}${config.label}${colors.reset} ${colors.yellow}[${data.title}]${colors.reset} ${messageContent}`;

  console.log(logLine);
}
