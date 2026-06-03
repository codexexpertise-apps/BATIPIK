let db;
let dernierChantier = null;
const DB_NAME = 'BatipikLocalDB';
const STORE_NAME = 'chantiers';
const SETTINGS_STORE_NAME = 'settings';
const LOGO_KEY = 'artisan_logo';
const SETTINGS_KEY = 'batipik_settings_v3';
const LANG_KEY = 'batipik_lang';
const DEVIS_COUNTER_KEY = 'batipik_devis_counter';
const photoCache = { carrelage: '', placo: '' };
let artisanLogoData = '';

const defaultSettings = {
  artisanNom: 'BÂTIPIK',
  artisanContact: '',
  artisanSiret: '',
  prixCarrelage: 75,
  prixPlaco: 55,
  prixCarrelageMateriau: 25,
  prixCarrelagePose: 40,
  prixCarrelageConso: 10,
  prixPlacoMateriau: 22,
  prixPlacoPose: 28,
  prixPlacoConso: 5,
  devisPrefixe: `${new Date().getFullYear()}-`,
  devisSuffixe: '',
  devisProchainNumero: 1,
  devisNbChiffres: 4
};

const i18n = {
  fr: {
    tagline: 'Devis rapide · Colisage chantier', client_chantier: 'Client / chantier', adresse_chantier: 'Adresse du chantier',
    email_client: 'Email client', telephone_client: 'Téléphone client', date_souhaitee: 'Date souhaitée chantier', ph_email_client: 'client@email.fr', ph_tel_client: '06 ...',
    ph_client_carrelage: 'Ex : Mme Martin - Salle de bain', ph_client_placo: 'Ex : M. Durand - Cloison bureau', ph_adresse: 'Ex : 12 rue des Lilas, Colmar',
    prix_pose_global: 'Prix de vente posé (€ HT / m²)', mode_detail_prix: 'Détailler le prix pour le client', prix_carrelage_fourni: 'Carrelage fourni (€ HT / m²)',
    prix_pose_seule: 'Pose (€ HT / m²)', prix_consommables: 'Consommables colle / joints (€ HT / m²)', prix_materiaux_placo: 'Matériaux plaques / ossature (€ HT / m²)',
    prix_consommables_placo: 'Consommables vis / enduit (€ HT / m²)', ligne_manuelle: 'Ligne manuelle optionnelle', ph_ligne_carrelage: 'Ex : Forfait ragréage ou dépose',
    ph_ligne_placo: 'Ex : Forfait isolation laine de verre', ph_montant: 'Montant en € HT', photo_chantier: 'Photo chantier optionnelle', supprimer_photo: 'Supprimer la photo',
    type_chantier: 'Type de chantier', sol_interieur: 'Sol intérieur', mur: 'Mur', faience_douche: 'faïence / douche', terrasse_exterieure: 'Terrasse extérieure',
    surface_totale: 'Surface totale (m²)', format_carreau: 'Format du carreau (cm)', rectangulaire: 'Rectangulaire', marge_perte_auto: 'Marge de perte automatique', standard_10: '+10% standard', options_devis: 'Options devis HT / TVA / remise',
    generer_devis_colisage: 'Générer mon devis\net colisage', enregistrer_parametres: 'Enregistrer les paramètres', devis_colisage_prets: 'Devis & colisage\nprêts',
    lignes_devis_client: 'Lignes du devis client', base_avant_remise: 'Base avant remise', prestation_principale: 'Prestation principale', total_ht: 'Total HT',
    tva: 'TVA', total_ttc: 'Total TTC', logistique_colisage: 'Logistique & colisage camion', btn_devis: 'Générer devis client', btn_colisage: 'Générer fiche colisage', btn_email: 'Préparer email client', fermer: 'Fermer'
  },
  tr: {
    tagline: 'Hızlı teklif · Şantiye malzeme listesi', client_chantier: 'Müşteri / şantiye', adresse_chantier: 'Şantiye adresi',
    email_client: 'Müşteri e-posta', telephone_client: 'Müşteri telefonu', date_souhaitee: 'İstenen şantiye tarihi', ph_email_client: 'client@email.fr', ph_tel_client: '06 ...',
    ph_client_carrelage: 'Örn: Martin Hanım - Banyo', ph_client_placo: 'Örn: Durand Bey - Ofis bölmesi', ph_adresse: 'Örn: 12 rue des Lilas, Colmar',
    prix_pose_global: 'Döşenmiş satış fiyatı (€ HT / m²)', mode_detail_prix: 'Müşteri için fiyatı detaylandır', prix_carrelage_fourni: 'Seramik malzeme (€ HT / m²)',
    prix_pose_seule: 'İşçilik / montaj (€ HT / m²)', prix_consommables: 'Sarf malzemeler yapıştırıcı / derz (€ HT / m²)', prix_materiaux_placo: 'Malzeme alçı levha / profil (€ HT / m²)',
    prix_consommables_placo: 'Sarf malzemeler vida / derz alçısı (€ HT / m²)', ligne_manuelle: 'İsteğe bağlı ekstra satır', ph_ligne_carrelage: 'Örn: Tesviye veya söküm bedeli',
    ph_ligne_placo: 'Örn: Cam yünü yalıtım bedeli', ph_montant: 'Tutar € HT', photo_chantier: 'İsteğe bağlı şantiye fotoğrafı', supprimer_photo: 'Fotoğrafı sil',
    type_chantier: 'Şantiye tipi', sol_interieur: 'İç mekân zemin', mur: 'Duvar', faience_douche: 'fayans / duş', terrasse_exterieure: 'Dış teras',
    surface_totale: 'Toplam alan (m²)', format_carreau: 'Seramik ölçüsü (cm)', rectangulaire: 'Dikdörtgen', marge_perte_auto: 'Otomatik fire payı', standard_10: '+10% standart', options_devis: 'Teklif seçenekleri HT / KDV / indirim',
    generer_devis_colisage: 'Teklif ve malzeme\nlistesi oluştur', enregistrer_parametres: 'Ayarları kaydet', devis_colisage_prets: 'Teklif ve liste\nhazır',
    lignes_devis_client: 'Müşteri teklif satırları', base_avant_remise: 'İndirim öncesi tutar', prestation_principale: 'Ana hizmet', total_ht: 'Toplam HT',
    tva: 'KDV', total_ttc: 'Toplam TTC', logistique_colisage: 'Kamyon / şantiye malzeme listesi', btn_devis: 'Fransızca müşteri teklifi', btn_colisage: 'Şantiye malzeme fişi', btn_email: 'Müşteri e-postası hazırla', fermer: 'Kapat'
  }
};

const request = indexedDB.open(DB_NAME, 2);
request.onupgradeneeded = (event) => {
  db = event.target.result;
  if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
  if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) db.createObjectStore(SETTINGS_STORE_NAME, { keyPath: 'key' });
};
request.onsuccess = (event) => { db = event.target.result; chargerLogoArtisan(); initialiserParametres(); chargerHistorique(); applyLanguage(); };
request.onerror = () => console.error('Impossible d’ouvrir IndexedDB pour BATIPIK.');

document.addEventListener('DOMContentLoaded', () => {
  initialiserParametres();
  applyLanguage();
  ['devis-prefixe', 'devis-prochain-numero', 'devis-nb-chiffres', 'devis-suffixe'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', majApercuNumeroDevis);
  });
});

function currentLang() { return localStorage.getItem(LANG_KEY) || 'fr'; }
function t(key) { return (i18n[currentLang()] && i18n[currentLang()][key]) || i18n.fr[key] || key; }
function toggleLang() { localStorage.setItem(LANG_KEY, currentLang() === 'fr' ? 'tr' : 'fr'); applyLanguage(); if (dernierChantier) afficherResultatModal(dernierChantier); }
function applyLanguage() {
  document.documentElement.lang = currentLang();
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.innerHTML = safeText(t(el.dataset.i18n)).replaceAll('\n', '<br>'); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = currentLang() === 'fr' ? '🌍 TR' : '🌍 FR';
}

function switchTab(evt, tabName) {
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
  document.querySelectorAll('.pane').forEach((pane) => pane.classList.remove('active'));
  if (evt?.currentTarget) evt.currentTarget.classList.add('active');
  document.getElementById(`pane-${tabName}`)?.classList.add('active');
  if (tabName === 'historique') chargerHistorique();
  if (tabName === 'parametres') remplirFormParametres();
}

function getSettings() { try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; } catch { return { ...defaultSettings }; } }
function setSettings(settings) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
function initialiserParametres() {
  const s = getSettings();
  setValue('px-carrelage', s.prixCarrelage);
  setValue('px-placo', s.prixPlaco);
  setValue('prix-materiau-carrelage', s.prixCarrelageMateriau);
  setValue('prix-pose-carrelage', s.prixCarrelagePose);
  setValue('prix-conso-carrelage', s.prixCarrelageConso);
  setValue('prix-materiau-placo', s.prixPlacoMateriau);
  setValue('prix-pose-placo', s.prixPlacoPose);
  setValue('prix-conso-placo', s.prixPlacoConso);
  remplirFormParametres();
}
function remplirFormParametres() {
  const s = getSettings();
  setValue('artisan-nom', s.artisanNom);
  setValue('artisan-contact', s.artisanContact);
  setValue('artisan-siret', s.artisanSiret);
  afficherLogoArtisanPreview();
  setValue('prix-carrelage-defaut', s.prixCarrelage);
  setValue('prix-placo-defaut', s.prixPlaco);
  setValue('prix-carrelage-materiau-defaut', s.prixCarrelageMateriau);
  setValue('prix-carrelage-pose-defaut', s.prixCarrelagePose);
  setValue('prix-carrelage-conso-defaut', s.prixCarrelageConso);
  setValue('prix-placo-materiau-defaut', s.prixPlacoMateriau);
  setValue('prix-placo-pose-defaut', s.prixPlacoPose);
  setValue('prix-placo-conso-defaut', s.prixPlacoConso);
  setValue('devis-prefixe', s.devisPrefixe);
  setValue('devis-prochain-numero', s.devisProchainNumero);
  setValue('devis-nb-chiffres', s.devisNbChiffres);
  setValue('devis-suffixe', s.devisSuffixe);
  majApercuNumeroDevis();
}
function sauverParametres(e) {
  e.preventDefault();
  const settings = {
    artisanNom: getInput('artisan-nom') || 'BÂTIPIK',
    artisanContact: getInput('artisan-contact'),
    artisanSiret: getInput('artisan-siret'),
    prixCarrelage: getNumber('prix-carrelage-defaut', 75),
    prixPlaco: getNumber('prix-placo-defaut', 55),
    prixCarrelageMateriau: getNumber('prix-carrelage-materiau-defaut', 25),
    prixCarrelagePose: getNumber('prix-carrelage-pose-defaut', 40),
    prixCarrelageConso: getNumber('prix-carrelage-conso-defaut', 10),
    prixPlacoMateriau: getNumber('prix-placo-materiau-defaut', 22),
    prixPlacoPose: getNumber('prix-placo-pose-defaut', 28),
    prixPlacoConso: getNumber('prix-placo-conso-defaut', 5),
    devisPrefixe: getInput('devis-prefixe') || `${new Date().getFullYear()}-`,
    devisProchainNumero: normaliserNumeroDevisParam(getInput('devis-prochain-numero'), 1),
    devisNbChiffres: Math.min(Math.max(normaliserNumeroDevisParam(getInput('devis-nb-chiffres'), 4), 1), 8),
    devisSuffixe: getInput('devis-suffixe')
  };
  setSettings(settings);
  initialiserParametres();
  alert(currentLang() === 'tr' ? 'Ayarlar kaydedildi.' : 'Paramètres enregistrés.');
}
function setValue(id, value) { const el = document.getElementById(id); if (el) el.value = value ?? ''; }
function getInput(id) { return document.getElementById(id)?.value.trim() || ''; }
function getNumber(id, fallback = 0) { const value = parseFloat(document.getElementById(id)?.value); return Number.isFinite(value) ? value : fallback; }

function construireApercuNumeroDevis() {
  const prefixe = getInput('devis-prefixe') || `${new Date().getFullYear()}-`;
  const suffixe = getInput('devis-suffixe');
  const prochain = normaliserNumeroDevisParam(getInput('devis-prochain-numero'), 1);
  const nbChiffres = Math.min(Math.max(normaliserNumeroDevisParam(getInput('devis-nb-chiffres'), 4), 1), 8);
  return `${prefixe}${String(prochain).padStart(nbChiffres, '0')}${suffixe}`;
}

function majApercuNumeroDevis() {
  const el = document.getElementById('apercu-numero-devis');
  if (el) el.textContent = construireApercuNumeroDevis();
}

function chargerLogoArtisan() {
  if (!db || !db.objectStoreNames.contains(SETTINGS_STORE_NAME)) return;
  const req = db.transaction([SETTINGS_STORE_NAME], 'readonly').objectStore(SETTINGS_STORE_NAME).get(LOGO_KEY);
  req.onsuccess = () => {
    artisanLogoData = req.result?.value || '';
    afficherLogoArtisanPreview();
  };
}
function enregistrerLogoArtisan(dataUrl) {
  artisanLogoData = dataUrl || '';
  afficherLogoArtisanPreview();
  if (!db || !db.objectStoreNames.contains(SETTINGS_STORE_NAME)) return;
  const tx = db.transaction([SETTINGS_STORE_NAME], 'readwrite');
  tx.objectStore(SETTINGS_STORE_NAME).put({ key: LOGO_KEY, value: artisanLogoData });
}
function choisirLogoArtisan(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
    alert('Merci de choisir un logo au format PNG, JPG ou JPEG.');
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => enregistrerLogoArtisan(String(reader.result || ''));
  reader.readAsDataURL(file);
}
function supprimerLogoArtisan() {
  if (!confirm('Supprimer le logo entreprise ?')) return;
  enregistrerLogoArtisan('');
  const input = document.getElementById('artisan-logo');
  if (input) input.value = '';
}
function afficherLogoArtisanPreview() {
  const preview = document.getElementById('artisan-logo-preview');
  const empty = document.getElementById('artisan-logo-empty');
  const remove = document.getElementById('artisan-logo-remove');
  if (preview) {
    preview.src = artisanLogoData || '';
    preview.hidden = !artisanLogoData;
  }
  if (empty) empty.hidden = !!artisanLogoData;
  if (remove) remove.hidden = !artisanLogoData;
}
function enteteArtisanHtml(s, titreDroite = '') {
  const logo = artisanLogoData ? `<img src="${artisanLogoData}" class="pdf-logo" alt="Logo entreprise">` : '';
  return `<div class="head"><div class="artisan-head">${logo}<div><div class="brand">${safeText(s.artisanNom || 'BÂTIPIK')}</div><div>${safeText(s.artisanContact || '')}</div><div>${safeText(s.artisanSiret || '')}</div></div></div><div>${titreDroite}</div></div>`;
}
function euro(value) { return Number(value).toFixed(2); }
function safeText(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\"', '&quot;').replaceAll("'", '&#039;'); }
function normaliserNumeroDevisParam(value, fallback = 1) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function genererNumeroDevis() {
  const settings = getSettings();
  const prefixe = settings.devisPrefixe ?? `${new Date().getFullYear()}-`;
  const suffixe = settings.devisSuffixe ?? '';
  const nbChiffres = Math.min(Math.max(normaliserNumeroDevisParam(settings.devisNbChiffres, 4), 1), 8);
  const next = normaliserNumeroDevisParam(settings.devisProchainNumero, 1);
  const numero = `${prefixe}${String(next).padStart(nbChiffres, '0')}${suffixe}`;
  setSettings({ ...settings, devisProchainNumero: next + 1, devisNbChiffres: nbChiffres, devisPrefixe: prefixe, devisSuffixe: suffixe });
  remplirFormParametres();
  return numero;
}

function togglePrixDetail(module) { const box = document.getElementById(`detail-prix-${module}`); const chk = document.getElementById(`mode-detail-${module}`); if (box && chk) box.hidden = !chk.checked; }

function slugPrestation(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'prestation';
}

function togglePrestationComplementaire(module, checkbox) {
  const container = document.getElementById(`prestations-montants-${module}`);
  if (!container || !checkbox) return;
  const label = checkbox.value || 'Prestation complémentaire';
  const slug = slugPrestation(label);
  const rowId = `prestation-${module}-${slug}`;
  const existing = document.getElementById(rowId);

  if (!checkbox.checked) {
    if (existing) existing.remove();
    return;
  }

  if (existing) return;

  const isCustom = checkbox.dataset.custom === '1';
  const row = document.createElement('div');
  row.className = 'prestation-row';
  row.id = rowId;
  row.dataset.label = label;
  row.dataset.custom = isCustom ? '1' : '0';
  row.innerHTML = `
    <div class="prestation-label-zone">
      ${isCustom
        ? `<input type="text" class="prestation-custom-label" placeholder="Nom de la prestation">`
        : `<strong>${safeText(label)}</strong>`}
    </div>
    <div class="prestation-amount-zone">
      <input type="number" class="prestation-montant" min="0" step="0.01" placeholder="Montant € HT">
      <button type="button" class="prestation-remove" aria-label="Retirer la prestation">×</button>
    </div>
  `;
  row.querySelector('.prestation-remove')?.addEventListener('click', () => {
    checkbox.checked = false;
    row.remove();
  });
  container.appendChild(row);
}

function collectPrestationsComplementaires(module) {
  const rows = Array.from(document.querySelectorAll(`#prestations-montants-${module} .prestation-row`));
  return rows.map((row) => {
    const custom = row.dataset.custom === '1';
    const libelle = custom
      ? (row.querySelector('.prestation-custom-label')?.value || '').trim()
      : (row.dataset.label || '').trim();
    const montant = Math.max(parseFloat(row.querySelector('.prestation-montant')?.value || '0') || 0, 0);
    return { libelle: libelle || 'Prestation complémentaire', montant };
  }).filter((item) => item.montant > 0);
}

function getPrixDetail(module, surface, prixGlobal) {
  const active = !!document.getElementById(`mode-detail-${module}`)?.checked;
  if (!active) return { active: false, prixM2: prixGlobal, lignes: [] };
  const materiau = Math.max(getNumber(`prix-materiau-${module}`), 0);
  const pose = Math.max(getNumber(`prix-pose-${module}`), 0);
  const conso = Math.max(getNumber(`prix-conso-${module}`), 0);
  return {
    active: true,
    prixM2: materiau + pose + conso,
    lignes: module === 'carrelage'
      ? [
          { libelle: 'Carrelage fourni', montantHT: surface * materiau },
          { libelle: 'Pose du carrelage', montantHT: surface * pose },
          { libelle: 'Consommables colle / joints', montantHT: surface * conso }
        ]
      : [
          { libelle: 'Matériaux plaques / ossature', montantHT: surface * materiau },
          { libelle: 'Pose des plaques / cloisons', montantHT: surface * pose },
          { libelle: 'Consommables vis / enduit', montantHT: surface * conso }
        ]
  };
}

function buildFinance(surface, prixM2, remisePourcent, montantSup, tauxTva, lignesDetaillees = []) {
  const baseBruteHT = surface * prixM2;
  const remiseMontant = baseBruteHT * (remisePourcent / 100);
  const baseApresRemiseHT = baseBruteHT - remiseMontant;
  const totalHT = baseApresRemiseHT + montantSup;
  const montantTva = totalHT * tauxTva;
  const coefficientRemise = baseBruteHT > 0 ? baseApresRemiseHT / baseBruteHT : 1;
  const lignesDetailleesApresRemise = lignesDetaillees.map((l) => ({ libelle: l.libelle, montantHT: euro(l.montantHT * coefficientRemise) }));
  return { baseBruteHT, remiseMontant, baseApresRemiseHT, totalHT, montantTva, totalTTC: totalHT + montantTva, lignesDetaillees: lignesDetailleesApresRemise };
}

async function previewPhoto(module) {
  const input = document.getElementById(`photo-${module}`);
  const preview = document.getElementById(`preview-${module}`);
  const file = input?.files?.[0];
  if (!file) { photoCache[module] = ''; if (preview) preview.hidden = true; const removeBtn = document.getElementById(`remove-photo-${module}`); if (removeBtn) removeBtn.hidden = true; return; }
  const dataUrl = await reduceImage(file, 900, 0.72);
  photoCache[module] = dataUrl;
  if (preview) { preview.src = dataUrl; preview.hidden = false; }
  const removeBtn = document.getElementById(`remove-photo-${module}`);
  if (removeBtn) removeBtn.hidden = false;
}
function removePhoto(module) {
  photoCache[module] = '';
  const input = document.getElementById(`photo-${module}`);
  const preview = document.getElementById(`preview-${module}`);
  const removeBtn = document.getElementById(`remove-photo-${module}`);
  if (input) input.value = '';
  if (preview) { preview.removeAttribute('src'); preview.hidden = true; }
  if (removeBtn) removeBtn.hidden = true;
}
function reduceImage(file, maxSize, quality) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio); canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function calculerCarreleur(e) {
  e.preventDefault();
  const typeSol = document.querySelector('input[name="type_sol"]:checked').value;
  const surface = getNumber('surf-carrelage');
  const format = document.querySelector('input[name="format_carreau"]:checked').value;
  const coefficientMarge = getNumber('marge-carrelage', 1.10);
  const prixDetail = getPrixDetail('carrelage', surface, getNumber('px-carrelage'));
  const tauxTva = getNumber('tva-carrelage', 0.10);
  const remisePourcent = Math.min(Math.max(getNumber('remise-carrelage'), 0), 100);
  const labelSup = getInput('label-sup-carrelage');
  const montantSup = Math.max(getNumber('montant-sup-carrelage'), 0);
  const prestationsComplementaires = collectPrestationsComplementaires('carrelage');
  const montantPrestationsComplementaires = prestationsComplementaires.reduce((sum, item) => sum + item.montant, 0);
  let ratioColle = 4.0, ratioJoint = 0.5, ratioCroisillons = 5;
  if (format === '60x60' || format === 'rect') { ratioColle = 5.5; ratioCroisillons = 8; }
  if (typeSol === 'sol_ext') ratioColle += 0.5;
  if (typeSol === 'mur_int') ratioColle += 0.3;
  const finance = buildFinance(surface, prixDetail.prixM2, remisePourcent, montantSup + montantPrestationsComplementaires, tauxTva, prixDetail.lignes);
  const chantier = creerChantierCommun({
    metier: 'Carreleur', client: getInput('client-carrelage'), adresse: getInput('adresse-carrelage'), dateSouhaitee: getInput('date-souhaitee-carrelage'), email: getInput('email-carrelage'), telephone: getInput('telephone-carrelage'),
    format: format, typeChantier: typeSol, details: `Format : ${libelleFormatCarreau(format)} | Type : ${libelleTypeChantier(typeSol)}${remisePourcent > 0 ? ` | Remise : ${remisePourcent}%` : ''}`,
    surface, tauxTva, remisePourcent, labelSup, montantSup, prestationsComplementaires, finance, prixDetaille: prixDetail.active, photo: photoCache.carrelage,
    colisage: { 'Carrelage à commander (m²)': (surface * coefficientMarge).toFixed(1), 'Mortier-colle (sacs de 25 kg)': Math.ceil((surface * ratioColle) / 25), 'Mortier-joint (sacs de 5 kg)': Math.ceil((surface * ratioJoint) / 5), 'Croisillons autonivelants (pcs)': Math.ceil(surface * ratioCroisillons) }
  });
  sauvegarderChantier(chantier); afficherResultatModal(chantier);
}

function calculerPlaquiste(e) {
  e.preventDefault();
  const typePlaco = document.querySelector('input[name="type_placo"]:checked').value;
  const surface = getNumber('surf-placo');
  const coefficientMarge = getNumber('marge-placo', 1.08);
  const prixDetail = getPrixDetail('placo', surface, getNumber('px-placo'));
  const tauxTva = getNumber('tva-placo', 0.10);
  const remisePourcent = Math.min(Math.max(getNumber('remise-placo'), 0), 100);
  const labelSup = getInput('label-sup-placo');
  const montantSup = Math.max(getNumber('montant-sup-placo'), 0);
  const prestationsComplementaires = collectPrestationsComplementaires('placo');
  const montantPrestationsComplementaires = prestationsComplementaires.reduce((sum, item) => sum + item.montant, 0);
  const typePlaqueLabel = typePlaco === 'hydro' ? 'BA13 Hydrofuge' : typePlaco === 'phoni' ? 'BA13 Phonique' : 'BA13 Standard';
  const finance = buildFinance(surface, prixDetail.prixM2, remisePourcent, montantSup + montantPrestationsComplementaires, tauxTva, prixDetail.lignes);
  const chantier = creerChantierCommun({
    metier: 'Plaquiste', client: getInput('client-placo'), adresse: getInput('adresse-placo'), dateSouhaitee: getInput('date-souhaitee-placo'), email: getInput('email-placo'), telephone: getInput('telephone-placo'), details: `${typePlaqueLabel}${remisePourcent > 0 ? ` | Remise : ${remisePourcent}%` : ''}`,
    typePlacoLabel: typePlaqueLabel, surface, tauxTva, remisePourcent, labelSup, montantSup, prestationsComplementaires, finance, prixDetaille: prixDetail.active, photo: photoCache.placo,
    colisage: { [`Plaques ${typePlaqueLabel} (U)`]: Math.ceil((surface * 2.0 * coefficientMarge) / 3), 'Montants métalliques (ml)': Math.ceil(surface * 2.1 * coefficientMarge), 'Rails d’ossature (ml)': Math.ceil(surface * 0.8 * coefficientMarge), 'Vis TTPC 25 (boîtes de 500)': Math.ceil((surface * 24) / 500), 'Enduit à joint (sacs de 25 kg)': Math.ceil((surface * 0.7) / 25) }
  });
  sauvegarderChantier(chantier); afficherResultatModal(chantier);
}

function creerChantierCommun({ metier, client, adresse, dateSouhaitee, email, telephone, details, surface, format, typeChantier, typePlacoLabel, tauxTva, remisePourcent, labelSup, montantSup, prestationsComplementaires = [], finance, colisage, prixDetaille, photo }) {
  return { numeroDevis: genererNumeroDevis(), metier, client: client || 'Client non renseigné', adresse: adresse || '', dateSouhaitee: dateSouhaitee || '', email: email || '', telephone: telephone || '', statut: 'en_attente', details, surface, format: format || '', typeChantier: typeChantier || '', typePlacoLabel: typePlacoLabel || '',
    totalHT: euro(finance.totalHT), totalTTC: euro(finance.totalTTC), tvaLabel: `${(tauxTva * 100).toFixed(tauxTva === 0.055 ? 1 : 0)} %`, montantTva: euro(finance.montantTva),
    baseBruteHT: euro(finance.baseBruteHT), baseApresRemiseHT: euro(finance.baseApresRemiseHT), remiseMontant: euro(finance.remiseMontant), lignesDetaillees: finance.lignesDetaillees || [], prixDetaille: !!prixDetaille,
    ligneSup: montantSup > 0 ? { label: labelSup || 'Travaux complémentaires', montant: euro(montantSup) } : null, prestationsComplementaires: prestationsComplementaires.map((item) => ({ libelle: item.libelle, montant: euro(item.montant) })), remiseLabel: remisePourcent > 0 ? `Remise de ${remisePourcent}% incluse` : null,
    colisage, photo: photo || '', date: new Date().toLocaleDateString('fr-FR'), isoDate: new Date().toISOString() };
}


function formatDateFr(value) {
  if (!value) return '';
  const parts = String(value).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return value;
}
function libelleStatut(value) {
  const map = { envoye: 'Devis envoyé', en_attente: 'Réponse en attente', accepte: 'Accepté', termine: 'Terminé' };
  return map[value] || 'Réponse en attente';
}
function statutClass(value) {
  const map = { envoye: 'status-envoye', en_attente: 'status-attente', accepte: 'status-accepte', termine: 'status-termine' };
  return map[value] || 'status-attente';
}
function updateStatutChantier(id, statut) {
  if (!db || id === undefined || id === null) return;
  const tx = db.transaction([STORE_NAME], 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.get(Number(id));
  req.onsuccess = () => {
    const item = req.result;
    if (!item) return;
    item.statut = statut;
    store.put(item);
  };
  tx.oncomplete = chargerHistorique;
}

function afficherResultatModal(data) {
  dernierChantier = data;
  const colisageHtml = Object.keys(data.colisage).map((key) => `<div class="res-line"><span>${safeText(key)}</span><strong>${safeText(data.colisage[key])}</strong></div>`).join('');
  const ligneSupHtml = data.ligneSup ? `<div class="res-line"><span>+ ${safeText(data.ligneSup.label)}</span><span>${safeText(data.ligneSup.montant)} € HT</span></div>` : '';
  const prestationsHtml = Array.isArray(data.prestationsComplementaires) && data.prestationsComplementaires.length ? data.prestationsComplementaires.map((p) => `<div class="res-line"><span>+ ${safeText(p.libelle)}</span><span>${safeText(p.montant)} € HT</span></div>`).join('') : '';
  const remiseHtml = data.remiseLabel ? `<p class="warning-note">${safeText(data.remiseLabel)} — remise : ${safeText(data.remiseMontant)} € HT</p>` : '';
  const detailHtml = data.prixDetaille ? data.lignesDetaillees.map((l) => `<div class="res-line"><span>${safeText(l.libelle)}</span><span>${safeText(l.montantHT)} € HT</span></div>`).join('') : `<div class="res-line"><span>${t('prestation_principale')} (${safeText(data.surface)} m²)</span><span>${safeText(data.baseApresRemiseHT)} € HT</span></div>`;
  const photoHtml = data.photo ? `<div class="res-section"><h3>Photo chantier</h3><img src="${data.photo}" class="modal-photo" alt="Photo chantier"></div>` : '';
  openModal(`<h1>${safeText(t('devis_colisage_prets')).replaceAll('\n', '<br>')}</h1><p class="modal-subtitle">${safeText(data.metier)} · ${safeText(data.client)} · ${safeText(data.date)}</p><div class="res-section"><h3>${safeText(t('lignes_devis_client'))}</h3>${remiseHtml}<div class="res-line"><span>${safeText(t('base_avant_remise'))}</span><span>${safeText(data.baseBruteHT)} € HT</span></div>${detailHtml}${prestationsHtml}${ligneSupHtml}<div class="res-line total-ht"><span>${safeText(t('total_ht'))}</span><span>${safeText(data.totalHT)} €</span></div><div class="res-line"><span>${safeText(t('tva'))} (${safeText(data.tvaLabel)})</span><span>${safeText(data.montantTva)} €</span></div><div class="total-devis"><span>${safeText(t('total_ttc'))}</span><span>${safeText(data.totalTTC)} €</span></div></div><div class="res-section"><h3>${safeText(t('logistique_colisage'))}</h3>${colisageHtml}</div>${photoHtml}<div class="modal-actions"><button class="btn-block" onclick="genererPDFClient()">${safeText(t('btn_devis'))}</button><button class="btn-secondary" onclick="genererFicheColisage()">${safeText(t('btn_colisage'))}</button><button class="btn-secondary" onclick="preparerEmailDevis()">${safeText(t('btn_email'))}</button><button class="btn-secondary ghost" onclick="closeModal()">${safeText(t('fermer'))}</button></div>`);
}
function openModal(content) { document.getElementById('modal-body-content').innerHTML = content; document.getElementById('result-modal').style.display = 'block'; }
function closeModal() { document.getElementById('result-modal').style.display = 'none'; }
function sauvegarderChantier(chantier) { if (!db) return; const tx = db.transaction([STORE_NAME], 'readwrite'); tx.objectStore(STORE_NAME).add(chantier); tx.oncomplete = chargerHistorique; }

function chantierArg(item) { return JSON.stringify(item).replaceAll("'", '&apos;'); }
function chargerHistorique() {
  if (!db) return; const container = document.getElementById('historique-liste'); if (!container) return;
  const req = db.transaction([STORE_NAME], 'readonly').objectStore(STORE_NAME).getAll();
  req.onsuccess = () => { const list = req.result || []; if (!list.length) { container.innerHTML = currentLang() === 'tr' ? 'Henüz kayıtlı şantiye yok.' : 'Aucun chantier en mémoire.'; return; }
    container.innerHTML = list.reverse().map((item) => {
      const statut = item.statut || 'en_attente';
      const id = item.id;
      return `<div class="hist-card"><div class="hist-header"><span>${safeText(item.metier)} - ${safeText(item.surface)} m²</span><strong>${safeText(item.totalTTC)} € TTC</strong></div><div class="hist-status-row"><span class="status-badge ${statutClass(statut)}">${safeText(libelleStatut(statut))}</span><select class="status-select" onchange="updateStatutChantier('${safeText(id)}', this.value)"><option value="envoye" ${statut === 'envoye' ? 'selected' : ''}>Devis envoyé</option><option value="en_attente" ${statut === 'en_attente' ? 'selected' : ''}>Réponse en attente</option><option value="accepte" ${statut === 'accepte' ? 'selected' : ''}>Accepté</option><option value="termine" ${statut === 'termine' ? 'selected' : ''}>Terminé</option></select></div><div class="hist-details"><strong>${safeText(item.client || '')}</strong><br>${safeText(item.adresse || '')}${item.dateSouhaitee ? `<br>Date souhaitée : ${safeText(formatDateFr(item.dateSouhaitee))}` : ''}<br>${safeText(item.details)}<br>HT : ${safeText(item.totalHT)} € · TVA : ${safeText(item.tvaLabel)} · ${safeText(item.date)}</div><div class="hist-actions"><button type="button" class="btn-mini" onclick='genererPDFClient(${chantierArg(item)})'>Devis client</button><button type="button" class="btn-mini ghost" onclick='genererFicheColisage(${chantierArg(item)})'>Fiche colisage</button><button type="button" class="btn-mini" onclick='preparerEmailDevis(${chantierArg(item)})'>Email</button></div></div>`;
    }).join(''); };
}function libelleTypeChantier(value) {
  const map = { sol_int: 'Sol intérieur', mur_int: 'Mur faïence / douche', sol_ext: 'Terrasse extérieure' };
  return map[value] || value || 'Non renseigné';
}
function libelleFormatCarreau(value) {
  const map = { rect: 'Rectangulaire 30 x 60' };
  return map[value] || (value ? value.replace('x', ' x ') : 'Non renseigné');
}
function getPrestationTitle(chantier) {
  if (!chantier) return 'Prestation';
  if (chantier.metier === 'Carreleur') return 'Pose de carrelage';
  if (chantier.metier === 'Plaquiste') return 'Pose de plaques de plâtre';
  return chantier.metier || 'Prestation';
}

function getFicheChantierTitle(chantier) {
  if (!chantier) return 'Fiche chantier';
  if (chantier.metier === 'Carreleur') return 'Prestation de carrelage';
  if (chantier.metier === 'Plaquiste') return 'Prestation de plaquisterie';
  return chantier.metier || 'Prestation';
}

function detailsPrestationHtml(chantier, options = {}) {
  const showSurface = options.showSurface !== false;
  if (chantier.metier === 'Carreleur') {
    return `${showSurface ? `<p><strong>Surface totale :</strong> ${safeText(chantier.surface || 'Non renseignée')} m²</p>` : ''}<p><strong>Type de chantier :</strong> ${safeText(libelleTypeChantier(chantier.typeChantier || ''))}</p><p><strong>Format du carreau :</strong> ${safeText(libelleFormatCarreau(chantier.format || ''))}</p>`;
  }
  if (chantier.metier === 'Plaquiste') {
    return `${showSurface ? `<p><strong>Surface totale :</strong> ${safeText(chantier.surface || 'Non renseignée')} m²</p>` : ''}<p><strong>Type de structure :</strong> ${safeText(chantier.typePlacoLabel || chantier.details || 'Non renseigné')}</p>`;
  }
  return `${showSurface ? `<p><strong>Surface totale :</strong> ${safeText(chantier.surface || 'Non renseignée')} m²</p>` : ''}<p>${safeText(chantier.details || '')}</p>`;
}

function ouvrirDocumentImpression({ titre, contenu, styleSupplementaire = '', chantier = null, emailBouton = false }) {
  const win = window.open('', '_blank', 'noopener=no,noreferrer=no');
  if (!win) { alert('La fenêtre d’impression a été bloquée par le navigateur. Autorise les pop-ups pour BATIPIK.'); return; }
  const chantierJson = chantier ? JSON.stringify(chantier).replace(/</g, '\\u003c') : 'null';
  const emailButton = emailBouton ? `<button class="doc-btn secondary" onclick='window.opener && window.opener.preparerEmailDevis(${chantierJson})'>Envoyer par mail</button>` : '';
  win.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${safeText(titre)}</title><style>body{font-family:Arial,sans-serif;margin:34px;color:#17201b}.head{display:flex;justify-content:space-between;gap:18px;border-bottom:4px solid #d7a93d;padding-bottom:16px}.artisan-head{display:flex;align-items:center;gap:14px}.pdf-logo{max-width:86px;max-height:64px;object-fit:contain;border:1px solid #ddd;border-radius:6px;padding:4px;background:#fff}.brand{font-size:28px;font-weight:900;color:#0d3565}.box{background:#f4f4f0;padding:14px;border-radius:8px;margin:18px 0}h1{font-size:22px;text-transform:uppercase}h2{margin-top:22px;font-size:16px;text-transform:uppercase;color:#0d3565}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border-bottom:1px solid #ddd;padding:9px;text-align:left}.total{font-size:20px;font-weight:bold;color:#0d3565}.note{font-size:12px;color:#555;margin-top:30px}.muted{color:#555;font-size:13px}.signature{display:flex;justify-content:space-between;gap:30px;margin-top:42px}.signature div{flex:1;border-top:1px solid #aaa;padding-top:10px;font-size:12px;color:#555}.chantier-photo{max-width:100%;max-height:260px;border-radius:8px;border:1px solid #ddd;margin-top:10px}.doc-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.doc-btn{border:0;border-radius:8px;padding:12px 16px;font-weight:800;cursor:pointer;background:#d7a93d;color:#17201b}.doc-btn.secondary{background:#0d3565;color:#fff}.doc-btn.light{background:#f4f4f0;color:#17201b;border:1px solid #d7a93d}${styleSupplementaire}@media print{.doc-actions{display:none}.head{break-inside:avoid}}</style></head><body>${contenu}<div class="doc-actions"><button class="doc-btn" onclick="window.print()">Imprimer / enregistrer en PDF</button>${emailButton}<button class="doc-btn light" onclick="if(window.opener){window.opener.focus(); window.close();} else { window.location.href='app.html'; }">Retour à BATIPIK</button></div></body></html>`);
  win.document.close();
}

function lignesDevisHtml(chantier) {
  const lignes = chantier.prixDetaille && chantier.lignesDetaillees?.length
    ? chantier.lignesDetaillees.map((l) => `<tr><td>${safeText(l.libelle)}</td><td>${safeText(l.montantHT)} € HT</td></tr>`).join('')
    : `<tr><td>Pose et fourniture principale (${safeText(chantier.surface)} m²)</td><td>${safeText(chantier.baseApresRemiseHT)} € HT</td></tr>`;
  const prestations = Array.isArray(chantier.prestationsComplementaires) ? chantier.prestationsComplementaires.map((p) => `<tr><td>${safeText(p.libelle)}</td><td>${safeText(p.montant)} € HT</td></tr>`).join('') : '';
  const ligneSup = chantier.ligneSup ? `<tr><td>${safeText(chantier.ligneSup.label)}</td><td>${safeText(chantier.ligneSup.montant)} € HT</td></tr>` : '';
  return lignes + prestations + ligneSup;
}
function genererPDFClient(data = null) {
  const chantier = data || dernierChantier; if (!chantier) return; const s = getSettings();
  const remise = Number(chantier.remiseMontant || 0) > 0 ? `<p class="muted">Remise commerciale incluse : ${safeText(chantier.remiseMontant)} € HT.</p>` : '';
  ouvrirDocumentImpression({ titre: `Devis BATIPIK ${chantier.numeroDevis || ''}`, contenu: `${enteteArtisanHtml(s, `<strong>DEVIS N° ${safeText(chantier.numeroDevis || '—')}</strong><br>${safeText(chantier.date)}`)}<div class="box"><h1>Devis client</h1><p><strong>Client :</strong> ${safeText(chantier.client)}</p><p><strong>Email :</strong> ${safeText(chantier.email || 'Non renseigné')}</p><p><strong>Téléphone :</strong> ${safeText(chantier.telephone || 'Non renseigné')}</p><p><strong>Adresse chantier :</strong> ${safeText(chantier.adresse || 'Non renseignée')}</p>${chantier.dateSouhaitee ? `<p><strong>Date souhaitée chantier :</strong> ${safeText(formatDateFr(chantier.dateSouhaitee))}</p>` : ''}</div><div class="box"><h2>Prestation</h2><p><strong>${safeText(getPrestationTitle(chantier))}</strong></p>${detailsPrestationHtml(chantier)}${remise}</div><h2>Lignes du devis</h2><table>${lignesDevisHtml(chantier)}<tr><td>Total HT</td><td>${safeText(chantier.totalHT)} €</td></tr><tr><td>TVA (${safeText(chantier.tvaLabel)})</td><td>${safeText(chantier.montantTva)} €</td></tr><tr class="total"><td>Total TTC</td><td>${safeText(chantier.totalTTC)} €</td></tr></table><p class="note">Document généré par BATIPIK. Devis valable 30 jours à compter de sa date d’émission. Les quantités et prestations sont établies à partir des informations saisies par l’utilisateur. La validation finale du devis et du taux de TVA relève de la responsabilité de l’artisan. En cas de doute fiscal ou réglementaire, consulter un expert-comptable. Le colisage matériaux fait l’objet d’une fiche chantier interne séparée.</p><div class="signature"><div>Bon pour accord client</div><div>Signature artisan</div></div>` , chantier, emailBouton: true });
}
function genererFicheColisage(data = null) {
  const chantier = data || dernierChantier; if (!chantier) return; const s = getSettings();
  const colisageRows = Object.entries(chantier.colisage || {}).map(([k, v]) => `<tr><td>${safeText(k)}</td><td><strong>${safeText(v)}</strong></td></tr>`).join('');
  const photo = chantier.photo ? `<h2>Photo chantier</h2><img src="${chantier.photo}" class="chantier-photo" alt="Photo chantier">` : '';
  ouvrirDocumentImpression({ titre: 'Fiche colisage BATIPIK', styleSupplementaire: '.badge{display:inline-block;background:#d7a93d;color:#17201b;font-weight:bold;border-radius:999px;padding:6px 10px;margin-top:6px}.internal{background:#173d2f;color:white;padding:12px;border-radius:8px;margin:18px 0}.prep td:first-child{width:70%}.manual-zone{border:1px dashed #aaa;border-radius:8px;padding:12px;margin:12px 0 18px;color:#555}.manual-line{height:28px;border-bottom:1px solid #ddd;margin-top:8px}', contenu: `${enteteArtisanHtml(s, `<strong>Fiche chantier interne</strong><br>Devis N° ${safeText(chantier.numeroDevis || '—')}<br>${safeText(chantier.date)}<br><span class="badge">Colisage</span>`)}<div class="internal"><h1>${safeText(getFicheChantierTitle(chantier))} - ${safeText(chantier.client)}</h1><p><strong>Adresse :</strong> ${safeText(chantier.adresse || 'Non renseignée')}</p>${chantier.dateSouhaitee ? `<p><strong>Date souhaitée chantier :</strong> ${safeText(formatDateFr(chantier.dateSouhaitee))}</p>` : ''}<p><strong>Email :</strong> ${safeText(chantier.email || 'Non renseigné')} · <strong>Téléphone :</strong> ${safeText(chantier.telephone || 'Non renseigné')}</p>${detailsPrestationHtml(chantier)}</div><h2>Matériaux à prévoir / commander</h2><table class="prep"><tr><th>Article</th><th>Quantité</th></tr>${colisageRows}</table>${photo}<h2>Informations à compléter sur chantier</h2><div class="manual-zone"><strong>Fournisseur / couleur / référence produit / contraintes :</strong><div class="manual-line"></div><div class="manual-line"></div><div class="manual-line"></div></div><h2>Notes chantier</h2><table><tr><td style="height:80px;vertical-align:top">Observations, accès, contraintes, support, découpes particulières...</td></tr></table><p class="note">Document interne destiné à l’artisan, au chef d’équipe, à l’apprenti ou au fournisseur. Quantités indicatives à ajuster selon relevé réel, état du support, calepinage, découpes, pertes et conditionnements disponibles.</p>` , chantier, emailBouton: true });
}


function preparerEmailDevis(data = null) {
  const chantier = data || dernierChantier;
  if (!chantier) return;
  const to = chantier.email || '';
  const sujet = `Devis ${chantier.numeroDevis || ''} - ${chantier.client || 'chantier'} - BATIPIK`;
  const corps = [
    `Bonjour,`,
    ``,
    `Veuillez trouver ci-joint le devis N° ${chantier.numeroDevis || '—'} concernant votre chantier${chantier.adresse ? ' situé au ' + chantier.adresse : ''}.`,
    ``,
    chantier.dateSouhaitee ? `Date souhaitée chantier : ${formatDateFr(chantier.dateSouhaitee)}` : '',
    `Montant total TTC : ${chantier.totalTTC} €`,
    ``,
    `Le devis PDF est à joindre à cet email après l'avoir généré avec BATIPIK.`,
    ``,
    `Cordialement.`
  ].join('\n');
  const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
  window.location.href = url;
}

function csvEscape(value) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }
function exporterCSV() { if (!db) return; const req = db.transaction([STORE_NAME], 'readonly').objectStore(STORE_NAME).getAll(); req.onsuccess = () => { const rows = [['Date','N Devis','Statut','Date souhaitée chantier','Client','Email','Telephone','Adresse','Metier','Surface(m2)','Prix detaille','Total HT(EUR)','TVA','Montant TVA(EUR)','Total TTC(EUR)','Details']]; (req.result || []).forEach((i) => rows.push([i.date,i.numeroDevis || '',libelleStatut(i.statut),formatDateFr(i.dateSouhaitee),i.client,i.email || '',i.telephone || '',i.adresse,i.metier,i.surface,i.prixDetaille ? 'Oui' : 'Non',i.totalHT,i.tvaLabel,i.montantTva,i.totalTTC,i.details])); const blob = new Blob(['\uFEFF' + rows.map((r) => r.map(csvEscape).join(';')).join('\n')], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'BATIPIK_Chantiers.csv'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); }; }
function viderHistorique() { if (!db || !confirm('Vider tout l’historique local ?')) return; const tx = db.transaction([STORE_NAME], 'readwrite'); tx.objectStore(STORE_NAME).clear(); tx.oncomplete = chargerHistorique; }
window.addEventListener('click', (event) => { if (event.target === document.getElementById('result-modal')) closeModal(); });
