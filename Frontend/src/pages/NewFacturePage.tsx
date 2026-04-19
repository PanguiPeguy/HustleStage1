import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Plus, Trash2, Save, ArrowLeft, Loader2,
  FileText, ChevronRight, Info,
} from 'lucide-react';
import { clientService }  from '../services/clientService';
import { invoiceService } from '../services/invoiceService';
import { useSettings }    from '../context/SettingsContext';
import type { Client }    from '../types';
import toast              from 'react-hot-toast';

const schema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  date:     z.string().min(1, 'Date requise'),
  echeance: z.string().min(1, 'Échéance requise'),
  statut:   z.enum(['BROUILLON', 'ENVOYEE', 'PAYEE', 'EN_RETARD']),
  note:     z.string().optional(),
  lignes:   z.array(z.object({
    description: z.string().min(1, 'Description requise'),
    quantite:    z.number().min(0.01, 'Quantité invalide'),
    prixHT:      z.number().min(0, 'Prix invalide'),
    tva:         z.number().min(0, 'TVA invalide'),
  })).min(1, 'Au moins une ligne requise'),
});

type FormValues = z.infer<typeof schema>;

/* ── tiny helpers ───────────────────────────────────────────────────── */
const sectionStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  overflow: 'hidden',
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-2)',
};

/* ─────────────────────────────────────────────────────────────────── */
const NewFacturePage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const { t, lang } = useSettings();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    register, control, handleSubmit, watch, reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date:     new Date().toISOString().split('T')[0],
      echeance: new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0],
      statut:   'BROUILLON',
      lignes:   [{ description: '', quantite: 1, prixHT: 0, tva: 20 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' });
  const watchLignes = watch('lignes');

  useEffect(() => {
    clientService.getAll().then(setClients).catch(() => toast.error(t.common.error));
    
    if (id) {
      invoiceService.getById(Number(id)).then(f => {
        reset({
          clientId: f.client.id.toString(),
          date: f.date,
          echeance: f.echeance,
          statut: f.statut,
          note: f.note,
          lignes: f.lignes.map(l => ({
            description: l.description,
            quantite: l.quantite,
            prixHT: l.prixHT,
            tva: l.tva
          }))
        });
      }).catch(() => toast.error("Erreur lors du chargement de la facture"));
    }
  }, [t.common.error, id, reset]);

  const calcTotals = () =>
    watchLignes.reduce(
      (acc, l) => {
        const ht  = (Number(l.quantite) || 0) * (Number(l.prixHT) || 0);
        const tva = ht * ((Number(l.tva) || 0) / 100);
        return { ht: acc.ht + ht, tva: acc.tva + tva, ttc: acc.ttc + ht + tva };
      },
      { ht: 0, tva: 0, ttc: 0 },
    );

  const totals = calcTotals();

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'EUR' }).format(v);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      if (id) {
        await invoiceService.update(Number(id), { ...data, clientId: Number(data.clientId) });
        toast.success("Facture mise à jour");
      } else {
        await invoiceService.create({ ...data, clientId: Number(data.clientId) });
        toast.success(t.newInvoice.created);
      }
      navigate('/factures');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  /* ── field input style ── */
  const inlineInput: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-2)',
    border: '1.5px solid var(--border)',
    borderRadius: 7,
    padding: '7px 10px',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button
          onClick={() => navigate('/factures')}
          className="btn btn-secondary btn-sm"
          style={{ padding: '7px 10px' }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>
            {id ? 'Modifier la facture' : t.newInvoice.title}
          </h1>
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--text-3)',
              fontWeight: 500,
            }}
          >
            <span>{t.nav.invoices}</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--accent)' }}>
              {id ? 'Modification' : t.newInvoice.title}
            </span>
          </nav>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Section 1: Client & Dates ── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={15} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                Informations générales
              </span>
            </div>
          </div>
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {/* Client */}
            <div className="form-group">
              <label className="form-label">
                {t.newInvoice.clientLabel}
                <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select {...register('clientId')} className="form-select">
                  <option value="">{t.newInvoice.clientPlaceholder}</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
              {errors.clientId && (
                <span className="form-error">{errors.clientId.message}</span>
              )}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">{t.newInvoice.dateLabel}</label>
              <input type="date" {...register('date')} className="form-input" />
            </div>

            {/* Échéance */}
            <div className="form-group">
              <label className="form-label">{t.newInvoice.dueLabel}</label>
              <input type="date" {...register('echeance')} className="form-input" />
            </div>
          </div>
        </div>

        {/* ── Section 2: Line items ── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={15} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                {t.newInvoice.lines}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => append({ description: '', quantite: 1, prixHT: 0, tva: 20 })}
            >
              <Plus size={14} />
              {t.newInvoice.addLine}
            </button>
          </div>

          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 90px 110px 80px 110px 40px',
              gap: 8,
              padding: '10px 24px',
              background: 'var(--bg-2)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {[
              t.newInvoice.description,
              t.newInvoice.qty,
              t.newInvoice.unitPrice,
              t.newInvoice.vat,
              t.newInvoice.lineTotal,
              '',
            ].map((h, i) => (
              <div
                key={i}
                className="section-label"
                style={{ textAlign: i >= 1 ? 'center' : 'left' }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ padding: '0 24px' }}>
            {fields.map((field, index) => {
              const lineTotal =
                (watchLignes[index]?.quantite || 0) * (watchLignes[index]?.prixHT || 0);
              return (
                <div
                  key={field.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 90px 110px 80px 110px 40px',
                    gap: 8,
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < fields.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {/* Description */}
                  <input
                    {...register(`lignes.${index}.description`)}
                    style={{ ...inlineInput }}
                    placeholder="Description du produit ou service..."
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow  = '0 0 0 3px var(--accent-subtle)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow  = 'none';
                    }}
                  />
                  {/* Qté */}
                  <input
                    type="number"
                    step="0.1"
                    {...register(`lignes.${index}.quantite`, { valueAsNumber: true })}
                    style={{ ...inlineInput, textAlign: 'center' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow  = '0 0 0 3px var(--accent-subtle)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow  = 'none';
                    }}
                  />
                  {/* Prix HT */}
                  <input
                    type="number"
                    step="0.01"
                    {...register(`lignes.${index}.prixHT`, { valueAsNumber: true })}
                    style={{ ...inlineInput, textAlign: 'right' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow  = '0 0 0 3px var(--accent-subtle)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow  = 'none';
                    }}
                  />
                  {/* TVA */}
                  <input
                    type="number"
                    step="0.1"
                    {...register(`lignes.${index}.tva`, { valueAsNumber: true })}
                    style={{ ...inlineInput, textAlign: 'center' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow  = '0 0 0 3px var(--accent-subtle)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow  = 'none';
                    }}
                  />
                  {/* Total HT */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: 'var(--text)',
                    }}
                  >
                    {fmtCurrency(lineTotal)}
                  </div>
                  {/* Delete */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      style={{ opacity: fields.length === 1 ? 0.3 : 1 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 3: Notes + Totals ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
          {/* Notes */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={15} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                  {t.newInvoice.notes}
                </span>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <textarea
                {...register('note')}
                className="form-textarea"
                style={{ minHeight: 140 }}
                placeholder={t.newInvoice.notesPlaceholder}
              />
            </div>
          </div>

          {/* Totals */}
          <div
            style={{
              ...sectionStyle,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={sectionHeaderStyle}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Récapitulatif</span>
            </div>
            <div style={{ padding: 24 }}>
              {/* HT */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
                  {t.newInvoice.totalHT}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                  {fmtCurrency(totals.ht)}
                </span>
              </div>
              {/* TVA */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
                  {t.newInvoice.totalVAT}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>
                  {fmtCurrency(totals.tva)}
                </span>
              </div>
              {/* TTC */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '16px 0 4px',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                  {t.newInvoice.totalTTC}
                </span>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: 'var(--text)',
                    letterSpacing: -1,
                  }}
                >
                  {fmtCurrency(totals.ttc)}
                </span>
              </div>

              {/* Actions */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '11px 0' }}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 0.7s linear infinite' }} />
                  ) : (
                    <Save size={16} />
                  )}
                  {loading ? t.newInvoice.saving : t.newInvoice.save}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/factures')}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default NewFacturePage;
