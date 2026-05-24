const isDev = process.env.NODE_ENV === 'development';

type LogPrefix = '[AUTH]' | '[SESSION]' | '[401]';

export function authLog(prefix: LogPrefix, message: string): void {
  if (!isDev) return;
  console.log(`${prefix} ${message}`); // noqa
}
