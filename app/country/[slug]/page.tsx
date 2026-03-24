import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CountryProfilePage } from './CountryProfilePage';
import type { CountryData } from '../../../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

async function getCountryData(slug: string): Promise<CountryData | null> {
  const name = slugToName(slug);

  const { data, error } = await supabase
    .from('country_cache')
    .select('data')
    .ilike('country_name', name)
    .single();

  if (error || !data) return null;
  return data.data as CountryData;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCountryData(slug);

  if (!data) {
    return { title: 'Country Not Found | Nation Explorer' };
  }

  return {
    title: `${data.name} — Geopolitical Profile | Nation Explorer`,
    description: data.overview,
    openGraph: {
      title: `${data.name} — Geopolitical Profile | Nation Explorer`,
      description: data.overview,
      url: `https://nationexplorer.com/country/${slug}`,
      siteName: 'Nation Explorer',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name} — Geopolitical Profile | Nation Explorer`,
      description: data.overview,
    },
  };
}

export async function generateStaticParams() {
  const { data, error } = await supabase
    .from('country_cache')
    .select('country_name');

  if (error || !data) return [];

  return data.map((row: { country_name: string }) => ({
    slug: nameToSlug(row.country_name),
  }));
}

export default async function CountryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCountryData(slug);

  if (!data) notFound();

  return <CountryProfilePage data={data} />;
}
