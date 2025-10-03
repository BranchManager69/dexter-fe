import { SITE } from '../../lib/site';
import styles from './FooterSimple.module.css';

export function FooterSimple() {
  return (
    <div className={styles.wrapper}>
      <span>Dexter Labs · © {new Date().getFullYear()}</span>
      <nav className={styles.links} aria-label="Footer links">
        {SITE.footerLinks.map((item) => (
          <a key={item.href} href={item.href}>{item.label}</a>
        ))}
      </nav>
    </div>
  );
}
