import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowRight, ShieldCheck, TrendingUp, FileText, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', nomEntreprise: '' });

  const { setAuth } = useAuthStore();
  const { t } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await authService.login(form.email, form.password);
      } else {
        result = await authService.register(form.email, form.password, form.nomEntreprise);
      }
      setAuth(result.token, {
        id: result.userId,
        email: result.email,
        nomEntreprise: result.nomEntreprise,
      });
      toast.success(mode === 'login' ? t.auth.loginBtn : t.auth.registerBtn);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background blobs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
        zIndex: 0
      }} />

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        
        {/* Logo & Back button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-3)',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}>
            <ChevronLeft size={16} />
            {t.common.back || 'Back'}
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              background: 'var(--accent)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
            }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.5 }}>
              InvoicePro
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--text)',
              letterSpacing: -1,
              marginBottom: 8
            }}>
              {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 500 }}>
              {mode === 'login' ? t.auth.loginSubtitle : t.auth.registerSubtitle}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 4,
            marginBottom: 28
          }}>
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  background: mode === m ? 'var(--surface)' : 'transparent',
                  color: mode === m ? 'var(--accent)' : 'var(--text-3)',
                  boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {m === 'login' ? t.auth.login : t.auth.register}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {mode === 'register' && (
              <div className="form-group animate-fade-in">
                <label className="form-label">{t.auth.company}</label>
                <div style={{ position: 'relative' }}>
                  <TrendingUp size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: 42 }}
                    placeholder={t.auth.companyPlaceholder}
                    required
                    value={form.nomEntreprise}
                    onChange={(e) => setForm({ ...form, nomEntreprise: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t.auth.email}</label>
              <div style={{ position: 'relative' }}>
                <FileText size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder={t.auth.emailPlaceholder}
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.auth.password}</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  placeholder="••••••••••"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-3)',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                marginTop: 8,
                width: '100%',
                justifyContent: 'center',
                height: 48,
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 12
              }}
            >
              {loading ? (
                <span className="spinner" style={{ borderTopColor: '#fff' }} />
              ) : (
                <>
                  {mode === 'login' ? t.auth.loginBtn : t.auth.registerBtn}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-3)' }}>
              Vous n'avez pas de compte ?{' '}
              <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                Créer un compte
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
              En vous inscrivant, vous acceptez nos{' '}
              <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>Conditions d'utilisation</span> et notre{' '}
              <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>Politique de confidentialité</span>.
            </p>
          )}
        </div>

        {/* Footer info */}
        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
          © 2026 InvoicePro — Solution de facturation sécurisée
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
