export interface LogMessage {
  type: string;
  title: string;
  message: string;
  addInfo?: object;
}

export function logger(data: LogMessage) {
  const timestamp = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const typeColors = {
    error: '\x1b[91m', // 亮红色
    warn: '\x1b[93m', // 亮黄色
    info: '\x1b[96m', // 亮青色
    success: '\x1b[92m', // 亮绿色
    debug: '\x1b[95m', // 亮紫色
  };

  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  const dim = '\x1b[2m';

  const color = typeColors[data.type.toLowerCase()] || '\x1b[97m';
  const typeIcon = getTypeIcon(data.type);

  // 顶部分隔线
  console.log(`\n${dim}┌${'─'.repeat(78)}┐${reset}`);

  // 类型和时间戳行
  const typeText = `${typeIcon} ${data.type.toUpperCase()}`;
  const timeText = `[${timestamp}]`;
  const padding = 78 - typeText.length - timeText.length;
  console.log(
    `${dim}│${reset} ${color}${bold}${typeText}${reset}${' '.repeat(padding)}${dim}${timeText} │${reset}`,
  );

  // 分隔线
  console.log(`${dim}├${'─'.repeat(78)}┤${reset}`);

  // 标题行
  console.log(
    `${dim}│${reset} ${bold}📋 标题: ${data.title}${reset}${' '.repeat(Math.max(0, 78 - 8 - data.title.length))}${dim}│${reset}`,
  );

  // 消息行
  const messageLines = wrapText(data.message, 68);
  messageLines.forEach((line, index) => {
    const prefix = index === 0 ? '💬 消息: ' : '       ';
    const padding = 78 - prefix.length - line.length;
    console.log(
      `${dim}│${reset} ${prefix}${line}${' '.repeat(Math.max(0, padding))}${dim}│${reset}`,
    );
  });

  // 附加信息
  if (data.addInfo && Object.keys(data.addInfo).length > 0) {
    console.log(`${dim}├${'─'.repeat(78)}┤${reset}`);
    console.log(
      `${dim}│${reset} ${dim}📊 附加信息:${reset}${' '.repeat(64)}${dim}│${reset}`,
    );

    // 格式化附加信息，每个字段一行
    Object.entries(data.addInfo).forEach(([key, value]) => {
      const valueStr =
        typeof value === 'string' ? value : JSON.stringify(value);
      const line = `  ${key}: ${valueStr}`;
      const trimmedLine =
        line.length > 70 ? line.substring(0, 67) + '...' : line;
      const padding = 78 - 2 - trimmedLine.length;
      console.log(
        `${dim}│${reset} ${dim}${trimmedLine}${reset}${' '.repeat(Math.max(0, padding))}${dim}│${reset}`,
      );
    });
  }

  // 底部分隔线
  console.log(`${dim}└${'─'.repeat(78)}┘${reset}\n`);
}

function getTypeIcon(type: string): string {
  const icons = {
    error: '🚨',
    warn: '⚠️ ',
    info: 'ℹ️ ',
    success: '✅',
    debug: '🔍',
  };
  return icons[type.toLowerCase()] || '📝';
}

function wrapText(text: string, maxWidth: number): string[] {
  if (text.length <= maxWidth) return [text];

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}
