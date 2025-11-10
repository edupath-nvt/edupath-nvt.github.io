export function t(key: string, ...args: any[]): string {
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
    const values = args[0];
    return key.replace(/{(.*?)}/g, (_, name) =>
      name in values ? String(values[name]) : `{${name}}`
    );
  }

  return key.replace(/{(\d*)}/g, (_, index) => {
    if (index === '') return String(args.shift() ?? '');
    const i = Number(index);
    return i < args.length ? String(args[i]) : `{${index}}`;
  });
}