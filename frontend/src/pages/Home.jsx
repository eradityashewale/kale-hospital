import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../public.css';
import PublicNavbar from '../components/PublicNavbar.jsx';
import PhotoSlot from '../components/PhotoSlot.jsx';
import Reveal from '../components/Reveal.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { useCountUp } from '../hooks/useCountUp.js';

const SERVICES = [
  { icon: '🔪', title: 'General & Laparoscopic Surgery', desc: 'Minimally invasive and open surgical procedures for a wide range of conditions.' },
  { icon: '🦴', title: 'Orthopedic & Joint Care', desc: 'Fracture care, joint replacement, and sports injury management.' },
  { icon: '👶', title: 'Gynecology & Obstetrics', desc: 'Comprehensive women’s health, prenatal care, and safe delivery services.' },
  { icon: '👂', title: 'ENT Surgery', desc: 'Ear, nose, and throat diagnostics and surgical treatment.' },
  { icon: '🩺', title: 'Urology & Kidney Care', desc: 'Diagnosis and surgical management of urological conditions.' },
  { icon: '🚑', title: 'Emergency & Trauma Care', desc: '24x7 emergency response with a dedicated trauma team.' },
  { icon: '❤️', title: 'ICU & Critical Care', desc: 'Round-the-clock monitoring for critical and post-operative patients.' },
  { icon: '🧪', title: 'Diagnostics & Pathology Lab', desc: 'In-house lab and imaging for fast, accurate diagnosis.' },
];

const DOCTORS = [
  { name: 'Dr. A. Kale', role: 'Chief Surgeon · General & Laparoscopic Surgery', photo: 'doctor-1.jpg' },
  { name: 'Dr. S. Rao', role: 'Orthopedic Surgeon', photo: 'doctor-2.jpg' },
  { name: 'Dr. P. Nair', role: 'Gynecologist & Obstetrician', photo: 'doctor-3.jpg' },
  { name: 'Dr. M. Iyer', role: 'Anesthesiology & Critical Care', photo: 'doctor-4.jpg' },
];

const STATS = [
  { target: 25, suffix: '+', label: 'Years of service' },
  { target: 50, suffix: '+', label: 'Beds' },
  { target: 15, suffix: '+', label: 'Specialist doctors' },
  { target: 10000, suffix: '+', label: 'Surgeries performed' },
];

const TRUST_ITEMS = [
  '24x7 Emergency Care', 'Modern Operation Theatres', 'Experienced Surgical Team',
  'Dedicated ICU & Critical Care', 'Family Waiting Lounge', 'Easy Appointment Booking',
];

const GALLERY_COUNT = 29;
const GALLERY = Array.from({ length: GALLERY_COUNT }, (_, i) => `gallery/gallery-${String(i + 1).padStart(2, '0')}.jpg`);

const MAP_EMBED_SRC = 'https://www.google.com/maps?q=20.5531054,74.5210681&z=16&output=embed';
const MAP_LINK = 'https://www.google.com/maps/place/Kale+Surgical+Hospital/@20.5531104,74.5184932,17z/data=!3m1!4b1!4m6!3m5!1s0x3bde999dcb328847:0xa140e2b95531b5fb!8m2!3d20.5531054!4d74.5210681';

function StatCounter({ target, suffix, label, start }) {
  const value = useCountUp(target, { start });
  return (
    <div className="stat">
      <strong>{value.toLocaleString()}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [statsRef, statsVisible] = useReveal({ threshold: 0.4 });
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback((e) => { e?.stopPropagation(); setLightboxIndex((i) => (i - 1 + GALLERY.length) % GALLERY.length); }, []);
  const showNext = useCallback((e) => { e?.stopPropagation(); setLightboxIndex((i) => (i + 1) % GALLERY.length); }, []);

  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  return (
    <div className="public-page">
      <PublicNavbar />

      <section className="public-hero">
        {reduceMotion ? (
          <img className="hero-video-layer" src="/images/hero-ambient-poster.jpg" alt="" aria-hidden="true" />
        ) : (
          <video
            className="hero-video-layer"
            src="/videos/hero-ambient.mp4"
            poster="/images/hero-ambient-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        )}
        <div className="hero-video-scrim" aria-hidden="true" />
        <div className="hero-copy">
          <span className="pulse-badge"><span className="pulse-dot" />24x7 Emergency Care Available</span>
          <p className="eyebrow">Kale Surgical Hospital</p>
          <h1>Compassionate surgical care, <span className="text-gradient">trusted across generations</span>.</h1>
          <p className="lead">
            A multi-specialty surgical hospital offering advanced surgical care, 24x7 emergency
            services, and a dedicated team of specialists — all under one roof.
          </p>
          <div className="hero-cta">
            <button className="primary-btn" type="button" onClick={() => scrollTo('contact')}>Book an appointment</button>
            <button className="ghost-btn" type="button" onClick={() => scrollTo('services')}>Explore services</button>
          </div>
          <div className="hero-stats" ref={statsRef}>
            {STATS.map((s) => (
              <StatCounter key={s.label} {...s} start={statsVisible} />
            ))}
          </div>
        </div>
        <div className="hero-photo">
          <PhotoSlot name="hero-building.jpg" icon="🏥" label="Hospital building photo" ratio="5 / 4" />
        </div>
      </section>

      <div className="trust-marquee">
        <div className="trust-marquee-track">
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <span className="trust-marquee-item" key={`${item}-${i}`}><span className="dot" />{item}</span>
          ))}
        </div>
      </div>

      <section className="public-section" id="about">
        <Reveal className="public-grid cols-2" style={{ alignItems: 'center' }}>
          <PhotoSlot name="about-facility.jpg" icon="🏨" label="Facility photo" />
          <div>
            <p className="eyebrow">About us</p>
            <h2>Care built on trust, experience, and modern facilities.</h2>
            <p style={{ color: 'var(--muted)', marginTop: 12 }}>
              Kale Surgical Hospital has been serving the local community with reliable surgical
              and emergency care. Our team combines experienced surgeons, modern operation
              theatres, and round-the-clock nursing care to give every patient the attention
              they deserve.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="public-section alt" id="services">
        <Reveal className="public-section-head">
          <p className="eyebrow">What we treat</p>
          <h2>Our specialties</h2>
          <p>A full range of surgical and medical services under one roof.</p>
        </Reveal>
        <Reveal className="public-grid cols-4" stagger>
          {SERVICES.map((s) => (
            <article className="service-card" key={s.title}>
              <span className="service-icon" aria-hidden="true">{s.icon}</span>
              <strong>{s.title}</strong>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{s.desc}</p>
            </article>
          ))}
        </Reveal>
      </section>

      <section className="public-section" id="doctors">
        <Reveal className="public-section-head">
          <p className="eyebrow">Our team</p>
          <h2>Meet our specialists</h2>
          <p>Experienced doctors dedicated to your care.</p>
        </Reveal>
        <Reveal className="public-grid cols-4" stagger>
          {DOCTORS.map((d) => (
            <article className="doctor-card" key={d.name}>
              <PhotoSlot name={d.photo} icon="🧑‍⚕️" label="Doctor photo" ratio="1 / 1" />
              <div className="doctor-body">
                <strong>{d.name}</strong>
                <span>{d.role}</span>
              </div>
            </article>
          ))}
        </Reveal>
      </section>

      <section className="public-section" id="gallery">
        <Reveal className="public-section-head">
          <p className="eyebrow">Take a look inside</p>
          <h2>Our facility</h2>
          <p>Wards, operation theatres, and the hospital building.</p>
        </Reveal>
        <Reveal className="gallery-grid" stagger>
          {GALLERY.map((src, i) => (
            <button type="button" className="gallery-item" key={src} onClick={() => setLightboxIndex(i)}>
              <img src={`/images/${src}`} alt="Kale Surgical Hospital facility" loading="lazy" />
            </button>
          ))}
        </Reveal>
      </section>

      <section className="public-section alt" id="contact">
        <Reveal className="public-section-head">
          <p className="eyebrow">Visit us</p>
          <h2>Get in touch</h2>
          <p>Reach out for appointments, emergencies, or general enquiries.</p>
        </Reveal>
        <Reveal className="public-contact">
          <div className="contact-list">
            <div className="contact-row">
              <span className="contact-icon">📍</span>
              <div><strong>Address</strong><span>Kale Surgical Hospital, Chalisgaon Road, Maharashtra 424101, India</span></div>
            </div>
            <div className="contact-row">
              <span className="contact-icon">📞</span>
              <div><strong>Phone</strong><span>+91 98765 43210 (24x7 emergency)</span></div>
            </div>
            <div className="contact-row">
              <span className="contact-icon">✉️</span>
              <div><strong>Email</strong><span>info@kalesurgicalhospital.example</span></div>
            </div>
            <div className="contact-row">
              <span className="contact-icon">🕒</span>
              <div><strong>OPD Timings</strong><span>Mon–Sat, 9:00 AM – 8:00 PM · Emergency open 24x7</span></div>
            </div>
            <div className="hero-cta">
              <a className="ghost-btn" href={MAP_LINK} target="_blank" rel="noreferrer">View on Google Maps</a>
              <button className="primary-btn" type="button" onClick={() => navigate('/login')}>Staff Login</button>
            </div>
          </div>
          <div className="map-frame">
            <iframe title="Kale Surgical Hospital location" src={MAP_EMBED_SRC} allowFullScreen />
          </div>
        </Reveal>
      </section>

      <footer className="public-footer">
        <span>© {new Date().getFullYear()} Kale Surgical Hospital. All rights reserved.</span>
        <div className="footer-links">
          <a onClick={() => scrollTo('about')}>About</a>
          <a onClick={() => scrollTo('services')}>Services</a>
          <a onClick={() => scrollTo('contact')}>Contact</a>
          <a onClick={() => navigate('/login')}>Staff Login</a>
        </div>
      </footer>

      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" type="button" onClick={closeLightbox} aria-label="Close">✕</button>
            <button className="lightbox-nav prev" type="button" onClick={showPrev} aria-label="Previous photo">‹</button>
            <img src={`/images/${GALLERY[lightboxIndex]}`} alt="Kale Surgical Hospital facility" />
            <button className="lightbox-nav next" type="button" onClick={showNext} aria-label="Next photo">›</button>
            <span className="lightbox-counter">{lightboxIndex + 1} / {GALLERY.length}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`back-to-top${showBackToTop ? ' visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>
    </div>
  );
}
