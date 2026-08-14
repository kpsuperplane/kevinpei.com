import type { NavLink } from '../types';

export const primaryLinks: NavLink[] = [
  { href: '/kevin-pei-resume-19-06-2026.pdf', label: 'Resume', icon: 'read-cv-logo' },
  { href: 'mailto:hello@kevinpei.com', label: 'Email', icon: 'paper-plane-tilt' },
  { href: 'https://github.com/kpsuperplane', label: 'GitHub', icon: 'github-logo' },
  { href: 'https://linkedin.com/in/kpsuperplane', label: 'LinkedIn', icon: 'linkedin-logo' },
];

export const socialLinks: NavLink[] = [
  { href: 'https://www.threads.net/@kpsuperplane', label: 'Threads', icon: 'threads-logo' },
  { href: 'https://x.com/kpsuperplane', label: 'Twitter', icon: 'x-logo' },
  { href: 'https://instagram.com/kpsuperplane', label: 'Instagram', icon: 'instagram-logo' },
];

export const mobileSocialLinks: NavLink[] = [
  ...primaryLinks.filter((link) => link.label !== 'Resume'),
  ...socialLinks,
];
