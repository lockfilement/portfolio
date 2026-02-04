import { useEffect, useState } from 'react';

interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    global_name: string;
  };
  discord_status: 'online' | 'offline' | 'idle' | 'dnd';
}

interface DiscordStatusProps {
  userId: string;
}

const DiscordStatus = ({ userId }: DiscordStatusProps) => {
  const [data, setData] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch Discord status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    idle: 'Idle',
    dnd: 'Do Not Disturb',
  };

  if (loading) {
    return (
      <div className="info-panel">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary animate-pulse" />
          <div className="flex flex-col flex-1 gap-1">
            <div className="h-3 w-16 bg-secondary animate-pulse rounded" />
            <div className="h-3 w-12 bg-secondary animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="info-panel">
        <span className="text-xs text-muted-foreground">Unable to load Discord status</span>
      </div>
    );
  }

  const avatarUrl = data.discord_user.avatar
    ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return (
    <div className="info-panel">
      <div className="flex items-center gap-2">
        <div className="relative">
          <img
            src={avatarUrl}
            alt="Discord Avatar"
            className="w-7 h-7 rounded-full"
          />
          <div
            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-background status-${data.discord_status}`}
          />
        </div>
        <div className="flex flex-col flex-1">
          <a
            href={`https://discord.com/users/${data.discord_user.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-foreground/90 link-underline"
          >
            {data.discord_user.global_name || data.discord_user.username}
          </a>
          <span className="text-xs text-muted-foreground">{statusLabels[data.discord_status]}</span>
        </div>
      </div>
    </div>
  );
};

export default DiscordStatus;
