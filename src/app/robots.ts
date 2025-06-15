import { MetadataRoute } from 'next'
 
export default function Robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://scala.gg/sitemap.xml',
  }
}