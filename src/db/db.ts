const database = new Map();

export function set(key: string, value: string) {
  database.set(key, value);
}

export function get(key: string): string {
  return database.get(key);
}
