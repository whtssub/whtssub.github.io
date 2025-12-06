
import { Github, Linkedin, Mail, Instagram, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialIconsProps {
  className?: string;
  iconSize?: number;
}

export const SocialIcons = ({ className, iconSize = 20 }: SocialIconsProps) => {
  const socialLinks = [
    { name: 'GitHub', url: 'https://github.com/whtssub', Icon: Github },
    { name: 'Twitter', url: 'https://x.com/whtssub', Icon: Twitter },
    { name: 'LinkedIn', url: 'https://linkedin.com/in/subhasmita-swain', Icon: Linkedin },
    { name: 'Instagram', url: 'https://www.threads.net/@whtssub', Icon: Instagram },
    { name: 'Email', url: 'mailto:subhasmitaofc@gmail.com', Icon: Mail },
  ];

  return (
    <div className={cn('flex items-center space-x-4', className)}>
      {socialLinks.map(({ name, url, Icon }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-primary"
          aria-label={name}
        >
          <Icon size={iconSize} strokeWidth={1.5} />
        </a>
      ))}
    </div>
  );
};
