import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AirChill-style | Service Desk Demo',
  description: 'Demonstration of AC service request intake and staff review. Unaffiliated sample product.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
