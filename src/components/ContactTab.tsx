import { Mail, Github, MessageCircle } from 'lucide-react';

interface ContactLink {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}

const contacts: ContactLink[] = [
  {
    icon: <MessageCircle size={14} />,
    label: 'Discord',
    value: 'lockfile',
    href: 'https://discord.com/users/lockfile',
  },
  {
    icon: <Github size={14} />,
    label: 'GitHub',
    value: '@lockfilement',
    href: 'https://github.com/lockfilement',
  },
  {
    icon: <Mail size={14} />,
    label: 'Email',
    value: 'business.beirut@hotmail.com',
    href: 'mailto:business.beirut@hotmail.com',
  },
];

const ContactTab = () => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground mb-3">
        feel free to reach out through any of these platforms
      </p>
      {contacts.map((contact, index) => (
        <a
          key={index}
          href={contact.href}
          target="_blank"
          rel="noopener noreferrer"
          className="content-section flex items-center gap-3 group cursor-pointer block"
        >
          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
            {contact.icon}
          </span>
          <div className="flex-1">
            <span className="text-xs text-muted-foreground">{contact.label}</span>
            <p className="text-xs text-foreground/80 group-hover:text-foreground transition-colors">
              {contact.value}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
};

export default ContactTab;
