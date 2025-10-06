export type AccessLevel = 'guest' | 'pro' | 'holders' | 'dev';
export type AccessFilter = 'all' | AccessLevel;

export type CatalogTool = {
  id: string;
  rawName: string;
  displayName: string;
  description: string;
  categoryKey: string;
  categoryLabel: string;
  access: AccessLevel;
  input: any;
  output: any;
  tags: string[];
  icon: string;
};

export type CatalogGroup = {
  key: string;
  label: string;
  tools: CatalogTool[];
};
