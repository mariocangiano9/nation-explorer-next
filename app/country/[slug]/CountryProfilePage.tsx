'use client';

import { CountryProfile } from '../../../components/CountryProfile';
import type { CountryData } from '../../../types';
import { useRouter } from 'next/navigation';

export function CountryProfilePage({ data }: { data: CountryData }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900">
      <CountryProfile
        countryName={data.name}
        data={data}
        loading={false}
        error={null}
        onClose={() => router.push('/')}
        language="en"
      />
    </div>
  );
}
