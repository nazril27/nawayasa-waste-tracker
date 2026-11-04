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

export interface PageMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Paginated<T> extends PageMeta {
  data: T[];
}

export interface SortingSummary {
  isSortingWaste: SortingStatus;
  houses: number;
  percent: number;
}

export interface WasteTypeSummary {
  typesOfWaste: WasteType;
  records: number;
  totalWasteWeightKg: number;
}

export interface RtSummary {
  rt: string;
  houses: number;
  familyMembers: number;
  wasteRecords: number;
  totalWasteWeightKg: number;
}

export interface DashboardSummary {
  generatedAt: string;
  filter: { rt: string | null };
  overview: {
    totalStudents: number;
    totalHouses: number;
    totalFamilyMembers: number;
    totalWasteRecords: number;
    totalWasteWeightKg: number;
    unassignedHouses: number;
    unassignedWasteRecords: number;
  };
  housesBySortingWaste: SortingSummary[];
  wastesByType: WasteTypeSummary[];
  byRt: RtSummary[];
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

export interface HouseUpdatePayload {
  rt: string;
  headOfFamilyName: string;
  numberOfFamilyMembers: number;
  isSortingWaste: SortingStatus;
  streetName: string | null;
  houseNumber: string | null;
}

export interface WastePayload {
  weight: number;
  typesOfWaste: WasteType;
  houseId: number;
  userId: User['id'];
}
