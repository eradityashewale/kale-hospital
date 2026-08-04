import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../public.css';
import PublicNavbar from '../components/PublicNavbar.jsx';
import PhotoSlot from '../components/PhotoSlot.jsx';
import Reveal from '../components/Reveal.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { useCountUp } from '../hooks/useCountUp.js';

const SERVICES = [
  {
    icon: '🔪',
    title: 'Suture & Sutureless Surgery',
    desc: 'All types of surgical procedures, performed with traditional stitches or advanced stitchless, minimally invasive techniques.',
    detail: 'We perform a wide range of general surgical procedures using both conventional (open, stitched) techniques and modern stitchless methods. Sutureless approaches use surgical glue, staples, or laser-assisted closure to reduce scarring, minimize pain, and speed up healing — ideal for smaller wounds, minor lumps, and skin-level procedures.',
  },
  {
    icon: '🔬',
    title: 'Laparoscopic Hernia & Abdominal Surgery',
    desc: 'Examination and treatment of hernia and internal abdominal organs using laparoscope (keyhole surgery) for faster recovery and minimal scarring.',
    detail: 'Using a laparoscope — a thin camera inserted through a few small incisions — our surgeons examine and treat hernias and internal abdominal organs without large open cuts. This keyhole approach means smaller scars, less post-operative pain, shorter hospital stays, and a quicker return to daily activities compared to traditional open surgery.',
  },
  {
    icon: '💎',
    title: 'Gallstone, Bladder Stone & Lump Treatment',
    desc: 'Diagnosis and treatment of gallbladder stones, urinary bladder stones, ulcers, piles (hemorrhoids), breast lumps, and other internal or external body lumps.',
    detail: 'We diagnose and surgically treat gallbladder stones (cholelithiasis), urinary bladder stones, stomach ulcers, piles (hemorrhoids), and lumps in the breast or elsewhere in the body. Depending on severity, treatment ranges from medication and minimally invasive stone removal to surgical excision of lumps and affected tissue.',
  },
  {
    icon: '🚨',
    title: 'Hernia, Appendix & Emergency Abdominal Surgery',
    desc: 'Emergency surgical care for hernia, appendicitis, hydrocele, intestinal blockage, and intestinal perforation.',
    detail: 'Round-the-clock emergency surgical care for acute conditions including hernia, appendicitis, hydrocele, intestinal blockage (obstruction), and intestinal perforation. These conditions often require urgent surgery to prevent complications, and our team is equipped to operate immediately when needed.',
  },
  {
    icon: '🎗️',
    title: 'Cancer Diagnosis & Treatment',
    desc: 'Screening, diagnosis, and surgical treatment for cancer.',
    detail: 'Our team provides screening and diagnostic evaluation for suspected cancers, along with surgical treatment options where indicated. Early detection and prompt surgical intervention significantly improve outcomes, and we guide patients through the journey from diagnosis to treatment.',
  },
  {
    icon: '🔥',
    title: 'Burn Patient Care',
    desc: 'Specialized treatment and wound management for burn injury patients.',
    detail: 'Specialized wound care and treatment for patients with burn injuries — including cleaning, dressing, and infection prevention — along with surgical management of severe burns where skin grafting or reconstructive care is required.',
  },
  {
    icon: '🦶',
    title: 'Diabetic Foot Care',
    desc: 'Dedicated care, wound management, and treatment for diabetic foot complications.',
    detail: 'Diabetic patients are prone to foot ulcers, infections, and poor wound healing due to reduced circulation and nerve sensitivity. We offer dedicated wound management, infection control, and, when necessary, surgical intervention to prevent complications and preserve mobility.',
  },
  {
    icon: '🚑',
    title: 'Trauma & Emergency Services',
    desc: '24x7 trauma care and emergency medical services for critical situations.',
    detail: '24x7 emergency response for accident injuries and critical trauma cases, with a dedicated team ready to stabilize and treat patients around the clock — from initial assessment through emergency surgery if required.',
  },
];

const DOCTORS = [
  { name: 'Dr. Bhushan Kale', role: 'Chief Surgeon · General & Laparoscopic Surgery', photo: 'doctor-1.jpg' },
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
  const [activeService, setActiveService] = useState(null);
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

  const closeServiceDetail = useCallback(() => setActiveService(null), []);

  useEffect(() => {
    if (activeService === null) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeServiceDetail(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeService, closeServiceDetail]);

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
            <button
              type="button"
              className="service-card service-card-btn"
              key={s.title}
              onClick={() => setActiveService(s)}
            >
              <span className="service-icon" aria-hidden="true">{s.icon}</span>
              <strong>{s.title}</strong>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{s.desc}</p>
              <span className="service-card-more">Learn more →</span>
            </button>
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

      {activeService && (
        <div className="service-modal-overlay" onClick={closeServiceDetail}>
          <div className="service-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
            <button className="service-modal-close" type="button" onClick={closeServiceDetail} aria-label="Close">✕</button>
            <span className="service-modal-icon" aria-hidden="true">{activeService.icon}</span>
            <h3 id="service-modal-title">{activeService.title}</h3>
            <p>{activeService.detail}</p>
            <div className="service-modal-cta">
              <button className="primary-btn" type="button" onClick={() => { closeServiceDetail(); scrollTo('contact'); }}>Book an appointment</button>
            </div>
          </div>
        </div>
      )}

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
