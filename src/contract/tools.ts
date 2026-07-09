export type InterfaceInfo = {
  name: string;
  addresses: string[];
};

export type Interfaces = {
  interfaces: InterfaceInfo[];
};

export type License = {
  name: string;
  url: string;
  license: string;
  licenseUrl: string;
};

export type Licenses = {
  yuhaiin: License[];
  android: License[];
};

export type LogBatch = {
  log: string[];
};
