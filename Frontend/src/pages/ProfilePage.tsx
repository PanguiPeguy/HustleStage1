import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Save, Building, MapPin, CreditCard,
  Mail, Loader2, Phone, Hash, ShieldCheck,
} from 'lucide-react';
import { userService } from '../services/dashboardService';
import { useAuthStore } from '../store/authStore';
import { useSettings }  from '../context/SettingsContext';
import toast from 'react-hot-toast';

interface ProfileForm {
  nomEntreprise: string;
  telephone:     string;
  adresse:       string;
  siret:         string;
  rib:           string;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const { t } = useSettings();

  const { register, handleSubmit, reset } = useForm<ProfileForm>();

  useEffect(() => {
    userService.getProfile()
      .then((data) =>
        reset({
          nomEntreprise: data.nomEntreprise || '',
          telephone:     data.telephone     || '',
          adresse:       data.adresse       || '',
          siret:         data.siret         || '',
          rib:           data.rib           || '',
        })
      )
      .catch(() => toast.error(t.common.error))
      .finally(() => setLoading(false));
  }, [reset, t.common.error]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      await userService.updateProfile(data);
      updateUser(data);
      toast.success(t.common.success ?? 'Enregistré');
    } catch {
      toast.error(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div className="spinner spinner-lg" />
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{t.profile.loading}</p>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    overflow: 'hidden',
  };

  const sectionLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: 20,
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.profile.title}</h1>
          <p className="page-subtitle">{t.profile.subtitle}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT — Profile summary card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Avatar card */}
          <div style={cardStyle}>
            {/* Cover */}
            <div
              style={{
                height: 80,
                background: 'linear-gradient(135deg, var(--accent) 0%, #1D4ED8 100%)',
                position: 'relative',
              }}
            />
            {/* Avatar */}
            <div style={{ padding: '0 20px 24px', position: 'relative' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: 'var(--surface)',
                  border: '3px solid var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--accent)',
                  marginTop: -28,
                  marginBottom: 16,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {user?.nomEntreprise?.[0]?.toUpperCase() || 'U'}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text)',
                  letterSpacing: -0.3,
                  marginBottom: 4,
                }}
              >
                {user?.nomEntreprise || 'Mon entreprise'}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: 'var(--text-3)',
                  fontWeight: 500,
                }}
              >
                <Mail size={12} />
                {user?.email}
              </div>
            </div>

            {/* Status row */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <ShieldCheck size={15} style={{ color: 'var(--success)' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Compte vérifié</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>InvoicePro Professionnel</div>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div
            style={{
              ...cardStyle,
              padding: '14px 18px',
              borderStyle: 'dashed',
            }}
          >
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.7 }}>
              The information entered here will appear on your future PDF documents and emails sent to your customers.
            </p>
          </div>
        </div>

        {/* RIGHT — Edit form */}
        <div style={cardStyle}>
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-2)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            Modifier mon profil
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 28 }}>
            {/* Section: Identity */}
            <div style={{ marginBottom: 32 }}>
              <div style={sectionLabelStyle}>
                <Building size={13} /> Company identity
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">{t.profile.company}</label>
                  <input
                    type="text"
                    {...register('nomEntreprise')}
                    className="form-input"
                    placeholder="Mon Studio Créatif"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.profile.phone}</label>
                  <div style={{ position: 'relative' }}>
                    <Phone
                      size={14}
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                    />
                    <input
                      type="tel"
                      {...register('telephone')}
                      className="form-input"
                      style={{ paddingLeft: 36 }}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.address}</label>
                <div style={{ position: 'relative' }}>
                  <MapPin
                    size={14}
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                  />
                  <input
                    type="text"
                    {...register('adresse')}
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="12 Rue de la Paix, 75001 Paris"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="divider" />

            {/* Section: Admin / Banking */}
            <div style={{ marginBottom: 32 }}>
              <div style={sectionLabelStyle}>
                <CreditCard size={13} /> Administrative information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">{t.profile.siret}</label>
                  <div style={{ position: 'relative' }}>
                    <Hash
                      size={14}
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                    />
                    <input
                      type="text"
                      {...register('siret')}
                      className="form-input"
                      style={{ paddingLeft: 36, fontFamily: 'monospace', fontSize: 12.5 }}
                      placeholder="123 456 789 00012"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.profile.rib}</label>
                  <input
                    type="text"
                    {...register('rib')}
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontSize: 12.5 }}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                  />
                  <span className="form-error" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
                    {t.profile.ribHint}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: 20,
                borderTop: '1px solid var(--border)',
              }}
            >
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ minWidth: 180, justifyContent: 'center' }}
              >
                {saving ? (
                  <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <Save size={15} />
                )}
                {saving ? t.profile.saving : t.profile.save}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
