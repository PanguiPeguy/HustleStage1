// Types globaux pour l'application InvoicePro

export interface User {
  id: number;
  email: string;
  nomEntreprise: string;
  telephone?: string;
  adresse?: string;
  siret?: string;
  rib?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  nomEntreprise: string;
}

export interface Client {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  siret?: string;
  createdAt: string;
  nombreFactures: number;
}

export interface ClientRequest {
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  siret?: string;
}

export type StatutFacture = 'BROUILLON' | 'ENVOYEE' | 'PAYEE' | 'EN_RETARD';

export interface LigneFacture {
  id?: number;
  description: string;
  quantite: number;
  prixHT: number;
  tva: number;
  sousTotal?: number;
  montantTVA?: number;
}

export interface Facture {
  id: number;
  numero: string;
  date: string;
  echeance: string;
  statut: StatutFacture;
  note?: string;
  createdAt: string;
  client: {
    id: number;
    nom: string;
    email?: string;
  };
  lignes: LigneFacture[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
}

export interface FactureRequest {
  clientId: number;
  date: string;
  echeance: string;
  statut?: StatutFacture;
  note?: string;
  lignes: LigneFacture[];
}

export interface DashboardStats {
  caTotal: number;
  caEncaisse: number;
  caAEncaisser: number;
  totalFactures: number;
  facturesBrouillon: number;
  facturesEnvoyees: number;
  facturesPayees: number;
  facturesEnRetard: number;
  totalClients: number;
  topClients: Array<{
    id: number;
    nom: string;
    montantTotal: number;
    nombreFactures: number;
  }>;
  evolutionMensuelle: Array<{
    mois: string;
    montant: number;
  }>;
}
