import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AtalanyadoDiagram() {
  const [eves_bevetel, setEvesBevetel] = useState(10000000);
  const [jogviszony, setJogviszony] = useState('fofoglalkozu'); // fofoglalkozu, mellek, kiegeszito
  const [ev, setEv] = useState(2026); // 2025, 2026, 2027
  const [koltseg_hanyad, setKoltsegHanyad] = useState(45);
  const [minimalber_tipus, setMinimalberTipus] = useState('minimalber'); // minimalber, berminimum
  const [indulasHonap, setIndulasHonap] = useState(1); // 1-12
  const [hipaKulcs, setHipaKulcs] = useState(2);
  
  // Minimálbér és garantált bérminimum értékek évenként
  const MINIMÁLBÉR_2025 = 290800;
  const MINIMÁLBÉR_2026 = 328600;
  const MINIMÁLBÉR_2027 = 374600;
  
  const GARANTÁLT_BÉRMINIMUM_2025 = 348800;
  // 2026 és 2027: még nem végleges, de a tipikus arány alapján (~20% magasabb minimálbérnél)
  const GARANTÁLT_BÉRMINIMUM_2026 = 394400; // 328600 * 1.2 ≈ 394320, kerekítve
  const GARANTÁLT_BÉRMINIMUM_2027 = 449500; // 374600 * 1.2 ≈ 449520, kerekítve
  
  const MINIMÁLBÉR = ev === 2025 ? MINIMÁLBÉR_2025 : (ev === 2026 ? MINIMÁLBÉR_2026 : MINIMÁLBÉR_2027);
  const GARANTÁLT_BÉRMINIMUM = ev === 2025 ? GARANTÁLT_BÉRMINIMUM_2025 : (ev === 2026 ? GARANTÁLT_BÉRMINIMUM_2026 : GARANTÁLT_BÉRMINIMUM_2027);
  
  const ÉVES_MINIMÁLBÉR = MINIMÁLBÉR * 12;
  const ADÓMENTES_JÖVEDELEM = ÉVES_MINIMÁLBÉR / 2;
  
  // Bevételi limitek évenként
  const MAX_BEVETEL_2025_40 = 34896000;
  const MAX_BEVETEL_2026_45 = 38736000;
  const MAX_BEVETEL_2027_50 = 38736000;
  const MAX_BEVETEL_80 = ev === 2025 ? 34896000 : 38736000; // 80% költséghányad: 2025-ben 40%-os limit, 2026-tól 45%-os limit
  const MAX_BEVETEL_90 = 193680000;
  
  // Bevételi limit meghatározása év és költséghányad alapján
  const MAX_BEVETEL = koltseg_hanyad === 90 ? MAX_BEVETEL_90 : 
                      (koltseg_hanyad === 80 ? MAX_BEVETEL_80 :
                      (koltseg_hanyad === 50 ? (ev >= 2027 ? MAX_BEVETEL_2027_50 : MAX_BEVETEL_2026_45) :
                      (koltseg_hanyad === 45 ? (ev >= 2026 ? MAX_BEVETEL_2026_45 : MAX_BEVETEL_2025_40) :
                      (koltseg_hanyad === 40 ? MAX_BEVETEL_2025_40 : MAX_BEVETEL_2026_45))));
  
  // Napok számítása indulási hónaptól év végéig
  const napokHonapban = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // nem szökőév
  let mukodesiNapok = 0;
  for (let i = indulasHonap - 1; i < 12; i++) {
    mukodesiNapok += napokHonapban[i];
  }
  const osszeNap = 365;
  const aranyositoTenyezo = mukodesiNapok / osszeNap;
  
  // Arányosított bevételi limit
  const aranyositott_limit = MAX_BEVETEL * aranyositoTenyezo;
  
  // Költséghányad alapján jövedelem számítás
  const KÖLTSÉGHÁNYAD = koltseg_hanyad / 100;
  const jovedelem = eves_bevetel * (1 - KÖLTSÉGHÁNYAD);
  
  // Adómentes rész (nincs arányosítva)
  const adokoteles_jovedelem = Math.max(0, jovedelem - ADÓMENTES_JÖVEDELEM);
  
  // SZJA: adóköteles jövedelem * 15%
  const szja = adokoteles_jovedelem * 0.15;
  
  // Járulékok számítása jogviszony alapján
  let tb_jarulék = 0;
  let szocho = 0;
  
  const alkalmazott_minimalber = minimalber_tipus === 'berminimum' ? GARANTÁLT_BÉRMINIMUM : MINIMÁLBÉR;
  
  if (jogviszony === 'fofoglalkozu') {
    // Főfoglalkozású: minimum járulék kötelező
    const havi_min_tb_alap = alkalmazott_minimalber;
    const havi_min_szocho_alap = alkalmazott_minimalber; // 2026-tól megszűnt a 112,5%-os szorzó!
    
    const tb_alap_osszesen = Math.max(adokoteles_jovedelem, havi_min_tb_alap * 12 * aranyositoTenyezo);
    const szocho_alap_osszesen = Math.max(adokoteles_jovedelem, havi_min_szocho_alap * 12 * aranyositoTenyezo);
    
    tb_jarulék = tb_alap_osszesen * 0.185;
    szocho = szocho_alap_osszesen * 0.13;
  } else if (jogviszony === 'mellek') {
    // Mellékfoglalkozású: nincs minimum járulék
    tb_jarulék = adokoteles_jovedelem * 0.07; // csak 7% nyugdíjjárulék
    szocho = 0; // nincs SZOCHO
  } else if (jogviszony === 'kiegeszito') {
    // Kiegészítő tevékenység: opcionális járulékfizetés, most 0-val számolunk
    tb_jarulék = 0;
    szocho = 0;
  }
  
  // HIPA számítás (egyszerűsített sávos módszer)
  let hipa = 0;
  if (eves_bevetel <= 12000000) {
    hipa = 2500000 * (hipaKulcs / 100);
  } else if (eves_bevetel <= 18000000) {
    hipa = 6000000 * (hipaKulcs / 100);
  } else if (eves_bevetel <= 25000000) {
    hipa = 8500000 * (hipaKulcs / 100);
  } else if (koltseg_hanyad === 90 && eves_bevetel <= 120000000) {
    hipa = 8500000 * (hipaKulcs / 100);
  } else {
    // Egyedi számítás szükséges 25M felett
    const adoalap = eves_bevetel * 0.15; // egyszerűsített becslés
    hipa = adoalap * (hipaKulcs / 100);
  }
  
  // Összes adó és járulék
  const osszes_ado = szja + tb_jarulék + szocho + hipa;
  const ado_szazalek = (osszes_ado / eves_bevetel) * 100;

  // Diagram adatok generálása
  const diagramAdatok = [];
  const step = MAX_BEVETEL > 50000000 ? 2000000 : 500000;
  for (let bev = 1000000; bev <= aranyositott_limit; bev += step) {
    const jov = bev * (1 - KÖLTSÉGHÁNYAD);
    const adokot_jov = Math.max(0, jov - ADÓMENTES_JÖVEDELEM);
    const szja_val = adokot_jov * 0.15;
    
    let tb = 0;
    let szoc = 0;
    
    if (jogviszony === 'fofoglalkozu') {
      const havi_min_tb = alkalmazott_minimalber;
      const havi_min_szoc = alkalmazott_minimalber; // 2026-tól 100%
      const tb_alap = Math.max(adokot_jov, havi_min_tb * 12 * aranyositoTenyezo);
      const szoc_alap = Math.max(adokot_jov, havi_min_szoc * 12 * aranyositoTenyezo);
      tb = tb_alap * 0.185;
      szoc = szoc_alap * 0.13;
    } else if (jogviszony === 'mellek') {
      tb = adokot_jov * 0.07;
      szoc = 0;
    }
    
    let hipa_val = 0;
    if (bev <= 12000000) {
      hipa_val = 2500000 * (hipaKulcs / 100);
    } else if (bev <= 18000000) {
      hipa_val = 6000000 * (hipaKulcs / 100);
    } else if (bev <= 25000000) {
      hipa_val = 8500000 * (hipaKulcs / 100);
    } else if (koltseg_hanyad === 90 && bev <= 120000000) {
      hipa_val = 8500000 * (hipaKulcs / 100);
    } else {
      const adoalap_hipa = bev * 0.15;
      hipa_val = adoalap_hipa * (hipaKulcs / 100);
    }
    
    const ossz = szja_val + tb + szoc + hipa_val;
    const szazalek = (ossz / bev) * 100;
    
    diagramAdatok.push({
      bevetel: bev,
      szazalek: parseFloat(szazalek.toFixed(2))
    });
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const honapNevek = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 
                      'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Átalányadó kalkulátor 2025-2027</h1>
      <p className="text-gray-600 mb-1">Részletes beállításokkal - naprakész számítás</p>
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mb-6">
        ⚠️ <strong>Figyelem:</strong> Ezt az oldalt nem ellenőrizte könyvelő. Az itt megjelenő adatok nem biztos, hogy helyesek. 
        Professzionális kalkulátort találsz itt: <a href="https://ks.hu/atalanyado-kalkulator/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">https://ks.hu/atalanyado-kalkulator/</a>
      </p>

      {/* Beállítások */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        
        {/* Év */}
        <div className="p-2 bg-gray-50 rounded">
          <label className="block text-xs font-semibold mb-1 text-gray-700">Év</label>
          <select 
            value={ev} 
            onChange={(e) => setEv(Number(e.target.value))}
            className="w-full p-1.5 text-sm border border-gray-300 rounded bg-white"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        {/* Jogviszony típusa */}
        <div className="p-2 bg-blue-50 rounded">
          <label className="block text-xs font-semibold mb-1 text-gray-700">Jogviszony</label>
          <select 
            value={jogviszony} 
            onChange={(e) => setJogviszony(e.target.value)}
            className="w-full p-1.5 text-sm border border-blue-300 rounded bg-white"
          >
            <option value="fofoglalkozu">Főfoglalkozású</option>
            <option value="mellek">Mellékfoglalkozású</option>
            <option value="kiegeszito">Kiegészítő</option>
          </select>
        </div>

        {/* Költséghányad */}
        <div className="p-2 bg-green-50 rounded">
          <label className="block text-xs font-semibold mb-1 text-gray-700">Költséghányad</label>
          <select 
            value={koltseg_hanyad} 
            onChange={(e) => setKoltsegHanyad(Number(e.target.value))}
            className="w-full p-1.5 text-sm border border-green-300 rounded bg-white"
          >
            <option value={40}>40%</option>
            <option value={45}>45%</option>
            <option value={50}>50%</option>
            <option value={80}>80% (szolg.)</option>
            <option value={90}>90% (kisker.)</option>
          </select>
        </div>

        {/* Minimálbér típus */}
        <div className="p-2 bg-purple-50 rounded">
          <label className="block text-xs font-semibold mb-1 text-gray-700">Minimum alap</label>
          <select 
            value={minimalber_tipus} 
            onChange={(e) => setMinimalberTipus(e.target.value)}
            className="w-full p-1.5 text-sm border border-purple-300 rounded bg-white"
            disabled={jogviszony !== 'fofoglalkozu'}
          >
            <option value="minimalber">Minimálbér</option>
            <option value="berminimum">Bérminimum</option>
          </select>
        </div>

        {/* Indulás hónapja */}
        <div className="p-2 bg-orange-50 rounded">
          <label className="block text-xs font-semibold mb-1 text-gray-700">Indulás</label>
          <select 
            value={indulasHonap} 
            onChange={(e) => setIndulasHonap(Number(e.target.value))}
            className="w-full p-1.5 text-sm border border-orange-300 rounded bg-white"
          >
            <option value={1}>Január</option>
            <option value={2}>Február</option>
            <option value={3}>Március</option>
            <option value={4}>Április</option>
            <option value={5}>Május</option>
            <option value={6}>Június</option>
            <option value={7}>Július</option>
            <option value={8}>Augusztus</option>
            <option value={9}>Szeptember</option>
            <option value={10}>Október</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>
        </div>

        {/* HIPA kulcs */}
        <div className="p-2 bg-pink-50 rounded">
          <label className="block text-xs font-semibold mb-1 text-gray-700">HIPA</label>
          <select 
            value={hipaKulcs} 
            onChange={(e) => setHipaKulcs(Number(e.target.value))}
            className="w-full p-1.5 text-sm border border-pink-300 rounded bg-white"
          >
            <option value={1}>1%</option>
            <option value={2}>2%</option>
          </select>
        </div>
      </div>

      {/* Bevételi limit infó */}
      <div className="mb-4 p-2 bg-red-50 rounded border border-red-200 text-xs">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">Bevételi limit:</span>
          <span className="font-bold text-red-700">{formatCurrency(aranyositott_limit)}</span>
        </div>
        <p className="text-gray-600 mt-0.5">
          {mukodesiNapok} nap ({honapNevek[indulasHonap - 1]}–Dec) • Max: {formatCurrency(MAX_BEVETEL)}
        </p>
      </div>

      {/* Bevétel beállítás */}
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Éves bevétel</h2>
        <div className="flex gap-3 items-center mb-2">
          <input
            type="number"
            min="0"
            max={aranyositott_limit}
            step="100000"
            value={eves_bevetel}
            onChange={(e) => setEvesBevetel(Math.min(Number(e.target.value), aranyositott_limit))}
            className="w-48 p-2 text-lg font-bold border-2 border-blue-300 rounded"
          />
          <span className="text-gray-600">Ft</span>
        </div>
        <input
          type="range"
          min="1000000"
          max={Math.min(aranyositott_limit, 50000000)}
          step="500000"
          value={Math.min(eves_bevetel, aranyositott_limit)}
          onChange={(e) => setEvesBevetel(Number(e.target.value))}
          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
        />
        {eves_bevetel > aranyositott_limit && (
          <p className="text-center text-red-600 font-semibold mt-2 text-sm">⚠️ Túllépi az arányosított limitet!</p>
        )}
      </div>

      {/* Számítás részletei */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
          <span className="text-xs text-gray-600">Jövedelem ({100 - koltseg_hanyad}%)</span>
          <span className="text-lg font-bold text-green-700">{formatCurrency(jovedelem)}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-yellow-50 rounded border border-yellow-200">
          <span className="text-xs text-gray-600">Adómentes rész</span>
          <span className="text-lg font-bold text-yellow-700">{formatCurrency(ADÓMENTES_JÖVEDELEM)}</span>
        </div>
      </div>

      {/* Adók és járulékok */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="p-2 bg-orange-50 rounded border border-orange-200">
          <div className="text-xs text-gray-600 mb-0.5">SZJA (15%)</div>
          <div className="text-sm font-bold text-orange-700">{formatCurrency(szja)}</div>
        </div>
        
        <div className="p-2 bg-purple-50 rounded border border-purple-200">
          <div className="text-xs text-gray-600 mb-0.5">TB járulék</div>
          <div className="text-sm font-bold text-purple-700">{formatCurrency(tb_jarulék)}</div>
        </div>
        
        <div className="p-2 bg-pink-50 rounded border border-pink-200">
          <div className="text-xs text-gray-600 mb-0.5">SZOCHO</div>
          <div className="text-sm font-bold text-pink-700">{formatCurrency(szocho)}</div>
        </div>

        <div className="p-2 bg-indigo-50 rounded border border-indigo-200">
          <div className="text-xs text-gray-600 mb-0.5">HIPA ({hipaKulcs}%)</div>
          <div className="text-sm font-bold text-indigo-700">{formatCurrency(hipa)}</div>
        </div>
      </div>

      {/* Összesítés */}
      <div className="p-4 bg-red-50 rounded border-2 border-red-300 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-600 mb-0.5">Összes adó és járulék</div>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(osszes_ado)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-0.5">A bevétel %-ában</div>
            <div className="text-3xl font-bold text-red-700">{ado_szazalek.toFixed(2)}%</div>
          </div>
        </div>
      </div>

      {/* Diagram */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Adóteher a bevétel függvényében</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={diagramAdatok} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSzazalek" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="bevetel" 
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              label={{ value: 'Éves bevétel (millió Ft)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Adóteher (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 50]}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Adóteher']}
              labelFormatter={(value) => `Bevétel: ${formatCurrency(value)}`}
            />
            <Area 
              type="monotone" 
              dataKey="szazalek" 
              stroke="#dc2626" 
              strokeWidth={3}
              fill="url(#colorSzazalek)"
              name="Adóteher (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Magyarázat */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Fontos tudnivalók {ev}</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>📊 Aktuális beállítások ({ev}):</strong></p>
          <ul className="ml-4 space-y-1 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <li>• <strong>Minimálbér:</strong> {formatCurrency(MINIMÁLBÉR)}/hó</li>
            <li>• <strong>Garantált bérminimum:</strong> {formatCurrency(GARANTÁLT_BÉRMINIMUM)}/hó</li>
            <li>• <strong>Adómentes keret:</strong> {formatCurrency(ADÓMENTES_JÖVEDELEM)} (minimálbér 50%-a)</li>
            <li>• <strong>Bevételi limit ({koltseg_hanyad}%):</strong> {formatCurrency(MAX_BEVETEL)}/év</li>
            {ev >= 2026 && (
              <li>• <strong>SZOCHO minimum:</strong> 100% (2026-tól megszűnt a 112,5%-os szorzó)</li>
            )}
          </ul>
          
          <p className="mt-4"><strong>Jogviszony típusok:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• <strong>Főfoglalkozású:</strong> Kötelező minimum TB (18,5%) és SZOCHO (13%){ev >= 2026 ? ' - 100%-on!' : ' - 112,5%-on (2025)'}</li>
            <li>• <strong>Mellékfoglalkozású:</strong> Csak 7% nyugdíjjárulék, nincs SZOCHO és minimum</li>
            <li>• <strong>Kiegészítő:</strong> Opcionális járulékfizetés (itt 0-val számolva)</li>
          </ul>
          
          <p className="mt-3"><strong>Költséghányad értékek:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• <strong>40%:</strong> Általános szolgáltatások (2025)</li>
            <li>• <strong>45%:</strong> Általános szolgáltatások (2026)</li>
            <li>• <strong>50%:</strong> Általános szolgáltatások (2027-től)</li>
            <li>• <strong>80%:</strong> Speciális szolgáltatások (javítás, személyszállítás stb.) - limit függ az évtől</li>
            <li>• <strong>90%:</strong> Kiskereskedelem (csak árueladás)</li>
          </ul>
          
          <p className="mt-3"><strong>Bevételi korlátok évenként:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• <strong>2025:</strong> 40% = 34 896 000 Ft/év, 80% = 34 896 000 Ft/év</li>
            <li>• <strong>2026:</strong> 45% = 38 736 000 Ft/év, 80% = 38 736 000 Ft/év</li>
            <li>• <strong>2027:</strong> 50% = 38 736 000 Ft/év, 80% = 38 736 000 Ft/év</li>
            <li>• <strong>Minden év:</strong> 90% = 193 680 000 Ft/év</li>
            <li>• Év közben indulásnál napra arányosítva!</li>
          </ul>
          
          <p className="mt-3"><strong>HIPA (iparűzési adó):</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• Egyszerűsített sávos módszer alkalmazható 25M Ft-ig (kisker. 120M Ft-ig)</li>
            <li>• 0-12M: 50 000 Ft (2%), 12-18M: 120 000 Ft (2%), 18-25M: 170 000 Ft (2%)</li>
            <li>• Az adómérték településenként változhat (max. 2%)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}