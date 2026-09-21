import type { Metadata } from 'next';
import { MyHouseView } from '@/components/collection/MyHouseView';
import { getRepository } from '@/data';

export const metadata: Metadata = {
  title: 'My House',
  description: 'The works you have saved while visiting House of Nucci.',
  robots: { index: false, follow: true },
};

/**
 * MY HOUSE (§34). The server sends the collection; what has been saved is known only to
 * the visitor's browser and is never transmitted anywhere (§71).
 */
export default function MyHousePage() {
  const repo = getRepository();
  return <MyHouseView artworks={repo.listArtworks()} artists={repo.listArtists()} />;
}
