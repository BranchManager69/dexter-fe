import { SITE, VERSION_TAG } from '../lib/site';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__meta">
          <strong>Dexter</strong>
          <span>Version {VERSION_TAG}</span>
          <span>Realtime agents for voice, chat, and MCP integrations.</span>
          <span>© {year} Dexter Labs. All rights reserved.</span>
        </div>
        <div className="site-footer__links">
          {SITE.footerLinks.map((item) => {
            const isExternal = item.href.startsWith('http');
            return (
              <a
                key={item.href}
                href={item.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
