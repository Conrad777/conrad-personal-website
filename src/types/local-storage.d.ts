interface StorageSchema {
  theme: "light" | "dark";
}

declare global {
  interface Storage {
    getItem<K extends keyof StorageSchema>(key: K): StorageSchema[K] | null;
    setItem<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): void;
    removeItem(key: keyof StorageSchema): void;
  }
}

export {};
