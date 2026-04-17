import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, ShieldCheck,
  BarChart3, Globe,
  FileText, Users, CreditCard, Sparkles, Sun, Moon
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const LandingPage: React.FC = () => {
  const { t, lang, setLang, darkMode, toggleDark } = useSettings();

  return (
    <div className="landing-root" style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8%',
        zIndex: 100,
        background: 'rgba(var(--bg-rgb), 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            background: 'var(--accent)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
          }}>
            <Zap size={20} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.5 }}>
            InvoicePro
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 12 }}>
            <button className="icon-btn" onClick={toggleDark} title={t.settings.darkMode}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              className="icon-btn" 
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              style={{ fontSize: 13, fontWeight: 700, padding: '0 8px', gap: 6 }}
            >
              <Globe size={16} />
              {lang.toUpperCase()}
            </button>
          </div>

          <Link to="/login" style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-3)',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}>
            {t.landing.navLogin}
          </Link>
          <Link to="/login" className="btn btn-primary" style={{ height: 42, padding: '0 20px', borderRadius: 10 }}>
            {t.landing.navTry}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '180px 8% 100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Background decorations */}
        <div style={{
          position: 'absolute',
          top: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80vw',
          height: '60vh',
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
          zIndex: 0
        }} />

        <div className="animate-fade-up" style={{ position: 'relative', zIndex: 1, maxWidth: 840 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: 'var(--accent-subtle)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: 100,
            marginBottom: 24
          }}>
            <Sparkles size={14} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.landing.badge}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(42px, 6vw, 78px)',
            fontWeight: 900,
            color: 'var(--text)',
            lineHeight: 0.95,
            letterSpacing: -3,
            marginBottom: 32
          }}>
            {t.landing.heroTitle}<span style={{ color: 'var(--accent)' }}>{t.landing.heroTitleAccent}</span>{t.landing.heroTitleEnd}
          </h1>
          <p style={{
            fontSize: 'clamp(17px, 1.5vw, 20px)',
            color: 'var(--text-2)',
            lineHeight: 1.6,
            maxWidth: 620,
            margin: '0 auto 48px',
            fontWeight: 500
          }}>
            {t.landing.heroDesc}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0 32px', height: 56, fontSize: 16, borderRadius: 12 }}>
              {t.landing.getStarted}
              <ArrowRight size={20} />
            </Link>
            <button className="btn btn-secondary" style={{ padding: '0 32px', height: 56, fontSize: 16, borderRadius: 12 }}>
              {t.landing.viewDemo}
            </button>
          </div>

          {/* User count badge */}
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ display: 'flex', marginLeft: 10 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '2px solid var(--surface)',
                  background: `var(--accent)`,
                  marginLeft: -10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: '#fff',
                  fontWeight: 800
                }}>
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>
              {t.landing.trustText}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '60px 8%', background: 'linear-gradient(to bottom, transparent, var(--bg-2), transparent)' }}>
        <div style={{
          maxWidth: 1000,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          textAlign: 'center'
        }}>
          {[
            { label: t.landing.statInvoices, value: '1.2M+' },
            { label: t.landing.statUsers, value: '150k+' },
            { label: t.landing.statRevenue, value: '850M€' },
            { label: t.landing.statSatisfaction, value: '99.9%' }
          ].map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: -1, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '120px 8%' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontSize: 42, fontWeight: 800, color: 'var(--text)', letterSpacing: -1.5, marginBottom: 16 }}>
            {t.landing.featuresTitle}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 500, margin: '0 auto' }}>
            {t.landing.featuresDesc}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32
        }}>
          {[
            {
              icon: FileText,
              title: t.landing.feature1Title,
              desc: t.landing.feature1Desc
            },
            {
              icon: BarChart3,
              title: t.landing.feature2Title,
              desc: t.landing.feature2Desc
            },
            {
              icon: ShieldCheck,
              title: t.landing.feature3Title,
              desc: t.landing.feature3Desc
            },
            {
              icon: Users,
              title: t.landing.feature4Title,
              desc: t.landing.feature4Desc
            },
            {
              icon: Globe,
              title: t.landing.feature5Title,
              desc: t.landing.feature5Desc
            },
            {
              icon: CreditCard,
              title: t.landing.feature6Title,
              desc: t.landing.feature6Desc
            }
          ].map((item, i) => (
            <div key={i} className="card-flat" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'var(--accent-subtle)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <item.icon size={24} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.3 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '0 8% 100px' }}>
        <div style={{
          background: 'var(--accent)',
          borderRadius: 32,
          padding: '80px 40px',
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(59,130,246,0.25)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
            zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 48, fontWeight: 900, marginBottom: 24, letterSpacing: -2 }}>
              {t.landing.ctaTitle}
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto 40px', fontWeight: 500 }}>
              {t.landing.ctaDesc}
            </p>
            <Link to="/login" className="btn btn-secondary" style={{
              background: '#fff',
              color: 'var(--accent)',
              padding: '0 40px',
              height: 60,
              fontSize: 17,
              fontWeight: 700,
              borderRadius: 14
            }}>
              {t.landing.ctaBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 8%', borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>InvoicePro</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
              {t.landing.footerDesc}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>{t.landing.footerProduct}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {t.landing.footerProductLinks.map((link: string, j: number) => (
                  <li key={j}><a href="#" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>{t.landing.footerCompany}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {t.landing.footerCompanyLinks.map((link: string, j: number) => (
                  <li key={j}><a href="#" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>{t.landing.footerLegal}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {t.landing.footerLegalLinks.map((link: string, j: number) => (
                  <li key={j}><a href="#" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 60, paddingTop: 40, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            © 2026 {t.landing.footerCopyright}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
