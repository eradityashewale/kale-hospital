import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

const LINKS = [
  ['about', 'About'],
  ['services', 'Services'],
  ['doctors', 'Doctors'],
  ['gallery', 'Gallery'],
  ['contact', 'Contact'],
];

export default function PublicNavbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className={`public-navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="brand-block">
        <div className="brand-badge">✚</div>
        <div>
          <p className="eyebrow">Multi-specialty surgical care</p>
          <h2 style={{ fontSize: '1.15rem' }}>Kale Surgical Hospital</h2>
        </div>
      </div>
      <nav className="public-nav-links">
        {LINKS.map(([id, label]) => (
          <a key={id} onClick={() => scrollTo(id)}>{label}</a>
        ))}
        <button className="icon-btn" type="button" onClick={toggleTheme}>{theme === 'dark' ? '☀' : '☾'}</button>
        <button className="primary-btn" type="button" onClick={() => navigate('/login')}>Staff Login</button>
      </nav>
      <button
        className={`public-nav-toggle${open ? ' open' : ''}`}
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
      </button>
      <nav className={`public-nav-mobile${open ? ' open' : ''}`}>
        {LINKS.map(([id, label]) => (
          <a key={id} onClick={() => scrollTo(id)}>{label}</a>
        ))}
        <a onClick={() => { setOpen(false); navigate('/login'); }}>Staff Login</a>
      </nav>
    </header>
  );
}
