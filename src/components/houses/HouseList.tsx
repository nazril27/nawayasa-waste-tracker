import { ChevronRight, Users } from 'lucide-react';
import { SortingBadge } from '@/components/ui/Badges';
import { formatAddress, formatStreet, getPersonInCharge } from '@/lib/format';
import type { House } from '@/types';

interface HouseListProps {
  houses: House[];
  onSelect: (house: House) => void;
}

export function HouseList({ houses, onSelect }: HouseListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Kepala Keluarga</th>
              <th className="px-5 py-3.5">RT</th>
              <th className="px-5 py-3.5">Alamat</th>
              <th className="px-5 py-3.5 text-center">Anggota</th>
              <th className="px-5 py-3.5">Penanggung Jawab</th>
              <th className="px-5 py-3.5">Memilah Sampah</th>
              <th className="px-5 py-3.5" aria-hidden="true" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {houses.map((house) => (
              <tr
                key={house.id}
                onClick={() => onSelect(house)}
                className="group cursor-pointer transition-colors duration-150 hover:bg-emerald-50/50"
              >
                <td className="px-5 py-4 font-semibold text-slate-900">{house.headOfFamilyName}</td>
                <td className="px-5 py-4 text-slate-600">{house.rt}</td>
                <td className="max-w-xs truncate px-5 py-4 text-slate-600">
                  {formatStreet(house)}
                </td>
                <td className="px-5 py-4 text-center text-slate-600">{house.numberOfFamilyMembers}</td>
                <td className="px-5 py-4 text-slate-600">{getPersonInCharge(house)}</td>
                <td className="px-5 py-4">
                  <SortingBadge status={house.isSortingWaste} />
                </td>
                <td className="px-5 py-4 text-right">
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-emerald-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {houses.map((house) => (
          <li key={house.id}>
            <button
              type="button"
              onClick={() => onSelect(house)}
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 active:scale-[0.99] hover:border-emerald-200 hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-slate-900">{house.headOfFamilyName}</p>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{formatAddress(house)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <SortingBadge status={house.isSortingWaste} />
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    {house.numberOfFamilyMembers} orang
                  </span>
                </div>
                <p className="mt-2 truncate text-xs text-slate-500">PJ: {getPersonInCharge(house)}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
