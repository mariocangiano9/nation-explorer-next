import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nationexplorer.com';

  const { data, error } = await supabase
    .from('country_cache')
    .select('country_name, updated_at');

  const countryEntries: MetadataRoute.Sitemap = (data && !error)
    ? data.map((row: { country_name: string; updated_at: string }) => ({
        url: `${baseUrl}/country/${nameToSlug(row.country_name)}`,
        lastModified: new Date(row.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    : [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...countryEntries,
  ];
}
