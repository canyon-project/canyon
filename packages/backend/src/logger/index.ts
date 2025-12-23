export interface LogMessage {
  type: string;
  title: string;
  message: string;
  addInfo?: object;
}

export function logger(data: LogMessage) {
  const timestamp = new Date().toISOString();
  const typeColors = {
    error: '\x1b[31m', // 红色
    warn: '\x1b[33m', // 黄色
    info: '\x1b[36m', // 青色
    success: '\x1b[32m', // 绿色
    debug: '\x1b[35m', // 紫色
  };

  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  const dim = '\x1b[2m';

  const color = typeColors[data.type.toLowerCase()] || '\x1b[37m'; // 默认白色
  const typeIcon = getTypeIcon(data.type);

  console.log('\n' + '─'.repeat(60));
  console.log(
    `${color}${bold}${typeIcon} ${data.type.toUpperCase()}${reset} ${dim}[${timestamp}]${reset}`,
  );
  console.log(`${bold}📋 ${data.title}${reset}`);
  console.log(`💬 ${data.message}`);

  if (data.addInfo && Object.keys(data.addInfo).length > 0) {
    console.log(`${dim}📊 Additional Info:${reset}`);
    console.log(JSON.stringify(data.addInfo, null, 2));
  }

  console.log('─'.repeat(60) + '\n');
}

function getTypeIcon(type: string): string {
  const icons = {
    error: '❌',
    warn: '⚠️',
    info: 'ℹ️',
    success: '✅',
    debug: '🐛',
  };
  return icons[type.toLowerCase()] || '📝';
}
