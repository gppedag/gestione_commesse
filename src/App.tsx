import React, { useState, useEffect } from 'react';
import { Plus, Upload, Download, FileText, Trash2, Edit2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';

const GestioneCommesse = () => {
  const [activeTab, setActiveTab] = useState('commesse');
  const [commesse, setCommesse] = useState([]);
  const [righeVendita, setRigheVendita] = useState([]);
  const [costi, setCosti] = useState([]);
  const [evasioni, setEvasioni] = useState([]);
  const [editingCommessa, setEditingCommessa] = useState(null);
  const [editingRiga, setEditingRiga] = useState(null);
  const [editingCosto, setEditingCosto] = useState(null);
  const [showAddCommessa, setShowAddCommessa] = useState(false);
  const [showAddRiga, setShowAddRiga] = useState(false);
  const [showAddCosto, setShowAddCosto] = useState(false);
  const [showAddEvasione, setShowAddEvasione] = useState(false);
  const [editingEvasione, setEditingEvasione] = useState(null);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [showAddOrdine, setShowAddOrdine] = useState(false);
  const [ordini, setOrdini] = useState([]);
  const [selectedOrdineId, setSelectedOrdineId] = useState(null);
  const [selectedCommessaId, setSelectedCommessaId] = useState(null);
  const [selectedRigaId, setSelectedRigaId] = useState(null);
  const [expandedCommesse, setExpandedCommesse] = useState(new Set());
  const [codiciServizio, setCodiciServizio] = useState({
    interno: ['Progettazione', 'Sviluppo Software', 'Testing', 'Consulenza', 'Formazione'],
    esterno: ['Hardware', 'Licenze Software', 'Servizi Cloud', 'Manutenzione', 'Supporto Tecnico']
  });
  const [showManageCodici, setShowManageCodici] = useState(false);

  // Carica dati dal localStorage
  useEffect(() => {
    const savedCommesse = localStorage.getItem('commesse');
    const savedRigheVendita = localStorage.getItem('righeVendita');
    const savedCosti = localStorage.getItem('costi');
    const savedEvasioni = localStorage.getItem('evasioni');
    const savedCodiciServizio = localStorage.getItem('codiciServizio');
    const savedOrdini = localStorage.getItem('ordini');
    
    if (savedCommesse) setCommesse(JSON.parse(savedCommesse));
    if (savedRigheVendita) setRigheVendita(JSON.parse(savedRigheVendita));
    if (savedCosti) setCosti(JSON.parse(savedCosti));
    if (savedEvasioni) setEvasioni(JSON.parse(savedEvasioni));
    if (savedCodiciServizio) setCodiciServizio(JSON.parse(savedCodiciServizio));
    if (savedOrdini) setOrdini(JSON.parse(savedOrdini));
  }, []);

  // Salva dati nel localStorage
  useEffect(() => {
    localStorage.setItem('commesse', JSON.stringify(commesse));
  }, [commesse]);

  useEffect(() => {
    localStorage.setItem('righeVendita', JSON.stringify(righeVendita));
  }, [righeVendita]);

  useEffect(() => {
    localStorage.setItem('costi', JSON.stringify(costi));
  }, [costi]);

  useEffect(() => {
    localStorage.setItem('evasioni', JSON.stringify(evasioni));
  }, [evasioni]);

  useEffect(() => {
    localStorage.setItem('codiciServizio', JSON.stringify(codiciServizio));
  }, [codiciServizio]);

  useEffect(() => {
    localStorage.setItem('ordini', JSON.stringify(ordini));
  }, [ordini]);

  // Funzioni per commesse
  const addCommessa = (nuovaCommessa) => {
    const id = Date.now().toString();
    const commessa = {
      ...nuovaCommessa,
      id
    };
    setCommesse([...commesse, commessa]);
    setShowAddCommessa(false);
  };

  const updateCommessa = (id, updates) => {
    setCommesse(commesse.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingCommessa(null);
  };

  const deleteCommessa = (id) => {
    setCommesse(commesse.filter(c => c.id !== id));
    setRigheVendita(righeVendita.filter(r => r.commessaId !== id));
    setCosti(costi.filter(c => c.commessaId !== id));
  };

  // Funzioni per righe vendita
  const addRigaVendita = (nuovaRiga) => {
    const id = Date.now().toString();
    const riga = {
      ...nuovaRiga,
      id,
      totale: nuovaRiga.quantita * nuovaRiga.prezzoUnitario
    };
    setRigheVendita([...righeVendita, riga]);
    setShowAddRiga(false);
  };

  const updateRigaVendita = (id, updates) => {
    setRigheVendita(righeVendita.map(r => 
      r.id === id 
        ? { ...r, ...updates, totale: updates.quantita * updates.prezzoUnitario }
        : r
    ));
    setEditingRiga(null);
  };

  const deleteRigaVendita = (id) => {
    setRigheVendita(righeVendita.filter(r => r.id !== id));
    setCosti(costi.filter(c => c.rigaVenditaId !== id));
  };

  // Funzioni per costi
  const addCosto = (nuovoCosto) => {
    const id = Date.now().toString();
    const costo = {
      ...nuovoCosto,
      id,
      totale: nuovoCosto.quantita * nuovoCosto.costoUnitario
    };
    setCosti([...costi, costo]);
    setShowAddCosto(false);
  };

  const updateCosto = (id, updates) => {
    setCosti(costi.map(c => 
      c.id === id 
        ? { ...c, ...updates, totale: updates.quantita * updates.costoUnitario }
        : c
    ));
    setEditingCosto(null);
  };

  const deleteCosto = (id) => {
    setCosti(costi.filter(c => c.id !== id));
  };

  // Funzioni di import CSV
  const importCSV = (csvData, tipoDati) => {
    try {
      const righe = csvData.split('\n').filter(riga => riga.trim());
      if (righe.length < 2) {
        alert('Il file CSV deve contenere almeno un header e una riga di dati');
        return;
      }

      const headers = righe[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const dati = righe.slice(1).map(riga => {
        const valori = riga.split(',').map(v => v.trim().replace(/"/g, ''));
        const oggetto = {};
        headers.forEach((header, index) => {
          oggetto[header] = valori[index] || '';
        });
        return oggetto;
      });

      if (tipoDati === 'commesse') {
        importCommesseCSV(dati);
      } else if (tipoDati === 'righe') {
        importRigheCSV(dati);
      }
    } catch (error) {
      alert('Errore nell\'elaborazione del file CSV: ' + error.message);
    }
  };

  const importCommesseCSV = (datiCSV) => {
    const nuoveCommesse = [];
    const nuoveRighe = [];
    let errori = [];

    datiCSV.forEach((riga, index) => {
      try {
        // Verifica campi obbligatori per commesse
        if (!riga.codiceCliente || !riga.descrizioneCommessa) {
          errori.push(`Riga ${index + 2}: codiceCliente e descrizioneCommessa sono obbligatori`);
          return;
        }

        // Cerca se la commessa esiste già
        let commessa = nuoveCommesse.find(c => c.codiceCliente === riga.codiceCliente && c.descrizione === riga.descrizioneCommessa);
        
        if (!commessa) {
          // Crea nuova commessa
          const commessaId = Date.now().toString() + '_' + index;
          commessa = {
            id: commessaId,
            codiceCliente: riga.codiceCliente,
            descrizione: riga.descrizioneCommessa,
            dataCommessa: riga.dataCommessa || new Date().toISOString().split('T')[0]
          };
          nuoveCommesse.push(commessa);
        }

        // Se ci sono dati per le righe vendita, creale
        if (riga.codiceArticolo && riga.descrizioneArticolo) {
          const rigaId = Date.now().toString() + '_' + index + '_riga';
          const nuovaRiga = {
            id: rigaId,
            commessaId: commessa.id,
            codiceArticolo: riga.codiceArticolo,
            descrizione: riga.descrizioneArticolo,
            quantita: parseFloat(riga.quantita) || 0,
            prezzoUnitario: parseFloat(riga.prezzoUnitario) || 0,
            totale: (parseFloat(riga.quantita) || 0) * (parseFloat(riga.prezzoUnitario) || 0)
          };
          nuoveRighe.push(nuovaRiga);
        }
      } catch (error) {
        errori.push(`Riga ${index + 2}: ${error.message}`);
      }
    });

    if (errori.length > 0) {
      alert('Errori durante l\'importazione:\n' + errori.join('\n'));
      return;
    }

    // Aggiorna lo stato
    setCommesse([...commesse, ...nuoveCommesse]);
    setRigheVendita([...righeVendita, ...nuoveRighe]);
    
    alert(`Import completato!\nCommesse importate: ${nuoveCommesse.length}\nRighe vendita importate: ${nuoveRighe.length}`);
  };

  const importRigheCSV = (datiCSV) => {
    const nuoveRighe = [];
    let errori = [];

    datiCSV.forEach((riga, index) => {
      try {
        // Trova la commessa esistente
        const commessa = commesse.find(c => 
          c.codiceCliente === riga.codiceCliente || 
          c.id === riga.commessaId
        );

        if (!commessa) {
          errori.push(`Riga ${index + 2}: Commessa non trovata (codiceCliente: ${riga.codiceCliente})`);
          return;
        }

        if (!riga.codiceArticolo || !riga.descrizioneArticolo) {
          errori.push(`Riga ${index + 2}: codiceArticolo e descrizioneArticolo sono obbligatori`);
          return;
        }

        const rigaId = Date.now().toString() + '_' + index + '_riga';
        const nuovaRiga = {
          id: rigaId,
          commessaId: commessa.id,
          codiceArticolo: riga.codiceArticolo,
          descrizione: riga.descrizioneArticolo,
          quantita: parseFloat(riga.quantita) || 0,
          prezzoUnitario: parseFloat(riga.prezzoUnitario) || 0,
          totale: (parseFloat(riga.quantita) || 0) * (parseFloat(riga.prezzoUnitario) || 0)
        };
        nuoveRighe.push(nuovaRiga);
      } catch (error) {
        errori.push(`Riga ${index + 2}: ${error.message}`);
      }
    });

    if (errori.length > 0) {
      alert('Errori durante l\'importazione:\n' + errori.join('\n'));
      return;
    }

    setRigheVendita([...righeVendita, ...nuoveRighe]);
    alert(`Import completato! Righe vendita importate: ${nuoveRighe.length}`);
  };
  const addEvasione = (nuovaEvasione) => {
    const id = Date.now().toString();
    const evasione = {
      ...nuovaEvasione,
      id,
      dataEvasione: new Date().toISOString().split('T')[0]
    };
    setEvasioni([...evasioni, evasione]);
    setShowAddEvasione(false);
  };

  const updateEvasione = (id, updates) => {
    setEvasioni(evasioni.map(e => e.id === id ? { ...e, ...updates } : e));
    setEditingEvasione(null);
  };

  const deleteEvasione = (id) => {
    setEvasioni(evasioni.filter(e => e.id !== id));
  };

  // Calcola totali e marginalità
  const getTotaleCommessa = (commessaId) => {
    const righe = righeVendita.filter(r => r.commessaId === commessaId);
    return righe.reduce((sum, r) => sum + r.totale, 0);
  };

  const getTotaleCostiRiga = (rigaId) => {
    const costiRiga = costi.filter(c => c.rigaVenditaId === rigaId);
    return costiRiga.reduce((sum, c) => sum + c.totale, 0);
  };

  const getMarginalitaRiga = (rigaId) => {
    const riga = righeVendita.find(r => r.id === rigaId);
    const totaleCosti = getTotaleCostiRiga(rigaId);
    return riga ? riga.totale - totaleCosti : 0;
  };

  const getMarginalitaPercentualeRiga = (rigaId) => {
    const riga = righeVendita.find(r => r.id === rigaId);
    const marginalita = getMarginalitaRiga(rigaId);
    return riga && riga.totale > 0 ? (marginalita / riga.totale) * 100 : 0;
  };

  const getQuantitaAssegnata = (rigaId) => {
    const costiRiga = costi.filter(c => c.rigaVenditaId === rigaId);
    return costiRiga.reduce((sum, c) => sum + c.quantita, 0);
  };

  const getQuantitaEvasa = (rigaId) => {
    const evasioniRiga = evasioni.filter(e => e.rigaVenditaId === rigaId);
    return evasioniRiga.reduce((sum, e) => sum + e.quantitaEvasa, 0);
  };

  const getQuantitaDaEvadere = (rigaId) => {
    const riga = righeVendita.find(r => r.id === rigaId);
    const quantitaEvasa = getQuantitaEvasa(rigaId);
    return riga ? riga.quantita - quantitaEvasa : 0;
  };

  const getQuantitaEvasaCosto = (costoId) => {
    const evasioniCosto = evasioni.filter(e => e.costoId === costoId);
    return evasioniCosto.reduce((sum, e) => sum + e.quantitaEvasa, 0);
  };

  const getResiduoCosto = (costoId) => {
    const costo = costi.find(c => c.id === costoId);
    const quantitaEvasa = getQuantitaEvasaCosto(costoId);
    return costo ? costo.quantita - quantitaEvasa : 0;
  };

  const toggleExpanded = (commessaId) => {
    const newExpanded = new Set(expandedCommesse);
    if (newExpanded.has(commessaId)) {
      newExpanded.delete(commessaId);
    } else {
      newExpanded.add(commessaId);
    }
    setExpandedCommesse(newExpanded);
  };

  // Componente Import CSV
  const ImportCSVModal = ({ onClose }) => {
    const [tipoImport, setTipoImport] = useState('commesse');
    const [csvData, setCsvData] = useState('');
    const [esempiVisibili, setEsempiVisibili] = useState(false);

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target.result);
      };
      reader.readAsText(file);
      event.target.value = '';
    };

    const handleImport = () => {
      if (!csvData.trim()) {
        alert('Seleziona un file CSV o incolla i dati');
        return;
      }
      importCSV(csvData, tipoImport);
      onClose();
    };

    const esempioCommesse = `codiceCliente,descrizioneCommessa,dataCommessa,codiceArticolo,descrizioneArticolo,quantita,prezzoUnitario
ACME001,Progetto Software CRM,2025-01-15,SW-CRM-01,Licenza CRM Base,1,5000.00
ACME001,Progetto Software CRM,2025-01-15,SW-CRM-02,Personalizzazione CRM,40,120.00
BETA002,Sistema Gestionale,2025-01-20,SW-ERP-01,Modulo Contabilità,1,8000.00`;

    const esempioRighe = `codiceCliente,codiceArticolo,descrizioneArticolo,quantita,prezzoUnitario
ACME001,SW-CRM-03,Formazione Utenti,16,85.00
BETA002,SW-ERP-02,Modulo Magazzino,1,6500.00`;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-2/3 max-w-4xl max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">Import da CSV</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo di Import</label>
              <select
                value={tipoImport}
                onChange={(e) => setTipoImport(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="commesse">Commesse + Righe Vendita</option>
                <option value="righe">Solo Righe Vendita (per commesse esistenti)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Carica File CSV</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Oppure Incolla Dati CSV</label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="w-full p-2 border rounded h-32 font-mono text-sm"
                placeholder="Incolla qui i dati CSV..."
              />
            </div>

            <div>
              <button
                onClick={() => setEsempiVisibili(!esempiVisibili)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {esempiVisibili ? 'Nascondi' : 'Mostra'} Esempi Formato CSV
              </button>
            </div>

            {esempiVisibili && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Esempio: Commesse + Righe</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {esempioCommesse}
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Esempio: Solo Righe</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {esempioRighe}
                  </pre>
                </div>
                <div className="text-xs text-gray-600">
                  <strong>Note:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>I campi sono separati da virgole</li>
                    <li>La prima riga deve contenere gli header</li>
                    <li>Per "Solo Righe": le commesse devono già esistere</li>
                    <li>Campi obbligatori: codiceCliente, descrizioneCommessa (per commesse)</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button 
                onClick={handleImport} 
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                disabled={!csvData.trim()}
              >
                <Upload className="w-4 h-4 inline mr-1" />
                Importa CSV
              </button>
              <button onClick={onClose} className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                <X className="w-4 h-4 inline mr-1" />
                Annulla
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Form Ordine
  const OrdineForm = ({ ordine, onSave, onCancel }) => {
    const [form, setForm] = useState(ordine || {
      numeroOrdine: '',
      descrizione: '',
      dataConsegna: '',
      note: ''
    });

    const handleSubmit = () => {
      if (form.numeroOrdine && form.descrizione) {
        onSave(form);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-bold mb-4">
            {ordine ? 'Modifica Ordine' : 'Nuovo Ordine'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Numero Ordine</label>
              <input
                type="text"
                value={form.numeroOrdine}
                onChange={(e) => setForm({...form, numeroOrdine: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Es: ORD-2025-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrizione Ordine</label>
              <input
                type="text"
                value={form.descrizione}
                onChange={(e) => setForm({...form, descrizione: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Descrizione dell'ordine..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Consegna Prevista</label>
              <input
                type="date"
                value={form.dataConsegna}
                onChange={(e) => setForm({...form, dataConsegna: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Note (opzionale)</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({...form, note: e.target.value})}
                className="w-full p-2 border rounded h-20 resize-none"
                placeholder="Note aggiuntive sull'ordine..."
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleSubmit} 
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Salva
              </button>
              <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                <X className="w-4 h-4 inline mr-1" />
                Annulla
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Form Evasione (aggiornato)
  const EvasioneForm = ({ evasione, onSave, onCancel }) => {
    const [form, setForm] = useState(evasione || {
      numeroOrdine: '',
      commessaId: selectedCommessaId,
      rigaVenditaId: selectedRigaId,
      quantitaEvasa: 0,
      note: ''
    });

    const handleSubmit = () => {
      if (form.numeroOrdine && form.quantitaEvasa > 0) {
        onSave(form);
      }
    };

    // Calcola quantità disponibile per l'evasione
    const rigaVendita = righeVendita.find(r => r.id === selectedRigaId);
    const quantitaEvasa = getQuantitaEvasa(selectedRigaId);
    const quantitaDisponibile = rigaVendita ? rigaVendita.quantita - quantitaEvasa : 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-bold mb-4">
            {evasione ? 'Modifica Evasione' : 'Nuova Evasione Ordine'}
          </h3>
          <div className="space-y-4">
            <div className="p-2 bg-blue-50 rounded text-sm">
              <strong>Riga: </strong>{rigaVendita?.codiceArticolo} - {rigaVendita?.descrizione}<br/>
              <strong>Quantità totale: </strong>{rigaVendita?.quantita}<br/>
              <strong>Già evasa: </strong>{quantitaEvasa}<br/>
              <strong>Da evadere: </strong>{quantitaDisponibile}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Numero Ordine</label>
              <input
                type="text"
                value={form.numeroOrdine}
                onChange={(e) => setForm({...form, numeroOrdine: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Es: ORD-2025-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantità da Evadere (max: {quantitaDisponibile})
              </label>
              <input
                type="number"
                value={form.quantitaEvasa}
                onChange={(e) => setForm({...form, quantitaEvasa: Math.min(parseFloat(e.target.value) || 0, quantitaDisponibile)})}
                className="w-full p-2 border rounded"
                max={quantitaDisponibile}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Note (opzionale)</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({...form, note: e.target.value})}
                className="w-full p-2 border rounded h-20 resize-none"
                placeholder="Note aggiuntive sull'evasione..."
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleSubmit} 
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                disabled={form.quantitaEvasa > quantitaDisponibile || form.quantitaEvasa <= 0}
              >
                <Save className="w-4 h-4 inline mr-1" />
                Salva
              </button>
              <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                <X className="w-4 h-4 inline mr-1" />
                Annulla
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente per gestire i codici servizio
  const GestioneCodiciServizio = ({ onClose }) => {
    const [tempCodici, setTempCodici] = useState(codiciServizio);
    const [nuovoCodice, setNuovoCodice] = useState({ tipo: 'interno', codice: '' });

    const aggiungiCodice = () => {
      if (nuovoCodice.codice.trim()) {
        setTempCodici(prev => ({
          ...prev,
          [nuovoCodice.tipo]: [...prev[nuovoCodice.tipo], nuovoCodice.codice.trim()]
        }));
        setNuovoCodice({ ...nuovoCodice, codice: '' });
      }
    };

    const rimuoviCodice = (tipo, indice) => {
      setTempCodici(prev => ({
        ...prev,
        [tipo]: prev[tipo].filter((_, i) => i !== indice)
      }));
    };

    const salva = () => {
      setCodiciServizio(tempCodici);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">Gestione Codici Servizio</h3>
          
          {/* Aggiungi nuovo codice */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="text-sm font-medium mb-2">Aggiungi Nuovo Codice</h4>
            <div className="flex gap-2 mb-2">
              <select
                value={nuovoCodice.tipo}
                onChange={(e) => setNuovoCodice({...nuovoCodice, tipo: e.target.value})}
                className="flex-1 p-2 border rounded text-sm"
              >
                <option value="interno">Interno</option>
                <option value="esterno">Esterno</option>
              </select>
              <input
                type="text"
                value={nuovoCodice.codice}
                onChange={(e) => setNuovoCodice({...nuovoCodice, codice: e.target.value})}
                placeholder="Nome servizio"
                className="flex-2 p-2 border rounded text-sm"
                onKeyPress={(e) => e.key === 'Enter' && aggiungiCodice()}
              />
              <button
                onClick={aggiungiCodice}
                className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista codici esistenti */}
          <div className="space-y-4 mb-4">
            {['interno', 'esterno'].map(tipo => (
              <div key={tipo} className="border rounded p-3">
                <h4 className="text-sm font-medium mb-2 capitalize">{tipo}</h4>
                <div className="space-y-1">
                  {tempCodici[tipo].map((codice, indice) => (
                    <div key={indice} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                      <span>{codice}</span>
                      <button
                        onClick={() => rimuoviCodice(tipo, indice)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {tempCodici[tipo].length === 0 && (
                    <p className="text-gray-500 text-xs">Nessun servizio {tipo}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={salva} 
              className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Salva
            </button>
            <button onClick={onClose} className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
              <X className="w-4 h-4 inline mr-1" />
              Annulla
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componente Form Commessa
  const CommessaForm = ({ commessa, onSave, onCancel }) => {
    const [form, setForm] = useState(commessa || {
      codiceCliente: '',
      descrizione: '',
      dataCommessa: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = () => {
      if (form.codiceCliente && form.descrizione) {
        onSave(form);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-bold mb-4">
            {commessa ? 'Modifica Commessa' : 'Nuova Commessa'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Codice Cliente</label>
              <input
                type="text"
                value={form.codiceCliente}
                onChange={(e) => setForm({...form, codiceCliente: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrizione Commessa</label>
              <input
                type="text"
                value={form.descrizione}
                onChange={(e) => setForm({...form, descrizione: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Commessa</label>
              <input
                type="date"
                value={form.dataCommessa}
                onChange={(e) => setForm({...form, dataCommessa: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleSubmit} 
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Salva
              </button>
              <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                <X className="w-4 h-4 inline mr-1" />
                Annulla
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Form Riga Vendita
  const RigaVenditaForm = ({ riga, onSave, onCancel }) => {
    const [form, setForm] = useState(riga || {
      commessaId: selectedCommessaId,
      codiceArticolo: '',
      descrizione: '',
      quantita: 0,
      prezzoUnitario: 0
    });

    const handleSubmit = () => {
      if (form.codiceArticolo && form.descrizione && form.quantita && form.prezzoUnitario) {
        onSave(form);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-bold mb-4">
            {riga ? 'Modifica Riga Vendita' : 'Nuova Riga Vendita'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Codice Articolo</label>
              <input
                type="text"
                value={form.codiceArticolo}
                onChange={(e) => setForm({...form, codiceArticolo: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrizione</label>
              <input
                type="text"
                value={form.descrizione}
                onChange={(e) => setForm({...form, descrizione: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantità</label>
              <input
                type="number"
                value={form.quantita}
                onChange={(e) => setForm({...form, quantita: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prezzo Unitario (€)</label>
              <input
                type="number"
                step="0.01"
                value={form.prezzoUnitario}
                onChange={(e) => setForm({...form, prezzoUnitario: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="p-2 bg-gray-100 rounded">
              <strong>Totale: €{(form.quantita * form.prezzoUnitario).toFixed(2)}</strong>
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleSubmit} 
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Salva
              </button>
              <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                <X className="w-4 h-4 inline mr-1" />
                Annulla
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Form Costo
  const CostoForm = ({ costo, onSave, onCancel }) => {
    const [form, setForm] = useState(costo || {
      commessaId: selectedCommessaId,
      rigaVenditaId: selectedRigaId,
      codiceServizio: '',
      descrizionePersonalizzata: '',
      tipoServizio: 'interno',
      costoUnitario: 0,
      quantita: 0,
      fornitore: ''
    });

    const serviziInterni = codiciServizio.interno || [];
    const serviziEsterni = codiciServizio.esterno || [];

    const handleSubmit = () => {
      if (form.codiceServizio && form.costoUnitario && form.quantita && form.fornitore) {
        onSave(form);
      }
    };

    // Calcola quantità rimanente disponibile
    const rigaVendita = righeVendita.find(r => r.id === selectedRigaId);
    const quantitaAssegnata = getQuantitaAssegnata(selectedRigaId);
    const quantitaDisponibile = rigaVendita ? rigaVendita.quantita - quantitaAssegnata : 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-bold mb-4">
            {costo ? 'Modifica Assegnazione Fornitore' : 'Nuova Assegnazione Fornitore'}
          </h3>
          <div className="space-y-4">
            <div className="p-2 bg-blue-50 rounded text-sm">
              <strong>Riga: </strong>{rigaVendita?.codiceArticolo} - {rigaVendita?.descrizione}<br/>
              <strong>Quantità disponibile: </strong>{quantitaDisponibile}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo Servizio</label>
              <select
                value={form.tipoServizio}
                onChange={(e) => setForm({...form, tipoServizio: e.target.value, codiceServizio: ''})}
                className="w-full p-2 border rounded"
              >
                <option value="interno">Interno</option>
                <option value="esterno">Esterno</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Codice Servizio</label>
              <select
                value={form.codiceServizio}
                onChange={(e) => setForm({...form, codiceServizio: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleziona...</option>
                {(form.tipoServizio === 'interno' ? serviziInterni : serviziEsterni).map(servizio => (
                  <option key={servizio} value={servizio}>{servizio}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrizione Personalizzata</label>
              <input
                type="text"
                value={form.descrizionePersonalizzata}
                onChange={(e) => setForm({...form, descrizionePersonalizzata: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Opzionale - descrizione aggiuntiva"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fornitore</label>
              <input
                type="text"
                value={form.fornitore}
                onChange={(e) => setForm({...form, fornitore: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantità da Assegnare (max: {quantitaDisponibile})
              </label>
              <input
                type="number"
                value={form.quantita}
                onChange={(e) => setForm({...form, quantita: Math.min(parseFloat(e.target.value) || 0, quantitaDisponibile)})}
                className="w-full p-2 border rounded"
                max={quantitaDisponibile}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Costo Unitario (€)</label>
              <input
                type="number"
                step="0.01"
                value={form.costoUnitario}
                onChange={(e) => setForm({...form, costoUnitario: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="p-2 bg-gray-100 rounded">
              <strong>Totale Costo: €{(form.quantita * form.costoUnitario).toFixed(2)}</strong>
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleSubmit} 
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                disabled={form.quantita > quantitaDisponibile}
              >
                <Save className="w-4 h-4 inline mr-1" />
                Salva
              </button>
              <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                <X className="w-4 h-4 inline mr-1" />
                Annulla
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Funzioni per reportistica
  const generateReportCommesse = () => {
    return commesse.map(commessa => {
      const righe = righeVendita.filter(r => r.commessaId === commessa.id);
      const totaleVendita = righe.reduce((sum, r) => sum + r.totale, 0);
      const totaleCosti = righe.reduce((sum, r) => {
        const costiRiga = costi.filter(c => c.rigaVenditaId === r.id);
        return sum + costiRiga.reduce((sumCosti, c) => sumCosti + c.totale, 0);
      }, 0);
      const marginalita = totaleVendita - totaleCosti;
      const marginalitaPerc = totaleVendita > 0 ? (marginalita / totaleVendita * 100) : 0;

      return {
        'Codice Cliente': commessa.codiceCliente,
        'Descrizione Commessa': commessa.descrizione,
        'Data Commessa': commessa.dataCommessa,
        'Numero Righe': righe.length,
        'Totale Vendita': `€${totaleVendita.toFixed(2)}`,
        'Totale Costi': `€${totaleCosti.toFixed(2)}`,
        'Marginalità': `€${marginalita.toFixed(2)}`,
        'Marginalità %': `${marginalitaPerc.toFixed(1)}%`
      };
    });
  };

  const generateReportRigheDettaglio = () => {
    const report = [];
    commesse.forEach(commessa => {
      const righe = righeVendita.filter(r => r.commessaId === commessa.id);
      righe.forEach(riga => {
        const costiRiga = costi.filter(c => c.rigaVenditaId === riga.id);
        const totaleCostiRiga = costiRiga.reduce((sum, c) => sum + c.totale, 0);
        const marginalitaRiga = riga.totale - totaleCostiRiga;
        const marginalitaPerc = riga.totale > 0 ? (marginalitaRiga / riga.totale * 100) : 0;
        const quantitaAssegnata = costiRiga.reduce((sum, c) => sum + c.quantita, 0);
        const quantitaEvasa = getQuantitaEvasa(riga.id);

        report.push({
          'Codice Cliente': commessa.codiceCliente,
          'Descrizione Commessa': commessa.descrizione,
          'Codice Articolo': riga.codiceArticolo,
          'Descrizione Articolo': riga.descrizione,
          'Quantità': riga.quantita,
          'Prezzo Unitario': `€${riga.prezzoUnitario.toFixed(2)}`,
          'Totale Vendita': `€${riga.totale.toFixed(2)}`,
          'Quantità Assegnata': quantitaAssegnata,
          'Quantità Evasa': quantitaEvasa,
          'Totale Costi': `€${totaleCostiRiga.toFixed(2)}`,
          'Marginalità': `€${marginalitaRiga.toFixed(2)}`,
          'Marginalità %': `${marginalitaPerc.toFixed(1)}%`,
          'Numero Fornitori': costiRiga.length
        });
      });
    });
    return report;
  };

  const generateReportFornitori = () => {
    const fornitori = {};
    costi.forEach(costo => {
      if (!fornitori[costo.fornitore]) {
        fornitori[costo.fornitore] = {
          fornitore: costo.fornitore,
          numeroOrdini: 0,
          totaleImporto: 0,
          quantitaTotale: 0,
          quantitaEvasa: 0,
          servizi: new Set()
        };
      }
      
      fornitori[costo.fornitore].numeroOrdini++;
      fornitori[costo.fornitore].totaleImporto += costo.totale;
      fornitori[costo.fornitore].quantitaTotale += costo.quantita;
      fornitori[costo.fornitore].quantitaEvasa += getQuantitaEvasaCosto(costo.id);
      fornitori[costo.fornitore].servizi.add(costo.codiceServizio);
    });

    return Object.values(fornitori).map(f => ({
      'Fornitore': f.fornitore,
      'Numero Ordini': f.numeroOrdini,
      'Totale Importo': `€${f.totaleImporto.toFixed(2)}`,
      'Quantità Ordinata': f.quantitaTotale,
      'Quantità Evasa': f.quantitaEvasa,
      'Residuo': f.quantitaTotale - f.quantitaEvasa,
      'Percentuale Evasa': f.quantitaTotale > 0 ? `${((f.quantitaEvasa / f.quantitaTotale) * 100).toFixed(1)}%` : '0%',
      'Servizi Forniti': Array.from(f.servizi).join(', ')
    }));
  };

  const generateReportEvasioni = () => {
    const report = [];
    ordini.forEach(ordine => {
      const evasioniOrdine = evasioni.filter(e => e.ordineId === ordine.id);
      evasioniOrdine.forEach(evasione => {
        const costo = costi.find(c => c.id === evasione.costoId);
        const riga = righeVendita.find(r => r.id === costo?.rigaVenditaId);
        const commessa = commesse.find(c => c.id === riga?.commessaId);

        report.push({
          'Numero Ordine': ordine.numeroOrdine,
          'Descrizione Ordine': ordine.descrizione,
          'Data Ordine': new Date(ordine.dataCreazione).toLocaleDateString(),
          'Data Consegna': ordine.dataConsegna ? new Date(ordine.dataConsegna).toLocaleDateString() : '',
          'Stato Ordine': ordine.stato,
          'Codice Cliente': commessa?.codiceCliente || '',
          'Codice Articolo': riga?.codiceArticolo || '',
          'Fornitore': costo?.fornitore || '',
          'Servizio': costo?.codiceServizio || '',
          'Quantità Evasa': evasione.quantitaEvasa,
          'Data Evasione': new Date(evasione.dataEvasione).toLocaleDateString(),
          'Note Evasione': evasione.note || ''
        });
      });
    });
    return report;
  };

  const generateReportResiduiFornitori = () => {
    return costi
      .map(costo => {
        const riga = righeVendita.find(r => r.id === costo.rigaVenditaId);
        const commessa = commesse.find(c => c.id === riga?.commessaId);
        const quantitaEvasa = getQuantitaEvasaCosto(costo.id);
        const residuo = costo.quantita - quantitaEvasa;

        return {
          'Codice Cliente': commessa?.codiceCliente || '',
          'Descrizione Commessa': commessa?.descrizione || '',
          'Codice Articolo': riga?.codiceArticolo || '',
          'Fornitore': costo.fornitore,
          'Servizio': costo.codiceServizio,
          'Descrizione Personalizzata': costo.descrizionePersonalizzata || '',
          'Quantità Ordinata': costo.quantita,
          'Costo Unitario': `€${costo.costoUnitario.toFixed(2)}`,
          'Totale Ordine': `€${costo.totale.toFixed(2)}`,
          'Quantità Evasa': quantitaEvasa,
          'Residuo': residuo,
          'Percentuale Evasa': costo.quantita > 0 ? `${((quantitaEvasa / costo.quantita) * 100).toFixed(1)}%` : '0%',
          'Stato': residuo > 0 ? 'DA EVADERE' : 'EVASO'
        };
      })
      .sort((a, b) => b.Residuo - a.Residuo);
  };

  const exportTableToCSV = (data, filename) => {
    if (data.length === 0) {
      alert('Nessun dato da esportare');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]?.toString() || '';
          return value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const salvaProgetto = () => {
    const progetto = {
      nome: prompt('Nome del progetto:', 'Progetto_Commesse_' + new Date().toISOString().split('T')[0]) || 'Progetto_Commesse',
      dataCreazione: new Date().toISOString(),
      versione: '1.0',
      dati: {
        commesse,
        righeVendita,
        costi,
        evasioni,
        codiciServizio,
        ordini
      }
    };

    const dataStr = JSON.stringify(progetto, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${progetto.nome}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const caricaProgetto = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const progetto = JSON.parse(e.target.result);
        
        if (progetto.dati) {
          if (progetto.dati.commesse) setCommesse(progetto.dati.commesse);
          if (progetto.dati.righeVendita) setRigheVendita(progetto.dati.righeVendita);
          if (progetto.dati.costi) setCosti(progetto.dati.costi);
          if (progetto.dati.evasioni) setEvasioni(progetto.dati.evasioni);
          if (progetto.dati.codiciServizio) setCodiciServizio(progetto.dati.codiciServizio);
          
          alert(`Progetto "${progetto.nome}" caricato con successo!\nData creazione: ${new Date(progetto.dataCreazione).toLocaleString()}`);
        } else {
          alert('File non valido: formato progetto non riconosciuto');
        }
      } catch (error) {
        alert('Errore nel caricamento del file: formato JSON non valido');
      }
    };
    reader.readAsText(file);
    
    // Reset input per permettere di ricaricare lo stesso file
    event.target.value = '';
  };

  const nuovoProgetto = () => {
    if (confirm('Sei sicuro di voler creare un nuovo progetto? Tutti i dati attuali saranno eliminati.')) {
      setCommesse([]);
      setRigheVendita([]);
      setCosti([]);
      setEvasioni([]);
      setOrdini([]);
      setCodiciServizio({
        interno: ['Progettazione', 'Sviluppo Software', 'Testing', 'Consulenza', 'Formazione'],
        esterno: ['Hardware', 'Licenze Software', 'Servizi Cloud', 'Manutenzione', 'Supporto Tecnico']
      });
    }
  };

  // Funzione di esportazione
  const exportToExcel = () => {
    const data = [];
    
    commesse.forEach(commessa => {
      const righe = righeVendita.filter(r => r.commessaId === commessa.id);
      
      righe.forEach(riga => {
        const costiRiga = costi.filter(c => c.rigaVenditaId === riga.id);
        const marginalitaRiga = getMarginalitaRiga(riga.id);
        
        if (costiRiga.length === 0) {
          data.push({
            'Codice Cliente': commessa.codiceCliente,
            'Descrizione Commessa': commessa.descrizione,
            'Codice Articolo': riga.codiceArticolo,
            'Descrizione Articolo': riga.descrizione,
            'Quantità Vendita': riga.quantita,
            'Prezzo Unitario': riga.prezzoUnitario,
            'Totale Vendita': riga.totale,
            'Fornitore': '',
            'Quantità Assegnata': 0,
            'Costo Unitario': 0,
            'Totale Costo': 0,
            'Marginalità': marginalitaRiga
          });
        } else {
          costiRiga.forEach(costo => {
            data.push({
              'Codice Cliente': commessa.codiceCliente,
              'Descrizione Commessa': commessa.descrizione,
              'Codice Articolo': riga.codiceArticolo,
              'Descrizione Articolo': riga.descrizione,
              'Quantità Vendita': riga.quantita,
              'Prezzo Unitario': riga.prezzoUnitario,
              'Totale Vendita': riga.totale,
              'Codice Servizio': costo.codiceServizio,
              'Descrizione Personalizzata': costo.descrizionePersonalizzata,
              'Fornitore': costo.fornitore,
              'Quantità Assegnata': costo.quantita,
              'Costo Unitario': costo.costoUnitario,
              'Totale Costo': costo.totale,
              'Marginalità Totale Riga': marginalitaRiga
            });
          });
        }
      });
    });

    console.log('Dati da esportare:', data);
    alert('Esportazione completata! (I dati sono stati stampati nella console)');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Gestione Commesse Multi-Riga</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowManageCodici(true)}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Gestisci Codici
              </button>
              <button
                onClick={exportToExcel}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Esporta Excel
              </button>
              
              {/* Separatore visivo */}
              <div className="border-l border-gray-300 mx-2"></div>
              
              {/* Gestione Progetti */}
              <button
                onClick={nuovoProgetto}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuovo
              </button>
              <label className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Importa JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={caricaProgetto}
                  className="hidden"
                />
              </label>
              <button
                onClick={salvaProgetto}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Esporta JSON
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'commesse', label: 'Commesse' },
              { id: 'costi', label: 'Assegnazioni Fornitori' },
              { id: 'evasioni', label: 'Evasioni' },
              { id: 'report', label: 'Report' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Tab Commesse */}
          {activeTab === 'commesse' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Commesse e Righe Vendita</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowImportCSV(true)}
                    className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </button>
                  <button
                    onClick={() => setShowAddCommessa(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Commessa
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {commesse.map((commessa) => {
                  const righe = righeVendita.filter(r => r.commessaId === commessa.id);
                  const totaleCommessa = getTotaleCommessa(commessa.id);
                  const isExpanded = expandedCommesse.has(commessa.id);
                  
                  return (
                    <div key={commessa.id} className="bg-white shadow rounded-lg">
                      {/* Header Commessa */}
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleExpanded(commessa.id)}
                              className="mr-2 text-gray-500 hover:text-gray-700"
                            >
                              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </button>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {commessa.codiceCliente} - {commessa.descrizione}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {righe.length} righe • Totale: €{totaleCommessa.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCommessaId(commessa.id);
                                setShowAddRiga(true);
                              }}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                              <Plus className="w-4 h-4 inline mr-1" />
                              Riga
                            </button>
                            <button
                              onClick={() => setEditingCommessa(commessa)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteCommessa(commessa.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Righe Vendita */}
                      {isExpanded && (
                        <div className="px-6 py-4">
                          {righe.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Nessuna riga di vendita</p>
                          ) : (
                            <div className="space-y-3">
                              {righe.map((riga) => {
                                const costiRiga = costi.filter(c => c.rigaVenditaId === riga.id);
                                const quantitaAssegnata = getQuantitaAssegnata(riga.id);
                                const marginalita = getMarginalitaRiga(riga.id);
                                
                                return (
                                  <div key={riga.id} className="bg-gray-50 p-4 rounded border-l-4 border-blue-400">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <h4 className="font-medium text-gray-900">
                                          {riga.codiceArticolo} - {riga.descrizione}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Qnt: {riga.quantita} × €{riga.prezzoUnitario} = €{riga.totale.toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className={`text-sm font-medium ${marginalita >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          Margine: €{marginalita.toFixed(2)} ({getMarginalitaPercentualeRiga(riga.id).toFixed(1)}%)
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Assegnata: {quantitaAssegnata}/{riga.quantita}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => {
                                            setSelectedCommessaId(commessa.id);
                                            setSelectedRigaId(riga.id);
                                            setShowAddCosto(true);
                                          }}
                                          className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                                          disabled={quantitaAssegnata >= riga.quantita}
                                        >
                                          <Plus className="w-3 h-3 inline mr-1" />
                                          Fornitore
                                        </button>
                                        <button
                                          onClick={() => setEditingRiga(riga)}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => deleteRigaVendita(riga.id)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Assegnazioni Fornitori */}
                                    {costiRiga.length > 0 && (
                                      <div className="mt-3 pl-4 border-l-2 border-orange-200">
                                        <h5 className="text-xs font-medium text-gray-700 mb-2">Assegnazioni Fornitori:</h5>
                                        <div className="space-y-2">
                                          {costiRiga.map((costo) => {
                                            const residuo = getResiduoCosto(costo.id);
                                            const evaso = getQuantitaEvasaCosto(costo.id);
                                            
                                            return (
                                              <div key={costo.id} className="flex items-center justify-between bg-white p-2 rounded text-xs">
                                                <div>
                                                  <span className="font-medium text-orange-600">{costo.fornitore}</span>
                                                  <span className="text-gray-500 ml-2">
                                                    {costo.codiceServizio}
                                                    {costo.descrizionePersonalizzata && ` - ${costo.descrizionePersonalizzata}`}
                                                  </span>
                                                  <div className="text-gray-500">
                                                    Ordinato: {costo.quantita} × €{costo.costoUnitario} = €{costo.totale.toFixed(2)}
                                                  </div>
                                                  <div className={`text-xs ${residuo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    Evaso: {evaso} | Residuo: {residuo}
                                                  </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  <button
                                                    onClick={() => setEditingCosto(costo)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                  >
                                                    <Edit2 className="w-3 h-3" />
                                                  </button>
                                                  <button
                                                    onClick={() => deleteCosto(costo.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Evasioni Ordini */}
                                    {(() => {
                                      const evasioniRiga = evasioni.filter(e => e.rigaVenditaId === riga.id);
                                      return evasioniRiga.length > 0 && (
                                        <div className="mt-3 pl-4 border-l-2 border-green-200">
                                          <h5 className="text-xs font-medium text-gray-700 mb-2">Evasioni Ordini:</h5>
                                          <div className="space-y-2">
                                            {evasioniRiga.map((evasione) => (
                                              <div key={evasione.id} className="flex items-center justify-between bg-white p-2 rounded text-xs">
                                                <div>
                                                  <span className="font-medium text-green-600">Ordine: {evasione.numeroOrdine}</span>
                                                  <div className="text-gray-500">
                                                    Quantità evasa: {evasione.quantitaEvasa}
                                                  </div>
                                                  {evasione.note && (
                                                    <div className="text-gray-400 italic">
                                                      Note: {evasione.note}
                                                    </div>
                                                  )}
                                                  <div className="text-gray-400 text-xs">
                                                    Data: {new Date(evasione.dataEvasione).toLocaleDateString()}
                                                  </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  <button
                                                    onClick={() => setEditingEvasione(evasione)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                  >
                                                    <Edit2 className="w-3 h-3" />
                                                  </button>
                                                  <button
                                                    onClick={() => deleteEvasione(evasione.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {commesse.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna commessa</h3>
                    <p className="mt-1 text-sm text-gray-500">Inizia creando una nuova commessa.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Assegnazioni Fornitori */}
          {activeTab === 'costi' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Riepilogo Assegnazioni per Fornitore</h2>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {costi.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna assegnazione</h3>
                    <p className="mt-1 text-sm text-gray-500">Le assegnazioni ai fornitori appariranno qui.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {/* Raggruppa per fornitore */}
                    {Object.entries(
                      costi.reduce((acc, costo) => {
                        if (!acc[costo.fornitore]) {
                          acc[costo.fornitore] = [];
                        }
                        acc[costo.fornitore].push(costo);
                        return acc;
                      }, {})
                    ).map(([fornitore, costiFornitore]) => {
                      const totaleFornitore = costiFornitore.reduce((sum, c) => sum + c.totale, 0);
                      
                      return (
                        <div key={fornitore} className="px-6 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-medium text-gray-900">{fornitore}</h3>
                            <span className="text-lg font-bold text-green-600">
                              €{totaleFornitore.toFixed(2)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {costiFornitore.map((costo) => {
                              const commessa = commesse.find(c => c.id === costo.commessaId);
                              const riga = righeVendita.find(r => r.id === costo.rigaVenditaId);
                              
                              return (
                                <div key={costo.id} className="bg-gray-50 p-3 rounded">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-blue-600">
                                        {commessa?.codiceCliente} - {riga?.codiceArticolo}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {costo.codiceServizio}
                                        {costo.descrizionePersonalizzata && ` - ${costo.descrizionePersonalizzata}`}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Qnt: {costo.quantita} × €{costo.costoUnitario} = €{costo.totale.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Evasioni */}
          {activeTab === 'evasioni' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Gestione Ordini ed Evasioni</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddOrdine(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuovo Ordine
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {ordini.length === 0 ? (
                  <div className="bg-white shadow rounded-lg">
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun ordine creato</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Crea un nuovo ordine per iniziare a gestire le evasioni.
                      </p>
                    </div>
                  </div>
                ) : (
                  ordini
                    .sort((a, b) => new Date(b.dataCreazione) - new Date(a.dataCreazione))
                    .map((ordine) => {
                      const evasioniOrdine = evasioni.filter(e => e.ordineId === ordine.id);
                      const quantitaTotaleEvasa = evasioniOrdine.reduce((sum, e) => sum + e.quantitaEvasa, 0);
                      const numeroRigheEvase = evasioniOrdine.length;
                      
                      return (
                        <div key={ordine.id} className="bg-white shadow rounded-lg">
                          {/* Header Ordine */}
                          <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  Ordine: {ordine.numeroOrdine}
                                </h3>
                                <p className="text-sm text-gray-600">{ordine.descrizione}</p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <p className="text-xs text-gray-500">
                                    Creato: {new Date(ordine.dataCreazione).toLocaleDateString()}
                                  </p>
                                  {ordine.dataConsegna && (
                                    <p className="text-xs text-gray-500">
                                      Consegna: {new Date(ordine.dataConsegna).toLocaleDateString()}
                                    </p>
                                  )}
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    ordine.stato === 'completato' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {ordine.stato}
                                  </span>
                                </div>
                                <p className="text-sm text-blue-600 mt-1">
                                  {numeroRigheEvase} evasioni • Qtà totale: {quantitaTotaleEvasa}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedOrdineId(ordine.id);
                                    setShowAddEvasione(true);
                                  }}
                                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                  <Plus className="w-4 h-4 inline mr-1" />
                                  Evadi Fornitore
                                </button>
                                <button
                                  onClick={() => updateOrdine(ordine.id, { 
                                    stato: ordine.stato === 'aperto' ? 'completato' : 'aperto' 
                                  })}
                                  className={`px-3 py-1 rounded text-sm ${
                                    ordine.stato === 'aperto' 
                                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                                  }`}
                                >
                                  {ordine.stato === 'aperto' ? 'Completa' : 'Riapri'}
                                </button>
                                <button
                                  onClick={() => deleteOrdine(ordine.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {ordine.note && (
                              <p className="text-sm text-gray-500 italic mt-2">Note: {ordine.note}</p>
                            )}
                          </div>

                          {/* Evasioni dell'Ordine */}
                          {evasioniOrdine.length > 0 && (
                            <div className="px-6 py-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">Evasioni Ordini Fornitori:</h4>
                              <div className="space-y-3">
                                {evasioniOrdine.map((evasione) => {
                                  const costo = costi.find(c => c.id === evasione.costoId);
                                  const riga = righeVendita.find(r => r.id === costo?.rigaVenditaId);
                                  const commessa = commesse.find(c => c.id === riga?.commessaId);
                                  const residuoCosto = getResiduoCosto(evasione.costoId);
                                  const evasoCosto = getQuantitaEvasaCosto(evasione.costoId);
                                  
                                  return (
                                    <div key={evasione.id} className="bg-gray-50 p-3 rounded border-l-4 border-green-400">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-medium text-green-600">
                                              {costo?.fornitore}
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                              {costo?.codiceServizio}
                                            </span>
                                          </div>
                                          <p className="text-sm text-blue-600">
                                            {commessa?.codiceCliente} - {riga?.codiceArticolo} - {riga?.descrizione}
                                          </p>
                                          <div className="flex items-center space-x-4 mt-1">
                                            <p className="text-xs text-gray-600">
                                              Evaso ora: {evasione.quantitaEvasa}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                              Totale evaso: {evasoCosto}/{costo?.quantita}
                                            </p>
                                            <p className={`text-xs font-medium ${residuoCosto > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                              Residuo: {residuoCosto}
                                            </p>
                                          </div>
                                          {evasione.note && (
                                            <p className="text-xs text-gray-500 italic mt-1">
                                              Note: {evasione.note}
                                            </p>
                                          )}
                                          <p className="text-xs text-gray-400">
                                            Data evasione: {new Date(evasione.dataEvasione).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                          <button
                                            onClick={() => setEditingEvasione(evasione)}
                                            className="text-blue-600 hover:text-blue-800"
                                          >
                                            <Edit2 className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => deleteEvasione(evasione.id)}
                                            className="text-red-600 hover:text-red-800"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Messaggio quando non ci sono evasioni */}
                          {evasioniOrdine.length === 0 && (
                            <div className="px-6 py-4 text-center">
                              <p className="text-sm text-gray-500">
                                Nessuna evasione registrata per questo ordine.
                                <br />
                                Clicca "Evadi Fornitore" per collegare gli ordini fornitori.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}

                {/* Riepilogo Residui Ordini Fornitori */}
                {costi.length > 0 && (
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Riepilogo Residui Ordini Fornitori</h3>
                    </div>
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {costi
                          .filter(costo => getResiduoCosto(costo.id) > 0)
                          .map(costo => {
                            const riga = righeVendita.find(r => r.id === costo.rigaVenditaId);
                            const commessa = commesse.find(c => c.id === riga?.commessaId);
                            const residuo = getResiduoCosto(costo.id);
                            const evaso = getQuantitaEvasaCosto(costo.id);
                            
                            return (
                              <div key={costo.id} className="bg-red-50 p-3 rounded border border-red-200">
                                <div className="text-sm">
                                  <p className="font-medium text-red-800">{costo.fornitore}</p>
                                  <p className="text-red-600">{costo.codiceServizio}</p>
                                  <p className="text-gray-600 text-xs">
                                    {commessa?.codiceCliente} - {riga?.codiceArticolo}
                                  </p>
                                  <div className="mt-2 text-xs">
                                    <span className="text-gray-600">Ordinato: {costo.quantita}</span><br/>
                                    <span className="text-green-600">Evaso: {evaso}</span><br/>
                                    <span className="text-red-600 font-medium">Residuo: {residuo}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        {costi.filter(costo => getResiduoCosto(costo.id) > 0).length === 0 && (
                          <div className="col-span-full text-center py-4">
                            <p className="text-green-600 font-medium">✅ Tutti gli ordini fornitori sono stati evasi!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>
      </main>

      {/* Modali */}
      {showAddCommessa && (
        <CommessaForm
          onSave={addCommessa}
          onCancel={() => setShowAddCommessa(false)}
        />
      )}

      {editingCommessa && (
        <CommessaForm
          commessa={editingCommessa}
          onSave={(updates) => updateCommessa(editingCommessa.id, updates)}
          onCancel={() => setEditingCommessa(null)}
        />
      )}

      {showAddRiga && (
        <RigaVenditaForm
          onSave={addRigaVendita}
          onCancel={() => setShowAddRiga(false)}
        />
      )}

      {editingRiga && (
        <RigaVenditaForm
          riga={editingRiga}
          onSave={(updates) => updateRigaVendita(editingRiga.id, updates)}
          onCancel={() => setEditingRiga(null)}
        />
      )}

      {showAddCosto && (
        <CostoForm
          onSave={addCosto}
          onCancel={() => setShowAddCosto(false)}
        />
      )}

      {editingCosto && (
        <CostoForm
          costo={editingCosto}
          onSave={(updates) => updateCosto(editingCosto.id, updates)}
          onCancel={() => setEditingCosto(null)}
        />
      )}

      {editingEvasione && (
        <EvasioneForm
          evasione={editingEvasione}
          onSave={(updates) => updateEvasione(editingEvasione.id, updates)}
          onCancel={() => setEditingEvasione(null)}
        />
      )}

      {showAddOrdine && (
        <OrdineForm
          onSave={addOrdine}
          onCancel={() => setShowAddOrdine(false)}
        />
      )}

      {showAddEvasione && (
        <EvasioneForm
          onSave={addEvasione}
          onCancel={() => setShowAddEvasione(false)}
        />
      )}

      {showImportCSV && (
        <ImportCSVModal
          onClose={() => setShowImportCSV(false)}
        />
      )}

      {showManageCodici && (
        <GestioneCodiciServizio
          onClose={() => setShowManageCodici(false)}
        />
      )}
    </div>
  );
};

export default GestioneCommesse;