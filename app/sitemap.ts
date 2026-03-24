import { MetadataRoute } from 'next';
import { countries } from '../store/countries';

export default function sitemap(): MetadataRoute.Sitemap {
  const countryUrls = countries.map((country) => ({
    url: `https://nationexplorer.com/country/${country.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://nationexplorer.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://nationexplorer.com/ranking',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...countryUrls,
  ];
}
