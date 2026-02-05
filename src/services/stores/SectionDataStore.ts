import { SaavnItem } from '../../types/saavn';

class SectionDataStore {
  private static instance: SectionDataStore;
  private cache: Map<string, SaavnItem[]> = new Map();

  private constructor() {}

  public static getInstance(): SectionDataStore {
    if (!SectionDataStore.instance) {
      SectionDataStore.instance = new SectionDataStore();
    }
    return SectionDataStore.instance;
  }

  public setData(id: string, data: SaavnItem[]): void {
    this.cache.set(id, data);
  }

  public getData(id: string): SaavnItem[] | undefined {
    return this.cache.get(id);
  }

  public clearData(id: string): void {
    this.cache.delete(id);
  }
}

export const sectionDataStore = SectionDataStore.getInstance();
