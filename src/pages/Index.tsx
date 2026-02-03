import Starfield from '@/components/Starfield';
import ProfileCard from '@/components/ProfileCard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Starfield />
      <ProfileCard />
    </div>
  );
};

export default Index;
