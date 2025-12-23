export interface LogMessage {
  type: string;
  title: string;
  message: string;
  addInfo?: object;
}
export function logger(data: LogMessage) {
  console.log(data);
}
