import { useState } from 'react';
import buretteData from '../data/catalog/burette.json';
import becherData from '../data/catalog/becher.json';
import erlenmeyerData from '../data/catalog/erlenmeyer.json';
import fioleData from '../data/catalog/fiole-jaugee.json';
import pipetteData from '../data/catalog/pipette-jaugee.json';
import statifData from '../data/catalog/statif.json';
import { renderEquipmentSVG } from '../components/svg';

interface EquipmentDetails {
  nom: string;
  categorie: string;
  schema: string;
  role: string;
  precision: string;
  utilisation: string[];
  erreurs_frequentes: string[];
  securite: string[];
  niveaux: string[];
  utilise_dans: string[];
}

const ITEMS: { id: string; mark: string; data: EquipmentDetails }[] = [
  { id: 'burette', mark: 'B', data: buretteData },
  { id: 'becher', mark: 'Bé', data: becherData },
  { id: 'erlenmeyer', mark: 'E', data: erlenmeyerData },
  { id: 'fiole', mark: 'F', data: fioleData },
  { id: 'pipette', mark: 'P', data: pipetteData },
  { id: 'statif', mark: 'S', data: statifData },
];

export default function CatalogView() {
  const [selectedId, setSelectedId] = useState('burette');
  const activeItem = ITEMS.find(item => item.id === selectedId) ?? ITEMS[0];
  const { data } = activeItem;
  const drawing = renderEquipmentSVG(data.schema, { width: 250, height: 300, showBurette: true });

  return (
    <div className="catalog-page page-in">
      <header className="catalog-heading">
        <p className="catalog-kicker">LE MATÉRIEL DE TP, EN CLAIR</p>
        <div className="catalog-title-line">
          <div><h1>Le catalogue</h1><p>Reconnaître, choisir et utiliser la verrerie avant de commencer l’expérience.</p></div>
          <span className="catalog-count">{String(ITEMS.length).padStart(2, '0')} OBJETS</span>
        </div>
      </header>

      <div className="catalog-layout">
        <nav className="equipment-list" aria-label="Choisir un équipement">
          <p className="catalog-list-label">VERRERIE & ÉQUIPEMENTS</p>
          {ITEMS.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={`equipment-choice ${selectedId === item.id ? 'is-selected' : ''}`}
              onClick={() => setSelectedId(item.id)}
              aria-pressed={selectedId === item.id}
            >
              <span className="equipment-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="equipment-mark" aria-hidden="true">{item.mark}</span>
              <span className="equipment-choice-copy"><strong>{item.data.nom}</strong><small>{item.data.role}</small></span>
              <span className="equipment-chevron" aria-hidden="true">↗</span>
            </button>
          ))}
          <div className="catalog-aside-note"><span>À RETENIR</span><p>Une verrerie jaugée mesure précisément. Un bécher ou un Erlenmeyer sert surtout à contenir et mélanger.</p></div>
        </nav>

        <article className="equipment-detail" key={activeItem.id}>
          <div className="equipment-detail-heading">
            <div><p className="equipment-category">{data.categorie.replace(/-/g, ' ')}</p><h2>{data.nom}</h2></div>
            <span className="equipment-detail-index">{String(ITEMS.findIndex(item => item.id === selectedId) + 1).padStart(2, '0')} / {String(ITEMS.length).padStart(2, '0')}</span>
          </div>

          <div className="equipment-detail-grid">
            <div className="equipment-visual">
              <div className="visual-label"><span>FIG. {String(ITEMS.findIndex(item => item.id === selectedId) + 1).padStart(2, '0')}</span><span>ILLUSTRATION SCHÉMATIQUE</span></div>
              <div className="equipment-svg-wrap" dangerouslySetInnerHTML={{ __html: drawing }} />
              <div className="visual-caption"><span>{data.nom}</span><span>{data.utilise_dans.length ? `Utilisé pour ${data.utilise_dans.join(', ')}` : 'Matériel de laboratoire'}</span></div>
            </div>

            <div className="equipment-notes">
              <section className="equipment-purpose"><span className="note-label">À QUOI SERT-IL ?</span><p>{data.role}</p></section>
              <section className="equipment-precision"><span className="note-label">PRÉCISION</span><p>{data.precision}</p></section>
              <section className="equipment-use"><h3>Le bon geste</h3><ol>{data.utilisation.map((tip, index) => <li key={tip}><span>{String(index + 1).padStart(2, '0')}</span><p>{tip}</p></li>)}</ol></section>
              {data.erreurs_frequentes.length > 0 && <section className="equipment-errors"><h3>À éviter</h3><ul>{data.erreurs_frequentes.map(error => <li key={error}>{error}</li>)}</ul></section>}
              {data.securite.length > 0 && <section className="equipment-safety"><h3>Sécurité</h3><p>{data.securite.join(' ')}</p></section>}
              <div className="equipment-levels"><span>NIVEAUX</span><p>{data.niveaux.join(' · ')}</p></div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
