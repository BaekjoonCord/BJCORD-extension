const log = (file: string, ...args: any[]) => {
  console.log(`[BJCORD][${file}]`, ...args);
};

const error = (file: string, ...args: any[]) => {
  console.error(`[BJCORD][${file}]`, ...args);
};

export const getLogger = (file: string) => ({
  log: (...args: any[]) => log(file, ...args),
  error: (...args: any[]) => error(file, ...args),
});
