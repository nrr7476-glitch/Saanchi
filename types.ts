
export interface DairyInfo {
  name: string;
  owner: string;
  contact: string;
  address: string;
  isOpen: boolean;
  announcement: string;
}

export interface Product {
  id: string;
  nameHi: string;
  nameEn: string;
  price: string;
  unit: string;
  available: boolean;
}

export enum ViewMode {
  CUSTOMER = 'customer',
  ADMIN = 'admin'
}
