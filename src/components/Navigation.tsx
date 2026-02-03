interface NavigationProps {
  activeTab: 'home' | 'projects' | 'contact';
  onTabChange: (tab: 'home' | 'projects' | 'contact') => void;
  onHelpClick: () => void;
}

const Navigation = ({ activeTab, onTabChange, onHelpClick }: NavigationProps) => {
  const tabs: Array<'home' | 'projects' | 'contact'> = ['home', 'projects', 'contact'];

  return (
    <div className="flex justify-between p-2 border-b" style={{ borderColor: 'hsl(240 4% 20% / 0.3)' }}>
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`nav-tab ${activeTab === tab ? 'nav-tab-active' : 'nav-tab-inactive'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <button
        onClick={onHelpClick}
        className="px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        [?]
      </button>
    </div>
  );
};

export default Navigation;
