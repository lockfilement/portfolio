'use client';

import dynamic from 'next/dynamic';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import Background from '@/components/Background';
import Header from '@/components/Header';
import Time from '@/components/Time';
import { SocketProvider } from '@/hooks/SocketContext';

// Carga diferida de componentes del cliente
const Cat = dynamic(() => import('@/components/Cat'), { ssr: false });
const Technologies = dynamic(() => import('@/components/Technologies'), { ssr: false });
const CardComponent = dynamic(() => import('@/components/Card'), { ssr: false });
const Projects = dynamic(() => import('@/components/Projects'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });
const MusicPlayer = dynamic(() => import('@/components/MusicPlayer'), { ssr: false });
const About = dynamic(() => import('@/components/About'), { ssr: false });
const Statistics = dynamic(() => import('@/components/Statistics'), { ssr: false });
const Comissions = dynamic(() => import('@/components/Comissions'), { ssr: false });
const TranslateGlobe = dynamic(() => import('@/components/Globe'), { ssr: false });

export default function Home() {
  return (
    <>
      {/* Fondo y header */}
      <Background />
      <SocketProvider>
        <Header />
      </SocketProvider>

      {/* Secciones principales */}
      <Time />
      <CardComponent />
      <MusicPlayer />
      <Technologies />
      <About />
      <Statistics />
      <Comissions />
      <Projects />
      <Footer />

      {/* Componentes flotantes o interactivos */}
      <Cat />
      <TranslateGlobe />

      {/* Analítica */}
      <SpeedInsights />
      <Analytics />
    </>
  );
}