import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './Navigation';
import DiscordStatus from './DiscordStatus';
import MusicPlayer from './MusicPlayer';
import ProjectsTab from './ProjectsTab';
import ContactTab from './ContactTab';
import TerminalDialog from './TerminalDialog';
import albumCover from '@/assets/album-cover.jpg';

const tracks = [
  {
    title: 'cONTRA><Mi',
    artist: 'Duki ft. WE$T DUBAI',
    albumArt: albumCover,
    duration: '3:00',
    audioSrc: '/audio/Duki ft WE$T DUBAI - cONTRAMi.mp3',
  },
];

// Discord User ID for Lanyard API
const DISCORD_USER_ID = '344131223230087177';

const ProfileCard = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'contact'>('home');
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl glass-card rounded-xl overflow-visible relative z-10"
      >
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onHelpClick={() => setTerminalOpen(true)}
        />

        <div className="p-4 sm:p-5 md:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header */}
                <div className="mb-4 sm:mb-5 md:mb-6">
                  <h1 className="text-xl sm:text-2xl md:text-3xl mb-0 font-medium leading-none tracking-tight font-retro">
                    beirùt
                  </h1>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-none mt-1 sm:mt-2">
                    full stack developer specializing in modern web technologies
                  </p>
                </div>

                {/* Discord Status */}
                <DiscordStatus userId={DISCORD_USER_ID} />

                {/* Music Player */}
                <MusicPlayer tracks={tracks} />
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectsTab />
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <ContactTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <TerminalDialog open={terminalOpen} onOpenChange={setTerminalOpen} />
    </>
  );
};

export default ProfileCard;
