import { MetadataRoute } from 'next'
 
export default function Sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://scala.gg',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}