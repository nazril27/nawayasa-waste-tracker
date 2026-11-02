export type SortingStatus = 'ya' | 'sebagian' | 'tidak';

export type WasteType = 'organik' | 'nonorganik' | 'residu' | 'lainnya';

export interface User {
  id: number | string;
  name: string;
  nim: string;
  email?: string | null;
}

export interface UserSummary {
  id: number | string;
  name: string;
  nim?: string | null;
  email?: string | null;
}

export interface House {
  id: number;
  rt: string;
  headOfFamilyName: string;
  numberOfFamilyMembers: number;
  isSortingWaste: SortingStatus;
  streetName?: string | null;
  houseNumber?: string | null;
  userId?: User['id'] | null;
  user?: UserSummary | null;
  createdAt?: string;
  updatedAt?: string;
}

export type HouseSummary = Pick<
  House,
  'id' | 'rt' | 'headOfFamilyName' | 'streetName' | 'houseNumber' | 'isSortingWaste'
>;

export interface WasteRecord {
  id: number;
  weight: number;
  typesOfWaste: WasteType;
  houseId: number;
  userId?: User['id'] | null;
  user?: UserSummary | null;
  house?: HouseSummary | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  nim: string;
  password: string;
  email?: string;
}

export interface HousePayload {
  userId: User['id'];
  rt: string;
  headOfFamilyName: string;
  numberOfFamilyMembers: number;
  isSortingWaste: SortingStatus;
  streetName?: string;
  houseNumber?: string;
}

export interface WastePayload {
  weight: number;
  typesOfWaste: WasteType;
  houseId: number;
  userId: User['id'];
}
