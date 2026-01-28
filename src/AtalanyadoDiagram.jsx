import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function AtalanyadoDiagram() {
  // Jelenlegi év meghatározása (2025, 2026, 2027 közül)
  const getJelenlegiEv = () => {
    const aktualisEv = new Date().getFullYear();
    if (aktualisEv >= 2025 && aktualisEv <= 2027) {
      return aktualisEv;
    }
    // Ha nem 2025-2027 között van, akkor a legközelebbi évet használjuk
    return aktualisEv < 2025 ? 2025 : 2027;
  };
  
  const jelenlegiEv = getJelenlegiEv();
  const jelenlegiEvKoltsegHanyad = jelenlegiEv === 2025 ? 40 : (jelenlegiEv === 2026 ? 45 : 50);
  
  const [eves_bevetel, setEvesBevetel] = useState(10000000);
  const [jogviszony, setJogviszony] = useState('fofoglalkozu_min'); // fofoglalkozu_min, fofoglalkozu_gar, mellek, kiegeszito
  const [ev, setEv] = useState(jelenlegiEv); // 2025, 2026, 2027
  const [koltseg_hanyad, setKoltsegHanyad] = useState(jelenlegiEvKoltsegHanyad);
  
  // Elérhető költséghányadok év szerint
  const getKoltsegHanyadok = (ev) => {
    const evSzerinti = ev === 2025 ? 40 : (ev === 2026 ? 45 : 50);
    return [evSzerinti, 80, 90];
  };
  
  // Amikor az év változik, ellenőrizzük, hogy a jelenlegi költséghányad elérhető-e
  useEffect(() => {
    const elerhetoKoltsegHanyadok = getKoltsegHanyadok(ev);
    if (!elerhetoKoltsegHanyadok.includes(koltseg_hanyad)) {
      // Ha nem elérhető, állítsuk be az adott év alapértelmezett értékét
      const evSzerinti = ev === 2025 ? 40 : (ev === 2026 ? 45 : 50);
      setKoltsegHanyad(evSzerinti);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ev]);
  const [indulasHonap, setIndulasHonap] = useState(1); // 1-12
  const [hipaKulcs, setHipaKulcs] = useState(2);
  const [kulfoldi_bev_osszeg, setKulfoldiBevOsszeg] = useState(0);
  const [isNegyedeves, setIsNegyedeves] = useState(false);
  const [negyedevesBevetelek, setNegyedevesBevetelek] = useState([0, 0, 0, 0]);
  const [negyedevesKulfoldiBevetelek, setNegyedevesKulfoldiBevetelek] = useState([0, 0, 0, 0]);
  const [isSzjaMentes, setIsSzjaMentes] = useState(false);
  
  // Rejtett költségek
  const [showHiddenCosts, setShowHiddenCosts] = useState(false);
  const [isKonyveloEnabled, setIsKonyveloEnabled] = useState(true);
  const [konyveloHaviDij, setKonyveloHaviDij] = useState(15000);
  const [isSzamlazoEnabled, setIsSzamlazoEnabled] = useState(false);
  const [szamlazoHaviDij, setSzamlazoHaviDij] = useState(2146);
  const [isTranzakcioEnabled, setIsTranzakcioEnabled] = useState(false);
  
  // Minimálbér és garantált bérminimum értékek évenként (konstansok)
  const MINIMÁLBÉR_2025 = 290800;
  const MINIMÁLBÉR_2026 = 322800;
  const MINIMÁLBÉR_2027 = 374600; // nem végleges
  
  const GARANTÁLT_BÉRMINIMUM_2025 = 348800;
  const GARANTÁLT_BÉRMINIMUM_2026 = 373200;
  const GARANTÁLT_BÉRMINIMUM_2027 = 449500; // nem végleges
  
  // Bevételi limitek évenként (konstansok)
  const MAX_BEVETEL_2025_40 = 34896000;
  const MAX_BEVETEL_2026_45 = 38736000;
  const MAX_BEVETEL_2027_50 = 38736000; // nem végleges
  const MAX_BEVETEL_90 = 193680000;

  // ÁFA alanyi adómentes keret évenként
  const AFA_LIMIT_2025 = 18000000;
  const AFA_LIMIT_2026 = 20000000;
  const AFA_LIMIT_2027 = 22000000;

  // Kamarai hozzájárulás: fix éves 5000 HUF
  const KAMARAI_HOZZAJARULAS = 5000;
  
  // Évtől függő értékek
  const MINIMÁLBÉR = useMemo(() => 
    ev === 2025 ? MINIMÁLBÉR_2025 : (ev === 2026 ? MINIMÁLBÉR_2026 : MINIMÁLBÉR_2027),
    [ev]
  );
  
  const GARANTÁLT_BÉRMINIMUM = useMemo(() => 
    ev === 2025 ? GARANTÁLT_BÉRMINIMUM_2025 : (ev === 2026 ? GARANTÁLT_BÉRMINIMUM_2026 : GARANTÁLT_BÉRMINIMUM_2027),
    [ev]
  );
  
  const ÉVES_MINIMÁLBÉR = useMemo(() => MINIMÁLBÉR * 12, [MINIMÁLBÉR]);
  
  const ADÓMENTES_JÖVEDELEM = useMemo(() => 
    ÉVES_MINIMÁLBÉR / 2,
    [ÉVES_MINIMÁLBÉR]
  );
  
  const alkalmazott_minimalber = useMemo(() => 
    jogviszony === 'fofoglalkozu_gar' ? GARANTÁLT_BÉRMINIMUM : MINIMÁLBÉR,
    [jogviszony, GARANTÁLT_BÉRMINIMUM, MINIMÁLBÉR]
  );
  
  const MAX_BEVETEL_80 = useMemo(() => 
    ev === 2025 ? 34896000 : 38736000, // 80% költséghányad: 2025-ben 40%-os limit, 2026-tól 45%-os limit
    [ev]
  );
  
  // Bevételi limit meghatározása év és költséghányad alapján
  const MAX_BEVETEL = useMemo(() => 
    koltseg_hanyad === 90 ? MAX_BEVETEL_90 : 
    (koltseg_hanyad === 80 ? MAX_BEVETEL_80 :
    (koltseg_hanyad === 50 ? (ev >= 2027 ? MAX_BEVETEL_2027_50 : MAX_BEVETEL_2026_45) :
    (koltseg_hanyad === 45 ? (ev >= 2026 ? MAX_BEVETEL_2026_45 : MAX_BEVETEL_2025_40) :
    (koltseg_hanyad === 40 ? MAX_BEVETEL_2025_40 : MAX_BEVETEL_2026_45)))),
    [koltseg_hanyad, ev, MAX_BEVETEL_80]
  );
  
  // Napok számítása indulási hónaptól év végéig
  const { mukodesiNapok, aranyositoTenyezo } = useMemo(() => {
    const napokHonapban = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // nem szökőév
    let napok = 0;
    for (let i = indulasHonap - 1; i < 12; i++) {
      napok += napokHonapban[i];
    }
    const osszeNap = 365;
    const aranyosito = napok / osszeNap;
    return { mukodesiNapok: napok, aranyositoTenyezo: aranyosito };
  }, [indulasHonap]);
  
  // Arányosított bevételi limit
  const aranyositott_limit = useMemo(() => 
    MAX_BEVETEL * aranyositoTenyezo,
    [MAX_BEVETEL, aranyositoTenyezo]
  );

  const aranyositott_afa_limit = useMemo(() => {
    const limit = ev === 2025 ? AFA_LIMIT_2025 : (ev === 2026 ? AFA_LIMIT_2026 : AFA_LIMIT_2027);
    return limit * aranyositoTenyezo;
  }, [ev, aranyositoTenyezo]);

  // Hónapok száma negyedévenként az indulási hónap függvényében
  const honapokNegyedenkent = useMemo(() => {
    const negyedek = [0, 0, 0, 0];
    for (let h = 1; h <= 12; h++) {
      if (h >= indulasHonap) {
        const nIdx = Math.floor((h - 1) / 3);
        negyedek[nIdx]++;
      }
    }
    return negyedek;
  }, [indulasHonap]);

  // Göngyölítéses számítás negyedévekre
  const negyedevesSzamitas = useMemo(() => {
    const costRatio = koltseg_hanyad / 100;
    const szocho_szorzo = ev === 2025 ? 1.125 : 1.0;
    
    let osszes_jovedelem_eddig = 0;
    let elozo_szja_alap = 0;
    let elozo_tb_alap = 0;
    let elozo_szoc_alap = 0;
    let osszes_belfoldi_bevetel_eddig = 0;
    let elozo_afa_ertek = 0;
    
    const negyedek = [];
    
    for (let i = 0; i < 4; i++) {
      const bev = negyedevesBevetelek[i];
      const kulfoldi_bev = negyedevesKulfoldiBevetelek[i];
      const honapok = honapokNegyedenkent[i];
      
      const jov = bev * (1 - costRatio);
      osszes_jovedelem_eddig += jov;
      
      const belfoldi_bev = Math.max(0, bev - kulfoldi_bev);
      osszes_belfoldi_bevetel_eddig += belfoldi_bev;

      const n_tranzakcios_illetek = (showHiddenCosts && isTranzakcioEnabled) ? Math.round(bev * 0.0045) : 0;
      const n_konyvelo_koltseg = (showHiddenCosts && isKonyveloEnabled) ? konyveloHaviDij * honapok : 0;
      const n_szamlazo_koltseg = (showHiddenCosts && isSzamlazoEnabled) ? szamlazoHaviDij * honapok : 0;

      // Göngyölített SZJA
      const adokot_jov_eddig = Math.max(0, osszes_jovedelem_eddig - ADÓMENTES_JÖVEDELEM);
      const szja_alap_negyedev = adokot_jov_eddig - elozo_szja_alap;
      const szja_val = isSzjaMentes ? 0 : Math.round(szja_alap_negyedev * 0.15);
      elozo_szja_alap = adokot_jov_eddig;

      // Göngyölített ÁFA
      const afa_ertek_eddig = osszes_belfoldi_bevetel_eddig > aranyositott_afa_limit 
        ? (osszes_belfoldi_bevetel_eddig - aranyositott_afa_limit) * 0.27 
        : 0;
      const afa_val = Math.round(afa_ertek_eddig - elozo_afa_ertek);
      elozo_afa_ertek = afa_ertek_eddig;
      
      let tb_val = 0;
      let szoc_val = 0;
      let tb_alap_negyedev = 0;
      let szoc_alap_negyedev = 0;
      
      if (jogviszony === 'fofoglalkozu_min' || jogviszony === 'fofoglalkozu_gar') {
        if (honapok > 0) {
          const osszes_honap_eddig = honapokNegyedenkent.slice(0, i + 1).reduce((a, b) => a + b, 0);
          const min_tb_eddig = alkalmazott_minimalber * osszes_honap_eddig;
          const min_szoc_eddig = alkalmazott_minimalber * szocho_szorzo * osszes_honap_eddig;
          
          const tb_alap_eddig = Math.max(adokot_jov_eddig, min_tb_eddig);
          const szoc_alap_eddig = Math.max(adokot_jov_eddig, min_szoc_eddig);
          
          tb_alap_negyedev = tb_alap_eddig - elozo_tb_alap;
          szoc_alap_negyedev = szoc_alap_eddig - elozo_szoc_alap;
          
          // Havi szintű kerekítés a negyedéven belül
          const tb_havi = Math.round((tb_alap_negyedev / honapok) * 0.185);
          const szoc_havi = Math.round((szoc_alap_negyedev / honapok) * 0.13);
          
          tb_val = tb_havi * honapok;
          szoc_val = szoc_havi * honapok;
          
          elozo_tb_alap = tb_alap_eddig;
          elozo_szoc_alap = szoc_alap_eddig;
        }
      } else if (jogviszony === 'mellek') {
        tb_alap_negyedev = szja_alap_negyedev;
        szoc_alap_negyedev = szja_alap_negyedev;
        
        const tb_havi = Math.round((tb_alap_negyedev / honapok) * 0.185);
        const szoc_havi = Math.round((szoc_alap_negyedev / honapok) * 0.13);
        
        tb_val = tb_havi * honapok;
        szoc_val = szoc_havi * honapok;
      }
      
      negyedek.push({
        bevetel: bev,
        jovedelem: jov,
        szja: szja_val,
        tb_jarulék: tb_val,
        szocho: szoc_val,
        afa: afa_val,
        tranzakcios_illetek: n_tranzakcios_illetek,
        konyvelo_koltseg: n_konyvelo_koltseg,
        szamlazo_koltseg: n_szamlazo_koltseg,
        honapok: honapok
      });
    }
    
    const osszes_bevetel = negyedevesBevetelek.reduce((a, b) => a + b, 0);
    const osszes_kulfoldi_bev = negyedevesKulfoldiBevetelek.reduce((a, b) => a + b, 0);
    const osszes_szja = negyedek.reduce((sum, n) => sum + n.szja, 0);
    const osszes_tb = negyedek.reduce((sum, n) => sum + n.tb_jarulék, 0);
    const osszes_szoc = negyedek.reduce((sum, n) => sum + n.szocho, 0);
    const osszes_afa = negyedek.reduce((sum, n) => sum + n.afa, 0);
    const osszes_konyvelo = negyedek.reduce((sum, n) => sum + n.konyvelo_koltseg, 0);
    const osszes_szamlazo = negyedek.reduce((sum, n) => sum + n.szamlazo_koltseg, 0);
    const osszes_tranzakcio = negyedek.reduce((sum, n) => sum + n.tranzakcios_illetek, 0);
    
    return {
      negyedek,
      osszes_bevetel,
      osszes_kulfoldi_bev,
      osszes_szja,
      osszes_tb,
      osszes_szoc,
      osszes_afa,
      osszes_konyvelo,
      osszes_szamlazo,
      osszes_tranzakcio
    };
  }, [negyedevesBevetelek, negyedevesKulfoldiBevetelek, koltseg_hanyad, ADÓMENTES_JÖVEDELEM, jogviszony, alkalmazott_minimalber, ev, honapokNegyedenkent, aranyositott_afa_limit, showHiddenCosts, isKonyveloEnabled, konyveloHaviDij, isSzamlazoEnabled, szamlazoHaviDij, isTranzakcioEnabled, isSzjaMentes]);

  // Központi számítási logika (unifikálva)
  const kalkulalAdokat = useMemo(() => {
    return (bev, kulfoldi_bev) => {
      const jov = bev * (1 - koltseg_hanyad / 100);
      const adokot_jov = Math.max(0, jov - ADÓMENTES_JÖVEDELEM);
      const szja_val = isSzjaMentes ? 0 : Math.round(adokot_jov * 0.15);
      
      let tb_val = 0;
      let szoc_val = 0;
      
      if (jogviszony === 'fofoglalkozu_min' || jogviszony === 'fofoglalkozu_gar') {
        const havi_min_tb = alkalmazott_minimalber;
        const szocho_szorzo = ev === 2025 ? 1.125 : 1.0;
        const havi_min_szoc = alkalmazott_minimalber * szocho_szorzo;
        const tb_alap = Math.max(adokot_jov, havi_min_tb * 12 * aranyositoTenyezo);
        const szoc_alap = Math.max(adokot_jov, havi_min_szoc * 12 * aranyositoTenyezo);
        
        const activeMonths = Math.round(12 * aranyositoTenyezo);
        const tb_havi = Math.round((tb_alap / activeMonths) * 0.185);
        const szoc_havi = Math.round((szoc_alap / activeMonths) * 0.13);
        
        tb_val = tb_havi * activeMonths;
        szoc_val = szoc_havi * activeMonths;
      } else if (jogviszony === 'mellek') {
        const activeMonths = Math.round(12 * aranyositoTenyezo);
        const tb_havi = Math.round((adokot_jov / activeMonths) * 0.185);
        const szoc_havi = Math.round((adokot_jov / activeMonths) * 0.13);
        
        tb_val = tb_havi * activeMonths;
        szoc_val = szoc_havi * activeMonths;
      }
      
      let egyszerusitett_hipa = Infinity;
      if (bev <= 12000000) egyszerusitett_hipa = 2500000 * (hipaKulcs / 100);
      else if (bev <= 18000000) egyszerusitett_hipa = 6000000 * (hipaKulcs / 100);
      else if (bev <= 25000000) egyszerusitett_hipa = 8500000 * (hipaKulcs / 100);
      else if (koltseg_hanyad === 90 && bev <= 120000000) egyszerusitett_hipa = 8500000 * (hipaKulcs / 100);
      
      const hipa_val = Math.round(Math.min(egyszerusitett_hipa, bev * (hipaKulcs / 100)));
      
      const belfoldi_bev = Math.max(0, bev - kulfoldi_bev);
      const afa_val = belfoldi_bev > aranyositott_afa_limit ? Math.round((belfoldi_bev - aranyositott_afa_limit) * 0.27) : 0;
      
      const tranzakcios_illetek = (showHiddenCosts && isTranzakcioEnabled) ? Math.round(bev * 0.0045) : 0;
      const activeMonths = 13 - indulasHonap;
      const konyvelo_koltseg = (showHiddenCosts && isKonyveloEnabled) ? konyveloHaviDij * activeMonths : 0;
      const szamlazo_koltseg = (showHiddenCosts && isSzamlazoEnabled) ? szamlazoHaviDij * activeMonths : 0;

      const ossz = szja_val + tb_val + szoc_val + hipa_val + KAMARAI_HOZZAJARULAS + afa_val + tranzakcios_illetek + konyvelo_koltseg + szamlazo_koltseg;
      
      return {
        jovedelem: jov,
        szja: szja_val,
        tb_jarulék: tb_val,
        szocho: szoc_val,
        hipa: hipa_val,
        afa: afa_val,
        tranzakcios_illetek,
        konyvelo_koltseg,
        szamlazo_koltseg,
        osszes_ado: ossz,
        ado_szazalek: bev > 0 ? (ossz / bev) * 100 : 0
      };
    };
  }, [koltseg_hanyad, ADÓMENTES_JÖVEDELEM, jogviszony, alkalmazott_minimalber, ev, aranyositoTenyezo, hipaKulcs, aranyositott_afa_limit, showHiddenCosts, isKonyveloEnabled, konyveloHaviDij, isSzamlazoEnabled, szamlazoHaviDij, isTranzakcioEnabled, indulasHonap, isSzjaMentes]);

  // Jelenlegi adatok kiszámítása az aktuális bevételre
  const aktualisAdok = useMemo(() => {
    if (isNegyedeves) {
      const { osszes_bevetel, osszes_kulfoldi_bev, osszes_szja, osszes_tb, osszes_szoc, osszes_afa, osszes_konyvelo, osszes_szamlazo, osszes_tranzakcio } = negyedevesSzamitas;
      const alapAdok = kalkulalAdokat(osszes_bevetel, osszes_kulfoldi_bev);
      const ossz = osszes_szja + osszes_tb + osszes_szoc + alapAdok.hipa + osszes_afa + KAMARAI_HOZZAJARULAS + osszes_tranzakcio + osszes_konyvelo + osszes_szamlazo;
      
      return {
        ...alapAdok,
        bevetel: osszes_bevetel,
        szja: osszes_szja,
        tb_jarulék: osszes_tb,
        szocho: osszes_szoc,
        afa: osszes_afa,
        tranzakcios_illetek: osszes_tranzakcio,
        konyvelo_koltseg: osszes_konyvelo,
        szamlazo_koltseg: osszes_szamlazo,
        osszes_ado: ossz,
        ado_szazalek: osszes_bevetel > 0 ? (ossz / osszes_bevetel) * 100 : 0
      };
    }
    return { ...kalkulalAdokat(eves_bevetel, kulfoldi_bev_osszeg), bevetel: eves_bevetel };
  }, [isNegyedeves, negyedevesSzamitas, kalkulalAdokat, eves_bevetel, kulfoldi_bev_osszeg]);

  const { jovedelem, szja, tb_jarulék, szocho, hipa, afa, tranzakcios_illetek, konyvelo_koltseg, szamlazo_koltseg, osszes_ado, ado_szazalek } = aktualisAdok;

  const isInitialMount = React.useRef(true);

  // Szinkronizálás az éves és negyedéves bevételek között (csak váltáskor)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (isNegyedeves) {
      // Ha negyedévesre váltunk, osszuk el az éves bevételt a negyedévekre (arányosan a működési hónapokkal)
      const osszHonap = honapokNegyedenkent.reduce((a, b) => a + b, 0);
      if (osszHonap > 0) {
        const ujBevetelek = honapokNegyedenkent.map(h => Math.floor((eves_bevetel / osszHonap) * h));
        const ujKulfoldiBevetelek = honapokNegyedenkent.map(h => Math.floor((kulfoldi_bev_osszeg / osszHonap) * h));
        
        // Korrekció az utolsó aktív negyedévnél a kerekítés miatt
        const utolsoAktivIdx = [...honapokNegyedenkent].reverse().findIndex(h => h > 0);
        if (utolsoAktivIdx !== -1) {
          const idx = 3 - utolsoAktivIdx;
          ujBevetelek[idx] += (eves_bevetel - ujBevetelek.reduce((a, b) => a + b, 0));
          ujKulfoldiBevetelek[idx] += (kulfoldi_bev_osszeg - ujKulfoldiBevetelek.reduce((a, b) => a + b, 0));
        }
        
        setNegyedevesBevetelek(ujBevetelek);
        setNegyedevesKulfoldiBevetelek(ujKulfoldiBevetelek);
      }
    } else {
      // Ha évesre váltunk vissza, az összeg legyen az éves
      const osszes = negyedevesBevetelek.reduce((a, b) => a + b, 0);
      setEvesBevetel(osszes);
      const osszesKulfoldi = negyedevesKulfoldiBevetelek.reduce((a, b) => a + b, 0);
      setKulfoldiBevOsszeg(osszesKulfoldi);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNegyedeves]);

  // Diagram adatok generálása
  const diagramAdatok = useMemo(() => {
    const adatok = [];
    const step = MAX_BEVETEL > 50000000 ? 2000000 : 500000;
    
    for (let bev = 2000000; bev <= aranyositott_limit; bev += step) {
      const res = kalkulalAdokat(bev, kulfoldi_bev_osszeg);
      adatok.push({
        bevetel: bev,
        szazalek: parseFloat(res.ado_szazalek.toFixed(2))
      });
    }

    // Biztosítsuk, hogy az utolsó pont (a pontos limit) is benne legyen a diagramon
    if (adatok.length > 0 && adatok[adatok.length - 1].bevetel < aranyositott_limit) {
      const res_utolso = kalkulalAdokat(aranyositott_limit, kulfoldi_bev_osszeg);
      adatok.push({
        bevetel: aranyositott_limit,
        szazalek: parseFloat(res_utolso.ado_szazalek.toFixed(2))
      });
    }

    return adatok;
  }, [MAX_BEVETEL, aranyositott_limit, kalkulalAdokat, kulfoldi_bev_osszeg]);

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
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-800">Átalányadó kalkulátor 2025-2027</h1>
        <a 
          href="https://github.com/DaWe35/atalanyado" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="GitHub repository"
        >
          <svg 
            className="w-8 h-8" 
            fill="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </div>
      <p className="text-gray-600 mb-1">Részletes beállításokkal - naprakész számítás</p>

      {/* Beállítások */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 mb-4">
        
        {/* Év */}
        <div className="p-2 bg-slate-50 rounded border border-slate-200">
          <label className="block text-xs font-semibold mb-1 text-slate-700">Év</label>
          <select 
            value={ev} 
            onChange={(e) => setEv(Number(e.target.value))}
            className="w-full p-1.5 text-sm border border-slate-300 rounded bg-white"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        {/* Jogviszony típusa */}
        <div className="p-2 bg-slate-50 rounded border border-slate-200">
          <label className="block text-xs font-semibold mb-1 text-slate-700">Jogviszony</label>
          <select 
            value={jogviszony} 
            onChange={(e) => setJogviszony(e.target.value)}
            className="w-full p-1.5 text-sm border border-slate-300 rounded bg-white"
          >
            <option value="fofoglalkozu_min">Főfoglalkozású minimálbér</option>
            <option value="fofoglalkozu_gar">Főfoglalkozású garantált bérminimum (szakképesítéshez kötött munka esetén)</option>
            <option value="mellek">Mellékfoglalkozású</option>
            <option value="kiegeszito">Kiegészítő</option>
          </select>
        </div>

        {/* Költséghányad */}
        <div className="p-2 bg-slate-50 rounded border border-slate-200">
          <label className="block text-xs font-semibold mb-1 text-slate-700">Költséghányad</label>
          <select 
            value={koltseg_hanyad} 
            onChange={(e) => setKoltsegHanyad(Number(e.target.value))}
            className="w-full p-1.5 text-sm border border-slate-300 rounded bg-white"
          >
            {getKoltsegHanyadok(ev).map((hanyad) => (
              <option key={hanyad} value={hanyad}>
                {hanyad === 80 ? '80% (szolg.)' : hanyad === 90 ? '90% (kisker.)' : `${hanyad}%`}
              </option>
            ))}
          </select>
        </div>

        {/* Indulás hónapja */}
        <div className="p-2 bg-slate-50 rounded border border-slate-200">
          <label className="block text-xs font-semibold mb-1 text-slate-700">Indulás</label>
          <select 
            value={indulasHonap} 
            onChange={(e) => setIndulasHonap(Number(e.target.value))}
            className="w-full p-1.5 text-sm border border-slate-300 rounded bg-white"
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
        <div className="p-2 bg-slate-50 rounded border border-slate-200">
          <label className="block text-xs font-semibold mb-1 text-slate-700">HIPA</label>
          <select 
            value={hipaKulcs} 
            onChange={(e) => setHipaKulcs(Number(e.target.value))}
            className="w-full p-1.5 text-sm border border-slate-300 rounded bg-white"
          >
            <option value={0}>0%</option>
            <option value={1}>1%</option>
            <option value={2}>2%</option>
          </select>
        </div>

        {/* SZJA mentesség */}
        <label className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center gap-2 cursor-pointer group hover:bg-slate-100 transition-colors">
          <input 
            type="checkbox"
            checked={isSzjaMentes} 
            onChange={(e) => setIsSzjaMentes(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs font-semibold text-slate-700 transition-colors">SZJA mentes</span>
        </label>

        {/* Rejtett költségek toggle */}
        <label className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center gap-2 cursor-pointer group text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
          <input 
            type="checkbox"
            checked={showHiddenCosts} 
            onChange={(e) => setShowHiddenCosts(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <span>Rejtett költségek</span>
        </label>
      </div>

      {/* Rejtett költségek expansion */}
      {showHiddenCosts && (
        <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Könyvelő */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={isKonyveloEnabled} 
                  onChange={(e) => setIsKonyveloEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Könyvelő</span>
              </label>
              {isKonyveloEnabled && (
                <div className="ml-6">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Havi díj (Ft)</label>
                  <input 
                    type="number"
                    value={konyveloHaviDij} 
                    onChange={(e) => setKonyveloHaviDij(Number(e.target.value))}
                    className="w-full p-2 text-sm border border-slate-300 rounded bg-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    step="1000"
                    min="0"
                  />
                </div>
              )}
            </div>

            {/* Számlázó program */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={isSzamlazoEnabled} 
                  onChange={(e) => setIsSzamlazoEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Számlázó program</span>
              </label>
              {isSzamlazoEnabled && (
                <div className="ml-6">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Havi díj (Ft)</label>
                  <input 
                    type="number"
                    value={szamlazoHaviDij} 
                    onChange={(e) => setSzamlazoHaviDij(Number(e.target.value))}
                    className="w-full p-2 text-sm border border-slate-300 rounded bg-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    step="500"
                    min="0"
                  />
                </div>
              )}
            </div>

            {/* Tranzakciós illeték */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={isTranzakcioEnabled} 
                  onChange={(e) => setIsTranzakcioEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Tranzakciós illeték (0.45%)</span>
              </label>
              <p className="ml-6 text-[10px] text-slate-500 italic">
                A teljes bevétel után számolt banki/tranzakciós költség.
              </p>
            </div>
          </div>
        </div>
      )}

      {ev === 2027 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mb-6">
          ⚠️ <strong>Figyelem:</strong> A 2027-es minimálbér nem végleges, ezért a számítások nem lehetnek pontosak.
        </p>
      )}

      {/* Bevételi limit infó */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <div className="p-2 bg-amber-50 rounded border border-amber-300 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-700">Átalányadó keret:</span>
            <span className="font-bold text-amber-700">{formatCurrency(aranyositott_limit)}</span>
          </div>
          <p className="text-slate-600 mt-0.5">
            {mukodesiNapok} nap ({honapNevek[indulasHonap - 1]}–Dec) • Max: {formatCurrency(MAX_BEVETEL)}
          </p>
        </div>
        <div className="p-2 bg-amber-50 rounded border border-amber-300 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-700">Alanyi áfa-mentes keret:</span>
            <span className="font-bold text-amber-700"> {formatCurrency(aranyositott_afa_limit)}</span>
          </div>
          <p className="text-slate-600 mt-0.5">
            {mukodesiNapok} nap ({honapNevek[indulasHonap - 1]}–Dec) • Max: {formatCurrency(ev === 2025 ? AFA_LIMIT_2025 : (ev === 2026 ? AFA_LIMIT_2026 : AFA_LIMIT_2027))}
          </p>
          {/* <p className="text-slate-600 mt-0.5">
          Belföldi (ÁFA-számító) bevétel: {formatCurrency(Math.max(0, eves_bevetel - kulfoldi_bev_osszeg))}
          </p> */}
        </div>
      </div>

      {/* Bevétel beállítás */}
      <div className="mb-4 p-4 bg-slate-50 rounded border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-300">
            <label className="text-sm font-bold text-slate-800">Negyedéves bontás</label>
            <button 
              onClick={() => setIsNegyedeves(!isNegyedeves)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isNegyedeves ? 'bg-blue-600' : 'bg-slate-400'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isNegyedeves ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          {!isNegyedeves && (
            <div className="flex-1 flex justify-end">
              <div className="bg-white px-4 py-2 rounded-lg border border-slate-300">
                <span className="text-sm text-slate-700 font-medium">Összes éves bevétel: </span>
                <span className="text-lg font-bold text-slate-900">{formatCurrency(eves_bevetel)}</span>
              </div>
            </div>
          )}
          
          {isNegyedeves && (
            <div className="flex-1 flex justify-end">
              <div className="bg-white px-4 py-2 rounded-lg border border-slate-300">
                <span className="text-sm text-slate-700 font-medium">Negyedévek összesen: </span>
                <span className="text-lg font-bold text-slate-900">{formatCurrency(negyedevesSzamitas.osszes_bevetel)}</span>
              </div>
            </div>
          )}
        </div>

        {!isNegyedeves ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2 text-slate-800">Éves összes bevétel</h2>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  min="0"
                  max={aranyositott_limit}
                  step="500000"
                  value={eves_bevetel}
                  onChange={(e) => setEvesBevetel(Math.min(Number(e.target.value), aranyositott_limit))}
                  className="w-48 p-2 text-lg font-bold border-2 border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-slate-600">Ft</span>
              </div>
            </div>

            {eves_bevetel > aranyositott_afa_limit && (
              <div className="flex-1 p-3 bg-amber-50 rounded border border-amber-300 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold mb-1 text-amber-800 uppercase tracking-wider">
                  Ebből külföldi (ÁFA-mentes) rész:
                </label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <input 
                      type="number"
                      min="0"
                      max={eves_bevetel}
                      step="500000"
                      value={kulfoldi_bev_osszeg}
                      onChange={(e) => setKulfoldiBevOsszeg(Math.min(eves_bevetel, Number(e.target.value)))}
                      className="w-full p-2 text-lg border-2 border-amber-400 rounded bg-white font-bold text-amber-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-amber-600 font-bold">Ft</span>
                  </div>
                  <div className="bg-amber-100 px-3 py-2 rounded font-bold text-amber-800 text-lg min-w-[65px] text-center border-2 border-amber-300">
                    {eves_bevetel > 0 ? ((kulfoldi_bev_osszeg / eves_bevetel) * 100).toFixed(0) : 0}%
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={eves_bevetel}
                  step="500000"
                  value={kulfoldi_bev_osszeg}
                  onChange={(e) => setKulfoldiBevOsszeg(Number(e.target.value))}
                  className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer mt-3 accent-amber-600"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`p-3 rounded border-2 ${honapokNegyedenkent[i] > 0 ? 'bg-white border-blue-300' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-slate-700">{i + 1}. negyedév</label>
                    <span className="text-[10px] text-slate-500 font-medium">{honapokNegyedenkent[i]} hónap</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Bevétel (Ft)</label>
                      <input
                        type="number"
                        min="0"
                        disabled={honapokNegyedenkent[i] === 0}
                        value={negyedevesBevetelek[i]}
                        onChange={(e) => {
                          const newBevs = [...negyedevesBevetelek];
                          newBevs[i] = Number(e.target.value);
                          setNegyedevesBevetelek(newBevs);
                        }}
                        className="w-full p-1.5 text-sm font-bold border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    {negyedevesSzamitas.osszes_bevetel > aranyositott_afa_limit && (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                        <label className="block text-[10px] text-amber-700 uppercase font-bold mb-1">Ebből külföldi (Ft)</label>
                        <input
                          type="number"
                          min="0"
                          max={negyedevesBevetelek[i]}
                          disabled={honapokNegyedenkent[i] === 0}
                          value={negyedevesKulfoldiBevetelek[i]}
                          onChange={(e) => {
                            const newKulfBevs = [...negyedevesKulfoldiBevetelek];
                            newKulfBevs[i] = Math.min(negyedevesBevetelek[i], Number(e.target.value));
                            setNegyedevesKulfoldiBevetelek(newKulfBevs);
                          }}
                          className="w-full p-1.5 text-sm font-bold border border-amber-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {negyedevesSzamitas.osszes_bevetel > aranyositott_afa_limit && (
              <p className="text-[10px] text-amber-700 font-medium italic bg-amber-50 p-2 rounded border border-amber-200">
                Mivel az összbevételed meghaladja az ÁFA keretet, megadhatod a külföldi (ÁFA-mentes) részt, ami csökkenti a belföldi ÁFA-alapot.
              </p>
            )}
          </div>
        )}
        
        {!isNegyedeves && (
          <input
            type="range"
            min="2000000"
            max={Math.min(aranyositott_limit, 50000000)}
            step="500000"
            value={Math.min(eves_bevetel, aranyositott_limit)}
            onChange={(e) => setEvesBevetel(Number(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer mt-4 accent-blue-600"
          />
        )}
        
        {((!isNegyedeves && eves_bevetel > aranyositott_limit) || (isNegyedeves && negyedevesSzamitas.osszes_bevetel > aranyositott_limit)) && (
          <p className="text-center text-rose-600 font-semibold mt-2 text-sm">⚠️ Túllépi az arányosított limitet!</p>
        )}
      </div>

      {/* Adók és járulékok */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        <div className={`p-2 rounded border ${isSzjaMentes ? 'bg-emerald-50 border-emerald-300' : 'bg-blue-50 border-blue-300'}`}>
          <div className="text-xs text-slate-600 mb-0.5">
            SZJA {isSzjaMentes ? '(mentes)' : '(15%)'}
          </div>
          <div className={`text-sm font-bold ${isSzjaMentes ? 'text-emerald-700' : 'text-blue-700'}`}>
            {formatCurrency(szja)}
          </div>
        </div>
        
        <div className="p-2 bg-blue-50 rounded border border-blue-300">
          <div className="text-xs text-slate-600 mb-0.5">TB járulék</div>
          <div className="text-sm font-bold text-blue-700">{formatCurrency(tb_jarulék)}</div>
        </div>
        
        <div className="p-2 bg-blue-50 rounded border border-blue-300">
          <div className="text-xs text-slate-600 mb-0.5">SZOCHO</div>
          <div className="text-sm font-bold text-blue-700">{formatCurrency(szocho)}</div>
        </div>

        <div className="p-2 bg-blue-50 rounded border border-blue-300">
          <div className="text-xs text-slate-600 mb-0.5">ÁFA (27% limit felett)</div>
          <div className="text-sm font-bold text-blue-700">{formatCurrency(afa)}</div>
        </div>

        <div className="p-2 bg-blue-50 rounded border border-blue-300">
          <div className="text-xs text-slate-600 mb-0.5">HIPA ({hipaKulcs}%)</div>
          <div className="text-sm font-bold text-blue-700">{formatCurrency(hipa)}</div>
        </div>

        <div className="p-2 bg-blue-50 rounded border border-blue-300">
          <div className="text-xs text-slate-600 mb-0.5">Kamarai hozzájárulás</div>
          <div className="text-sm font-bold text-blue-700">{formatCurrency(KAMARAI_HOZZAJARULAS)}</div>
        </div>

        {showHiddenCosts && isTranzakcioEnabled && (
          <div className="p-2 bg-slate-50 rounded border border-slate-300">
            <div className="text-xs text-slate-600 mb-0.5">Tranzakciós illeték</div>
            <div className="text-sm font-bold text-slate-700">{formatCurrency(tranzakcios_illetek)}</div>
          </div>
        )}
        {showHiddenCosts && isKonyveloEnabled && (
          <div className="p-2 bg-slate-50 rounded border border-slate-300">
            <div className="text-xs text-slate-600 mb-0.5">Könyvelő ({13 - indulasHonap} hó)</div>
            <div className="text-sm font-bold text-slate-700">{formatCurrency(konyvelo_koltseg)}</div>
          </div>
        )}
        {showHiddenCosts && isSzamlazoEnabled && (
          <div className="p-2 bg-slate-50 rounded border border-slate-300">
            <div className="text-xs text-slate-600 mb-0.5">Számlázó ({13 - indulasHonap} hó)</div>
            <div className="text-sm font-bold text-slate-700">{formatCurrency(szamlazo_koltseg)}</div>
          </div>
        )}
      </div>

      {/* Negyedéves részletezés (ha aktív) */}
      {isNegyedeves && (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 border-collapse border border-slate-200 rounded-lg overflow-hidden">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-3 py-2 border border-slate-200">Időszak</th>
                <th className="px-3 py-2 border border-slate-200">Bevétel</th>
                <th className="px-3 py-2 border border-slate-200">SZJA</th>
                <th className="px-3 py-2 border border-slate-200">TB</th>
                <th className="px-3 py-2 border border-slate-200">SZOCHO</th>
                <th className="px-3 py-2 border border-slate-200">ÁFA</th>
                <th className="px-3 py-2 border border-slate-200 font-bold">Összesen</th>
              </tr>
            </thead>
            <tbody>
              {negyedevesSzamitas.negyedek.map((n, i) => (
                <tr key={i} className={n.honapok === 0 ? 'bg-slate-50 opacity-40' : 'bg-white hover:bg-blue-50'}>
                  <td className="px-3 py-2 border border-slate-200 font-medium text-slate-900">{i + 1}. negyedév</td>
                  <td className="px-3 py-2 border border-slate-200">{formatCurrency(n.bevetel)}</td>
                  <td className="px-3 py-2 border border-slate-200 text-blue-600">{formatCurrency(n.szja)}</td>
                  <td className="px-3 py-2 border border-slate-200 text-blue-600">{formatCurrency(n.tb_jarulék)}</td>
                  <td className="px-3 py-2 border border-slate-200 text-blue-600">{formatCurrency(n.szocho)}</td>
                  <td className="px-3 py-2 border border-slate-200 text-blue-600">{formatCurrency(n.afa)}</td>
                  <td className="px-3 py-2 border border-slate-200 font-bold text-slate-700">{formatCurrency(n.szja + n.tb_jarulék + n.szocho + n.afa + (n.tranzakcios_illetek || 0) + (n.konyvelo_koltseg || 0) + (n.szamlazo_koltseg || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejtett költségek részletezése az összesítés felett */}
      {showHiddenCosts && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {isTranzakcioEnabled && (
            <div className="p-3 bg-slate-50 rounded border border-slate-300 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Tranzakciós illeték (0.45%)</div>
                <div className="text-lg font-bold text-slate-800">{formatCurrency(tranzakcios_illetek)}</div>
              </div>
              <div className="text-right text-[10px] text-slate-500 italic max-w-[100px]">
                Banki tranzakciós költség
              </div>
            </div>
          )}
          {isKonyveloEnabled && (
            <div className="p-3 bg-slate-50 rounded border border-slate-300 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Könyvelő díja ({13 - indulasHonap} hó)</div>
                <div className="text-lg font-bold text-slate-800">{formatCurrency(konyvelo_koltseg)}</div>
              </div>
              <div className="text-right text-[10px] text-slate-500 italic max-w-[100px]">
                {formatCurrency(konyveloHaviDij)}/hó
              </div>
            </div>
          )}
          {isSzamlazoEnabled && (
            <div className="p-3 bg-slate-50 rounded border border-slate-300 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Számlázó ({13 - indulasHonap} hó)</div>
                <div className="text-lg font-bold text-slate-800">{formatCurrency(szamlazo_koltseg)}</div>
              </div>
              <div className="text-right text-[10px] text-slate-500 italic max-w-[100px]">
                {formatCurrency(szamlazoHaviDij)}/hó
              </div>
            </div>
          )}
        </div>
      )}

      {/* Összesítés */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-emerald-50 rounded border-2 border-emerald-300">
          <div className="text-sm text-slate-600 mb-0.5">Jövedelem ({100 - koltseg_hanyad}%)</div>
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(jovedelem)}</div>
        </div>
        
        <div className="p-4 bg-sky-50 rounded border-2 border-sky-300">
          <div className="text-sm text-slate-600 mb-0.5">SZJA mentes jövedelem keret</div>
          <div className="text-2xl font-bold text-sky-700">
            {isSzjaMentes ? '∞' : formatCurrency(ADÓMENTES_JÖVEDELEM)}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-2 p-4 bg-rose-50 rounded border-2 border-rose-300">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-slate-600 mb-0.5">
                {showHiddenCosts ? 'Összes adó, járulék és költség' : 'Összes adó és járulék'}
              </div>
              <div className="text-2xl font-bold text-rose-700">{formatCurrency(osszes_ado)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 mb-0.5">A bevétel %-ában</div>
              <div className="text-3xl font-bold text-rose-700">{ado_szazalek.toFixed(2)}%</div>
            </div>
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
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Adóteher']}
              labelFormatter={(value) => `Bevétel: ${formatCurrency(value)}`}
            />
            {/* Aktuális bevétel jelzése */}
            <ReferenceLine 
              x={aktualisAdok.bevetel} 
              stroke="#2563eb" 
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: 'Bevétel', position: 'insideBottomRight', fill: '#2563eb', fontSize: 12, fontWeight: 'bold', offset: 10 }} 
            />
            {/* ÁFA fordulópont jelzése */}
            {aranyositott_afa_limit + (isNegyedeves ? negyedevesSzamitas.osszes_kulfoldi_bev : kulfoldi_bev_osszeg) < aranyositott_limit && (
              <ReferenceLine 
                x={aranyositott_afa_limit + (isNegyedeves ? negyedevesSzamitas.osszes_kulfoldi_bev : kulfoldi_bev_osszeg)} 
                stroke="#ec4899" 
                strokeDasharray="5 5"
                label={{ value: 'ÁFA határ', position: 'top', fill: '#ec4899', fontSize: 10, fontWeight: 'bold' }} 
              />
            )}
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
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold mb-3 text-slate-800">Fontos tudnivalók {ev}</h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p><strong>📊 Aktuális beállítások ({ev}):</strong></p>
          <ul className="ml-4 space-y-1 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <li>• <strong>Minimálbér:</strong> {formatCurrency(MINIMÁLBÉR)}/hó</li>
            <li>• <strong>Garantált bérminimum:</strong> {formatCurrency(GARANTÁLT_BÉRMINIMUM)}/hó</li>
            <li>• <strong>Adómentes keret:</strong> {formatCurrency(ADÓMENTES_JÖVEDELEM)} (éves minimálbér 50%-a, nem arányosítjuk év közbeni indulás esetén sem)</li>
            <li>• <strong>ÁFA-mentes keret:</strong> {formatCurrency(ev === 2025 ? AFA_LIMIT_2025 : (ev === 2026 ? AFA_LIMIT_2026 : AFA_LIMIT_2027))} (arányosítva: {formatCurrency(aranyositott_afa_limit)})</li>
            <li>• <strong>Bevételi limit ({koltseg_hanyad}%):</strong> {formatCurrency(MAX_BEVETEL)}/év</li>
            <li>• <strong>SZOCHO minimum:</strong> {ev === 2025 ? '112,5%' : '100%'} ({ev === 2025 ? '2025-ben még 112,5%-os szorzó' : '2026-tól megszűnt a 112,5%-os szorzó'})</li>
          </ul>
          
          <p className="mt-4"><strong>Jogviszony típusok:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• <strong>Főfoglalkozású (minimálbér):</strong> Kötelező minimum TB (18,5%) és SZOCHO (13%) a minimálbér után{ev >= 2026 ? '' : ' (112,5%-on 2025-ben)'}</li>
            <li>• <strong>Főfoglalkozású (garantált bérminimum):</strong> Szakképesítést igénylő munka esetén, magasabb minimum járulékalap</li>
            <li>• <strong>Mellékfoglalkozású:</strong> TB (18,5%) és SZOCHO (13%), de nincs minimum alap (csak a tényleges jövedelem után)</li>
            <li>• <strong>Kiegészítő:</strong> Nyugdíjas vállalkozó, nem fizet TB-t és SZOCHO-t</li>
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
            <li>• <strong>2025:</strong> Átalányadó = 34 896 000 Ft, ÁFA-mentes = 18 000 000 Ft</li>
            <li>• <strong>2026:</strong> Átalányadó = 38 736 000 Ft, ÁFA-mentes = 20 000 000 Ft</li>
            <li>• <strong>2027:</strong> Átalányadó = 38 736 000 Ft, ÁFA-mentes = 22 000 000 Ft</li>
            <li>• <strong>Minden év:</strong> 90% (kisker) átalányadó limit = 193 680 000 Ft</li>
            <li>• Év közben indulásnál napra arányosítva!</li>
          </ul>
          
          <p className="mt-3"><strong>HIPA (iparűzési adó):</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• Az adómérték településenként változhat (max. 2%)</li>
            <li>• Egyszerűsített sávos módszer is alkalmazható 25M Ft-ig (kisker. 120M Ft-ig)</li>
            <li>• 0-12M: {formatCurrency(2500000 * (hipaKulcs / 100))} ({hipaKulcs}%), 12-18M: {formatCurrency(6000000 * (hipaKulcs / 100))} ({hipaKulcs}%), 18-25M: {formatCurrency(8500000 * (hipaKulcs / 100))} ({hipaKulcs}%)</li>
            <li>• 25M Ft felett: ({hipaKulcs}%), melyből tételes költség levonható. A kalkulátor 2.5M Ft alatt is ezt a módszert alkalmazza, mert előnyösebb.</li>
          </ul>

          <p className="mt-3"><strong>Közösségi (EU) és Külföldi értékesítés:</strong></p>
          <ul className="ml-4 space-y-1 bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <li>• <strong>B2B szolgáltatás:</strong> Ha EU-s vagy külföldi cégnek számlázol, általában <strong>fordított adózás</strong> történik (0% magyar ÁFA).</li>
            <li>• <strong>ÁFA-mentes keret:</strong> Az export bevétel (ahol a teljesítés helye külföld) <strong>NEM számít bele</strong> az alanyi adómentes keretbe!</li>
            <li>• <strong>Példa:</strong> Ha 30M Ft a bevételed, de ebből 15M Ft EU-s B2B szolgáltatás, akkor a belföldi 15M Ft még nem lépi át a 18M/20M Ft-os keretet, így minden számlád ÁFA-mentes marad.</li>
          </ul>

          <p className="mt-3"><strong>Hogyan számol a kalkulátor az ÁFA-val?</strong></p>
          <ul className="ml-4 space-y-1 bg-rose-50 p-3 rounded border-l-4 border-rose-500">
            <li>• <strong>Számítás:</strong> Ha a belföldi bevételed átlépi a limitet, a rendszer a <strong>keret feletti belföldi részre</strong> számol 27% ÁFA-t adóteherként.</li>
          </ul>
        </div>
        <br />
        Hibát találtál? Az oldal nyílt forráskódú, szívesen veszem a javaslatokat <a 
          href="https://github.com/DaWe35/atalanyado" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >      
          GitHub-on.
        </a>
      </div>

      {/* Felelősségkorlátozás */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500 italic">
          <strong>Felelősségkorlátozás:</strong> Ez az oldal egy független kalkulátor, az adatok tájékoztató jellegűek. 
          A számítások nem minősülnek hivatalos adótanácsadásnak és nem helyettesítik a szakemberrel való konzultációt. 
          Az oldal nem ellenőrzött hivatalos szervek által. A fejlesztő nem vállal felelősséget a számítások esetleges 
          pontatlanságáért vagy az adatok felhasználásából eredő károkért. Mindig egyeztessen könyvelőjével!
        </p>
      </div>
    </div>
  );
}