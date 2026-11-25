# Data quality report

Generated 2026-11-25 from `data/products.json`.

## Summary

| Metric | Value |
| --- | ---: |
| Listings (records) | 3279 |
| Canonical products | 3184 |
| Flagged duplicate listings (hidden, redirect) | 95 |
| Duplicate groups | 90 |
| Cross-source merges | 25 |
| Complete listings (all required fields) | 664 (20.9%) |
| Incomplete listings | 2520 (79.1%) |
| Complete on core facts (ignoring catalogue no. & pack size) | 1850 (58.1%) |
| Brands in catalogue | 118 |
| Brands verified (domain resolves or confirmed by web search) | 109 |
| Brands not verified | 2 — Keul, Jungbrunnen |

## Brand / company verification

Each brand is mapped to its official website domain in `pipeline/config/brands.yaml`; the audit checks that the domain resolves (DNS only — no requests to the company). Brands without a confirmed domain are listed with how they were checked.

| Brand | Products | Official domain | Status | Note |
| --- | ---: | --- | --- | --- |
| Jungbrunnen | 3 | — | ❌ unverified | Not found by web search; listed by the source for VHC reader products — unverified |
| Keul | 2 | — | ❌ unverified | Not found by web search; listed by the source for o-test products — unverified |
| Tascom | 16 | tascom.co.kr | ✅ confirmed (web search) | TASCOM Co., Ltd, Anyang, South Korea (SimplexTAS analysers) — confirmed by web search |
| Melet Schloesing | 4 | melet-schloesing.com | ✅ confirmed (web search) | Melet Schloesing Laboratoires, France (MS4 haematology analysers, FDA K050421) — confirmed by web search |
| Bilimetrix | 2 | bilimetrix.com | ✅ confirmed (web search) | Bilimetrix s.r.l., Trieste, Italy (Bilistick, CE marked) — confirmed by web search |
| Rapha Diagnostics | 1 | — | ✅ confirmed (web search) | Rapha Diagnostics, Mumbai, India (urinalysis, founded 2002) — confirmed by web search |
| Abbott | 195 | abbott.com | ✅ verified (domain resolves) |  |
| Snibe | 177 | snibe.com | ✅ verified (domain resolves) |  |
| Boditech | 161 | boditech.co.kr | ✅ verified (domain resolves) |  |
| SD Biosensor | 152 | sdbiosensor.com | ✅ verified (domain resolves) |  |
| Qiagen | 135 | qiagen.com | ✅ verified (domain resolves) |  |
| Thermo Fisher | 131 | thermofisher.com | ✅ verified (domain resolves) |  |
| Arkray | 130 | arkray.co.jp | ✅ verified (domain resolves) |  |
| Zybio | 125 | zybio.com | ✅ verified (domain resolves) |  |
| Mindray | 121 | mindray.com | ✅ verified (domain resolves) |  |
| Erba Mannheim | 115 | erbamannheim.com | ✅ verified (domain resolves) |  |
| Roche | 111 | roche.com | ✅ verified (domain resolves) |  |
| Calbiotech | 98 | calbiotech.com | ✅ verified (domain resolves) |  |
| Horiba | 70 | horiba.com | ✅ verified (domain resolves) |  |
| Beckman Coulter | 67 | beckmancoulter.com | ✅ verified (domain resolves) |  |
| Cepheid | 62 | cepheid.com | ✅ verified (domain resolves) |  |
| Fujifilm | 61 | fujifilm.com | ✅ verified (domain resolves) |  |
| Siemens Healthineers | 59 | siemens-healthineers.com | ✅ verified (domain resolves) |  |
| Getein | 58 | getein.com.cn | ✅ verified (domain resolves) |  |
| Wondfo | 56 | wondfo.com | ✅ verified (domain resolves) |  |
| Acon | 52 | aconlabs.com | ✅ verified (domain resolves) |  |
| CTK Biotech | 49 | ctkbiotech.com | ✅ verified (domain resolves) |  |
| Becton Dickinson | 49 | bd.com | ✅ verified (domain resolves) |  |
| Bio-Rad | 45 | bio-rad.com | ✅ verified (domain resolves) |  |
| Vedalab | 43 | vedalab.com | ✅ verified (domain resolves) |  |
| HemoCue | 42 | hemocue.com | ✅ verified (domain resolves) |  |
| QuidelOrtho | 41 | quidelortho.com | ✅ verified (domain resolves) |  |
| Werfen | 35 | werfen.com | ✅ verified (domain resolves) |  |
| EDAN | 31 | edan.com | ✅ verified (domain resolves) |  |
| Molbio | 30 | molbiodiagnostics.com | ✅ verified (domain resolves) |  |
| EKF Diagnostics | 29 | ekfdiagnostics.com | ✅ verified (domain resolves) |  |
| NAL von minden | 29 | nal-vonminden.com | ✅ verified (domain resolves) |  |
| Ustar | 27 | bioustar.com | ✅ verified (domain resolves) |  |
| Seamaty | 27 | seamaty.com | ✅ verified (domain resolves) |  |
| Concile | 26 | concile.de | ✅ verified (domain resolves) |  |
| Nova Biomedical | 23 | novabiomedical.com | ✅ verified (domain resolves) |  |
| Bioantibody | 23 | bioantibody.com | ✅ verified (domain resolves) |  |
| InBios | 21 | inbios.com | ✅ verified (domain resolves) |  |
| Hitado | 20 | hitado.de | ✅ verified (domain resolves) |  |
| Sysmex | 20 | sysmex.com | ✅ verified (domain resolves) |  |
| Coyote | 17 | coyotebio.com | ✅ verified (domain resolves) |  |
| Medtronic | 17 | medtronic.com | ✅ verified (domain resolves) |  |
| Micropoint | 15 | micropointbio.com | ✅ verified (domain resolves) |  |
| Radiometer | 13 | radiometer.com | ✅ verified (domain resolves) |  |
| Bosch | 13 | bosch-vivalytic.com | ✅ verified (domain resolves) |  |
| Aidian | 12 | aidian.eu | ✅ verified (domain resolves) |  |
| Precision Biosensor | 12 | precisionbiosensor.com | ✅ verified (domain resolves) |  |
| Meridian Bioscience | 11 | meridianbioscience.com | ✅ verified (domain resolves) |  |
| Dr. Müller | 11 | dr-mueller-geraetebau.de | ✅ verified (domain resolves) |  |
| Premier Medical | 10 | premiermedcorp.com | ✅ verified (domain resolves) |  |
| PTS Diagnostics | 10 | ptsdiagnostics.com | ✅ verified (domain resolves) |  |
| LumiraDx | 9 | lumiradx.com | ✅ verified (domain resolves) |  |
| LSI Medience | 9 | medience.co.jp | ✅ verified (domain resolves) |  |
| Eurolyser | 9 | eurolyser.com | ✅ verified (domain resolves) |  |
| Haemonetics | 9 | haemonetics.com | ✅ verified (domain resolves) |  |
| Acro Biotech | 8 | acrobiotech.com | ✅ verified (domain resolves) |  |
| Analyticon | 8 | analyticon-diagnostics.com | ✅ verified (domain resolves) |  |
| Pluslife | 8 | pluslife.com | ✅ verified (domain resolves) | Guangzhou Pluslife Biotech Co., Ltd., China (Mini Dock molecular POCT) — confirmed by web search |
| Qualigen | 8 | qualigeninc.com | ✅ verified (domain resolves) |  |
| Human | 8 | human.de | ✅ verified (domain resolves) |  |
| Credo | 7 | credodxbiomed.com | ✅ verified (domain resolves) |  |
| bioMérieux | 7 | biomerieux.com | ✅ verified (domain resolves) |  |
| Macherey-Nagel | 7 | mn-net.com | ✅ verified (domain resolves) |  |
| Servoprax | 7 | servoprax.de | ✅ verified (domain resolves) |  |
| URIT | 7 | urit.com | ✅ verified (domain resolves) |  |
| Bühlmann | 6 | buhlmannlabs.ch | ✅ verified (domain resolves) |  |
| FlashDx | 6 | flashdx.com | ✅ verified (domain resolves) | FlashDx (sSPRT point-of-care PCR) — confirmed by web search |
| J. Mitra | 6 | jmitra.co.in | ✅ verified (domain resolves) |  |
| Actim | 5 | actimtest.com | ✅ verified (domain resolves) |  |
| OPTI Medical | 5 | optimedical.com | ✅ verified (domain resolves) |  |
| Noul | 4 | noul.com | ✅ verified (domain resolves) |  |
| iLine | 4 | ilinemicrosystems.com | ✅ verified (domain resolves) |  |
| MNCHIP | 4 | mnchip.com | ✅ verified (domain resolves) |  |
| DiaSys | 4 | diasys-diagnostics.com | ✅ verified (domain resolves) |  |
| Biosurfit | 4 | biosurfit.com | ✅ verified (domain resolves) |  |
| Nihon Kohden | 3 | nihonkohden.com | ✅ verified (domain resolves) |  |
| 77 Elektronika | 3 | e77.hu | ✅ verified (domain resolves) | 77 Elektronika Kft., Budapest, Hungary (urine analysers, founded 1986) — confirmed by web search |
| Schebo | 3 | schebo.com | ✅ verified (domain resolves) |  |
| Orphée | 3 | orphee-medical.com | ✅ verified (domain resolves) |  |
| HemoSonics | 3 | hemosonics.com | ✅ verified (domain resolves) |  |
| OraSure Technologies | 3 | orasure.com | ✅ verified (domain resolves) |  |
| HiMedia | 3 | himedialabs.com | ✅ verified (domain resolves) |  |
| KH Medical | 2 | khmedical.co.kr | ✅ verified (domain resolves) | KH Medical Co., Ltd., South Korea — maker of RADI PCR kits (WHO EUL 0538-214-00); confirmed by web search |
| Dräger | 2 | draeger.com | ✅ verified (domain resolves) |  |
| Dr. Fooke | 2 | fooke-labs.de | ✅ verified (domain resolves) |  |
| Liofilchem | 2 | liofilchem.com | ✅ verified (domain resolves) |  |
| Essenlix | 2 | essenlix.com | ✅ verified (domain resolves) |  |
| Doasense | 2 | doasense.com | ✅ verified (domain resolves) |  |
| Diesse | 2 | diesse.it | ✅ verified (domain resolves) |  |
| MeMed | 2 | me-med.com | ✅ verified (domain resolves) |  |
| Bonraybio | 2 | bonraybio.com | ✅ verified (domain resolves) |  |
| Apexbio | 2 | apexbio.com.tw | ✅ verified (domain resolves) |  |
| Eschweiler | 2 | eschweiler.com | ✅ verified (domain resolves) |  |
| Hemex Health | 2 | hemexhealth.com | ✅ verified (domain resolves) | Hemex Health, Portland OR (Gazelle reader); source spells it 'Hemax' — confirmed by web search |
| iHealth | 1 | ihealthlabs.com | ✅ verified (domain resolves) |  |
| Trivitron | 1 | trivitron.com | ✅ verified (domain resolves) |  |
| Silver Lake Research | 1 | silverlakeresearch.com | ✅ verified (domain resolves) | Silver Lake Research Corp., Los Angeles/Azusa CA — maker of HemoTypeSC; confirmed by web search |
| Exias Medical | 1 | exias-medical.com | ✅ verified (domain resolves) |  |
| PixCell | 1 | pixcell-medical.com | ✅ verified (domain resolves) |  |
| Lepzi | 1 | lepzi.com | ✅ verified (domain resolves) | Lepzi Diagnostika Ltd (CE-marked BTA test) — confirmed by web search |
| Medcaptain | 1 | medcaptain.com | ✅ verified (domain resolves) |  |
| Dymind | 1 | dymind.com | ✅ verified (domain resolves) |  |
| Medical Electronic Systems | 1 | mes-global.com | ✅ verified (domain resolves) |  |
| Skyla | 1 | skyla.com | ✅ verified (domain resolves) |  |
| Copack | 1 | copack.de | ✅ verified (domain resolves) |  |
| CellaVision | 1 | cellavision.com | ✅ verified (domain resolves) |  |

Brands used by products but missing from brands.yaml: ALTA, Awareness Technology, Eppendorf, Leica BIOSYSTEM, Medica, Philips, Spinreact

Stated brands not in brands.yaml (passed through): Awareness Technology (17), Eppendorf (5), Medica (4), Leica BIOSYSTEM (4), Philips (4), Spinreact (1), ALTA (1)

Products with no brand: Eppendorf Mastercycler X50 - PCR Thermocycler, Qiagenq PCR 384-well plate white, skirted, Eppendorf epMotion 5070 MultiCon PCR Solution, Hepa card, Standrard F HbA1c, Philips EverFlo 5 LPM Oxygen Concentrator, Quantstudio 3 Real Time Pcr System 0.2 mL 96 wells, QIAquant 96 Real time PCR System, LightCycler 96 Real-Time PCR System, Applied Biosystem ProFlex 3 x 32-well PCR System, Philips SimplyGo Mini Portable Oxygen Concentrator, Philips Trilogy EV300 Ventilator, ALTA Nucleic Acid extractor, Forma Steri-Cult CO2 Incubators, Strandard F U-Albumin FIA, KingFisher Flex Purification System King Fisher with 96 PCR Head, SimpliAmp Thermal Cycler

Name-derived brand differs from the brand the source stated (name wins):

- Abbott Alere h 380-3-part differential hematology Analyzer: **Abbott** (source: Abbott Alere)
- Abbott Alere h s 30-3-part differential hematology Analyzer: **Abbott** (source: Abbott Alere)
- Abbott Alere Easy Microplate Washer: **Abbott** (source: Abbott Alere)
- Mindray Wash Buffer: **Mindray** (source: EKF Diagnostics)
- Calbiotech Free Testosterone ELISA: **Calbiotech** (source: InBios)
- ZYBIO EXR 25-OH-VITAMIN-D: **Zybio** (source: Serum/ Plasma/WB)
- ZYBIO EXR T3: **Zybio** (source: Serum/ Plasma/ WB)
- BioRad Mini-PROTEANTGX Precast Protein Gels: **Bio-Rad** (source: Refer Below)
- Mindray CLIA Hormone Calibrator: **Mindray** (source: Calibrator)
- Mindray CLIA Thyroid Calibrator: **Mindray** (source: Calibrator)
- ichroma Beta-HCG Test: **Boditech** (source: Boditech Med Incorporated)
- ichroma FSH Test: **Boditech** (source: Boditech Med Incorporated)
- Mindray CLIA Tumor Calibrator: **Mindray** (source: Calibrator)
- AFIAS 6: **Boditech** (source: Bio Technology Biotech)
- ichroma PRL Test: **Boditech** (source: Boditech Med Incorporated)
- Ichroma Tn-I Plus Test: **Boditech** (source: Boditech Med Incorporated)
- EKF Diagnostics DiaSpect T D24 Hemoglobin Microcuvettes: **EKF Diagnostics** (source: EKFDiagnostics)
- LumiraDx: **LumiraDx** (source: Roche)
- Xprecia Prime: **Siemens Healthineers** (source: Universal Biosensors (OEM/distributor))
- Xprecia Stride: **Siemens Healthineers** (source: Universal Biosensors (OEM/distributor))

## Sanity checks

Automatic fixes applied in `build-data`, and items left for review.

- **Catalogue-number conflicts** (same brand + number on clearly different products — number withheld on all of them until corrected via `overrides.yaml`): 35
  - `55071` — QuidelOrtho Quidel's Triage System / QuidelOrtho Triage Meter Pro
  - `12011319` — Bio-Rad CFX Opus 96 Real-Time PCR System / Bio-Rad CFX Opus 96 Real-Time PCR Instrument 0.2 mL 96 Wells
  - `GXXVI-16-D-10C, GXXVI-16-L-10C` — Cepheid GeneXpertn XVI 16 Module Instrument / Cepheid GeneXpert XVI 16 Module Instrument
  - `15809736` — Fujifilm DRI-CHEM SLIDE HDL-C-P III D / Fujifilm DRI-CHEM SLIDE GGT-P III Biochemistry Reagent Kit
  - `BS-230` — Mindray Clinical Chemistry Analyzer BS-230 / Mindray Clinical Chemistry Analyzer BS-450
  - `BC-5150` — Mindray Auto Hematology Analyzer BC-5150 / Mindray Auto Hematology Analyzer BC-6000
  - `G136-142` — Acon On Call MultiPro ACR / Acon On Call MultiPro CRP
  - `130270001M` — Snibe MAGLUMI GH (CLIA) / Snibe MAGLUMI HA (CLIA)
  - `130211003M` — Snibe MAGLUMI Osteocalcin (CLIA) / Snibe MAGLUMI PAPP-A (CLIA)
  - `A27828` — Thermo Fisher Applied Biosystems MagMAX Dx Prefilled Viral/Pathogen Nucleic Acid Isolation Kit / Thermo Fisher Applied Biosystems MagMAX mirVana Total RNA Isolation Kit
  - `304-08POR` — Medtronic HMS Plus Cartridges - Gold - 1.5-4.0 mg/kg / Medtronic HMS Plus Cartridges - Heparin Dose Response (HDR) - 6-Channel
  - `10500566000, 10500567700` — Mindray B-type natriuretic peptide (CLIA) / Mindray Cancer Antigen 125 (CLIA)
  - `10500566900, 10500568600` — Mindray Neuron-specific enolase (CLIA) / Mindray Parathyroid hormone (CLIA)
  - `130201525M` — Snibe MAGLUMI HE4 (CLIA) / Snibe MAGLUMI H.Pylori IgM CLIA
  - `130212002M` — Snibe MAGLUMI Rubella IgG (CLIA) / Snibe MAGLUMI Toxo IgM (CLIA)
  - `130212006M` — Snibe MAGLUMI CMV IgM (CLIA) / Snibe MAGLUMI HSV 1/2 IgM (CLIA) / Snibe MAGLUMI EPO (CLIA)
  - `130265001M` — Snibe MAGLUMI EBV EA IgG (CLIA) / Snibe MAGLUMI Reaction Cup
  - `501016` — Horiba ABX CRP STD / Horiba Yumizen E60
  - `1300015831` — Horiba ABX Micro es 60 / Horiba ABX Micros ES60
  - `1300036318` — Horiba Yumizen G800 / Horiba Yumizen G800h
  - `44FK30` — Abbott Bioline CHOLERA Ag 01/0139 / Abbott BINAXNOW INFLUENZA A&B CARD
  - `D-DIMER` — Zybio EXC D-Dimer / Zybio EXT D-Dimer Reagent
  - `DCT-A102` — Abbott ABON Urine Test Drug Screen Cassette / Abbott ABON COT One Step Cotinine Test Device Urine
  - `4000073828` — Horiba Anti-TPO (CLIA) / Horiba hs-Troponin I (CLIA)
  - `R0063C` — CTK Biotech OnSite Duo Dengue Ag IgG IgM Rapid Test / CTK Biotech OnSite Dengue Ag Rapid Test / CTK Biotech OnSite Dengue Ag Rapid Test CE
  - `STGS-R` — InBios Scrub Typhus Detect IgG ELISA System / InBios ZIKV Detect 2.0 IgM Capture ELISA
  - `PI05FRC30` — Premier Medical FIRST RESPONSE HIV 1 - 2.0 CARD TEST / Premier Medical FIRST RESPONSE HIV 1-2.0 CARD TEST (SELF TEST)
  - `505796J` — Abbott TESTPACK PLUS WITH OBC STREP A / Abbott DIGIVAL
  - `IF1056` — Getein AMH Fast Test Kit / Getein FSH Fast Test Kit
  - `IF1044` — Getein Anti-HIV Fast Test Kit / Getein E2 Fast Test Kit / Getein SAA Fast Test Kit
  - `CFPC-38` — Boditech ichroma Calprotectin / Boditech ichroma HbA1c
  - `HP015M` — Calbiotech H. Pylori IgM ELISA / Calbiotech HSV-1 IgM ELISA
  - `MP060G` — Calbiotech Mumps IgG ELISA / Calbiotech Mycoplasma IgG ELISA
  - `ST093G` — Calbiotech Salmonella IgG ELISA / Calbiotech Salmonella IgM ELISA
  - `123521` — HemoCue WBC DIFF System / HemoCue Safety Lancets
- **Sample types removed as contradictory** (e.g. a stool sample for an influenza test): 7
  - Abbott BINAXNOW INFLUENZA A&B CARD: removed stool
  - ResistancePlus MG FleXible: removed urine
  - MG,MH, UP/UU: removed urine
  - MG Assay: removed urine
  - MG Assay: removed urine
  - MG Assay: removed urine
  - ResistancePlus MG FleXible: removed urine
- **Out of scope (non-diagnostic) dropped**: 6 — Abbott GRAFTMASTER RX Coronary Stent Graft System (SD 3.5) (keyword "stent"); ARKRAY Insulin Cooling Pouch - Uno Z (keyword "insulin cooling pouch"); ARKRAY Insulin Cooling Pouch - Duo Z for Travel (keyword "insulin cooling pouch"); Bio-Rad Gene Pulser / MicroPulser Electroporation Cuvettes (source category "Medical LAB"); Erba H360 Control (source category "Medical Accesories"); Eppendorf Refrigerated Centrifuge 5425 R (keyword "centrifuge")
- **Untranslated (non-English) text**: 0
- **Very short product names** (≤ 2 letters/digits; shown with brand): 24 — Abbott G, Abbott G3+, Arkray CK, Biosurfit BC, Boditech LH, Boditech T3, Boditech T4, Cepheid GI, Cepheid TV, Concile α1+, Dr. Müller Hb, MeMed BV, OPTI Medical B, Roche Li+, Roche PT, SD Biosensor T3, SD Biosensor T4, Tascom CK, Tascom Hb, Tascom K, Tascom TC, Tascom TG, Vedalab LH, Werfen PT
- **Listings with several catalogue numbers** (pack variants, kept as listed): 73
- **Same-named different products** given a pack-size / Cat. no. suffix: 30
- **Low classification confidence** (< 0.6): 487
  - Arkray Urine test strips AUTION SCREEN (0.59)
  - Awareness Technology ChemWell RPR 5801 (0.33)
  - Awareness Technology ChemWell-T 4620- PC Controlled Chemistry + Turbidmetric Analyzer (0.45)
  - Awareness Technology ChemWell-T 4625 ics- PC Controlled Chemistry + Turbidmetric Analyzer (0.45)
  - Awareness Technology ChemWell 2910- PC Controlled ELISA/ BIOCHEMISTRY ANALYZER (0.59)
  - Fujifilm DRI-CHEM NX700 (0.48)
  - Roche Cobas e 411 Analyzer (0.45)
  - QuidelOrtho Quidel's Triage System (0.45)
  - Erba Mannheim ECL 105 Single Channel Cogulation Analyzer (0.45)
  - Erba Mannheim ECL 760 Seven Channel Fully Automated Random Access Analyzer (0.45)
  - Siemens Healthineers BFT II Analyzer (0.45)
  - Sysmex CA-660 Automated Haemostasis Analyzer (0.45)
  - Awareness Technology Selectalyte 3910- ISE Analyzer (0.45)
  - Erba Mannheim EC 90 Next Generation Electrolyte Analyzer (0.45)
  - Medica EasyLyte Analyzer (0.45)
  - Roche 9180 Electrolyte Analyzer (0.45)
  - Siemens Healthineers RAPIDChem 744/754 Electrolyte and Lithium Testing Analyzers (0.33)
  - Erba Mannheim ESL 30 Fully Automated walk-away System (0.45)
  - Medica EasyBloodGas Analyzer (0.45)
  - Leica BIOSYSTEM HistoCore AUTOCUT (0.33)
  - Leica BIOSYSTEM HistoCore BIOCUT (0.33)
  - Leica BIOSYSTEM HistoCore MULTICUT (0.33)
  - Abbott Easy Microplate Washer (0.33)
  - Abbott Easy Reader (0.45)
  - Awareness Technology ChemWell Fusion- 4800 PC Controlled EIA and CLIA Combination Analyzer (0.59)
  - Awareness Technology Chromate 4300- PC Controlled Microplate Washer (0.33)
  - Awareness Technology LuMate 4400-PC Controlled Microplate Luminometer (0.33)
  - Awareness Technology Stat Fax 2200- Digital Dry Bath (0.33)
  - Awareness Technology Stat Fax 2600- Automatic Microplate Washer (0.33)
  - Awareness Technology Stat Fax 4200 - Stand-alone Microplate Reader (0.45)

## Deduplication

Listings are grouped by brand + normalised name (spelling, punctuation, plurals, pack sizes, word order ignored). Same brand + same catalogue number also groups spelling variants, unless the names differ in a distinguishing word (IgG/IgM/Ag/Ab/Duo/Combo/Self) or the analytes differ. Instruments and reagents are never merged; different catalogue numbers are never merged.

Possible duplicates for review (same brand, ≥ 80% name overlap, same or unknown catalogue number, not merged): **36**

| Product A | Product B | Overlap |
| --- | --- | ---: |
| `thermo-fisher-quantstudio-5-real-time-pcr-system-96-well` | `thermo-fisher-quantstudio-5-real-time-pcr-system-f8b21b` | 100% |
| `werfen-blood-gas-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gas-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 91% |
| `werfen-blood-gases-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gases-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 91% |
| `bio-rad-c1000-touch-thermal-cycler-with-96-well-fast-reaction-module` | `bio-rad-c1000-touch-thermal-cycler-with-96-well-fast-reaction-module-1851196` | 90% |
| `thermo-fisher-applied-biosystems-microamp-fast-optical-96-well-reaction-plate` | `thermo-fisher-applied-biosystems-microamp-optical-96-well-reaction-plate` | 89% |
| `boditech-afias-covid-19-flu-a-plus-b-rsv-ag` | `boditech-covid-19-flu-a-plus-b-rsv-ag-0b251a` | 86% |
| `boditech-covid-19-flu-a-plus-b-rsv-ag` | `boditech-covid-19-flu-a-plus-b-rsv-ag-0b251a` | 86% |
| `cepheid-xpert-xpress-cov-2-flu-rsv-plus` | `cepheid-xpress-cov-2-flu-rsv-plus` | 86% |
| `roche-bg-plus-hct-plus-electrolytes-plus-glu-plus-lac` | `roche-bg-plus-hct-plus-electrolytes-plus-glu-plus-lac-plus-coox` | 86% |
| `sd-biosensor-standard-i-q-covid-flu-ag-combo-test` | `sd-biosensor-standard-q-covid-flu-ag-combo` | 86% |
| `thermo-fisher-7500-fast-dx-real-time-pcr-system` | `thermo-fisher-7500-thermo-fisher-fast-real-time-pcr-system` | 86% |
| `werfen-blood-gas-electrolytes-glu-lac-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gases-electrolytes-glu-lac-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 86% |
| `werfen-blood-gas-electrolytes-glu-lac-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gas-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 85% |
| `werfen-blood-gases-electrolytes-glu-lac-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gases-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 85% |
| `bio-rad-mini-proteantgx-precast-protein-gels` | `bio-rad-mini-proteantgx-precast-protein-gels-12` | 83% |
| `boditech-afias-thyroid-stimulating-hormone-tsh` | `boditech-afias-thyroid-stimulating-hormone-tsh-plus` | 83% |
| `inbios-scrub-typhus-detect-igg-elisa-kit` | `inbios-scrub-typhus-detect-igg-elisa-system` | 83% |
| `mindray-total-beta-human-chorionic-gonadotropin-clia` | `mindray-total-human-chorionic-gonadotropin-clia` | 83% |
| `premier-medical-first-response-syphilis-anti-tp-card-test-f2d9bd` | `premier-medical-first-response-syphilis-anti-tp-cardtest` | 83% |
| `qiagen-repli-g-single-cell-kit-96` | `qiagen-repli-g-wta-single-cell-kit-96` | 83% |
| `thermo-fisher-countess-3-automated-cell-counter` | `thermo-fisher-invitrogen-countess-3-automated-cell-counter` | 83% |
| `werfen-blood-gas-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gases-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 83% |
| `werfen-blood-gas-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gases-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 82% |
| `acon-on-call-plus-glucometer` | `acon-on-call-plus-glucometer-test-strips` | 80% |
| `acro-biotech-juschek-alcohol-alc-rapid-test-dipstick` | `acro-biotech-juschek-alcohol-alc-rapid-test-dipstick-saliva` | 80% |
| `calbiotech-hsv-1-and-2-igm-elisa` | `calbiotech-hsv-1-igm-elisa` | 80% |
| `edan-i15-blood-gas-and-analyzer` | `edan-i15-blood-gas-and-chemistry-analyzer` | 80% |
| `ekf-diagnostics-biosen-hemolyzing-solution-cups-with-20-l-end-to-end-capillaries` | `ekf-diagnostics-hemolyzing-solution-cups-with-20-l-end-to-end-capillaries-plastic-capillaries` | 80% |
| `inbios-scrub-typhus-detect-igg-elisa-kit` | `inbios-scrub-typhus-detect-igg-rapid-test` | 80% |
| `inbios-scrub-typhus-detect-igm-elisa-kit` | `inbios-scrub-typhus-detect-igm-rapid-test` | 80% |
| `qiagen-qiawave-rna-mini-kit-250` | `qiagen-qiawave-rna-plus-mini-kit-250` | 80% |
| `sd-biosensor-standard-q-covid-19-ag` | `sd-biosensor-standard-q-covid-19-ag-nasal` | 80% |
| `sd-biosensor-standard-q-covid-19-ag` | `sd-biosensor-standard-q-covid-19-ag-nasopharyngeal` | 80% |
| `siemens-healthineers-rapidlab-348ex-blood-gas-system` | `siemens-healthineers-rapidlab-blood-gas-system` | 80% |
| `wondfo-finecare-fia-meter-iii-plus` | `wondfo-finecare-fia-meter-plus` | 80% |
| `wondfo-finecare-fia-meter-lll-plus` | `wondfo-finecare-fia-meter-plus` | 80% |

## Missing data

A listing is **complete** when it has every field required for its type. All: brand, category, technology, summary, ≥ 2 spec rows. Tests/reagents also: product type, analyte, sample type, catalogue number, pack size. Instruments also: analyte, catalogue number. Consumables also: catalogue number, pack size.

| Field | Required for | Missing | % of those listings |
| --- | ---: | ---: | ---: |
| brand | 3184 | 17 | 0.5% |
| category | 3184 | 454 | 14.3% |
| technology | 3184 | 451 | 14.2% |
| summary | 3184 | 120 | 3.8% |
| specs | 3184 | 121 | 3.8% |
| product_type | 2656 | 398 | 15.0% |
| analyte | 3138 | 908 | 28.9% |
| sample_type | 2656 | 565 | 21.3% |
| catalogue_no | 3184 | 1593 | 50.0% |
| pack_size | 2702 | 1549 | 57.3% |

Listings by number of missing fields:

| Missing fields | Listings |
| ---: | ---: |
| 0 | 664 |
| 1 | 716 |
| 2 | 1055 |
| 3 | 301 |
| 4 | 172 |
| 5 | 87 |
| 6 | 79 |
| 7 | 63 |
| 8 | 20 |
| 9 | 21 |
| 10 | 6 |

Note: the second source publishes no catalogue numbers or pack sizes, so most of its listings miss exactly those two fields. Add them by hand (`data/manual/`) or from another source to raise completeness.

### Incomplete listings by source

| Source | Listings | Incomplete | % |
| --- | ---: | ---: | ---: |
| src-a | 2112 | 1459 | 69.1% |
| src-b | 1097 | 1071 | 97.6% |

### Incomplete listings by category

| Category | Listings | Incomplete | % |
| --- | ---: | ---: | ---: |
| clinical-chemistry | 617 | 579 | 93.8% |
| immunoassays | 914 | 515 | 56.3% |
| general | 454 | 454 | 100.0% |
| molecular | 346 | 341 | 98.6% |
| rapid-tests | 296 | 152 | 51.4% |
| hematology | 142 | 122 | 85.9% |
| urinalysis | 113 | 108 | 95.6% |
| blood-gas | 114 | 100 | 87.7% |
| coagulation | 96 | 86 | 89.6% |
| diabetes | 84 | 55 | 65.5% |
| microbiology | 8 | 8 | 100.0% |

### Incomplete listings by product type

| Product type | Listings | Incomplete | % |
| --- | ---: | ---: | ---: |
| reagent | 2215 | 1624 | 73.3% |
| instrument | 482 | 418 | 86.7% |
| (unknown) | 398 | 398 | 100.0% |
| consumable | 46 | 41 | 89.1% |
| control | 43 | 39 | 90.7% |

### Incomplete listings by brand

| Brand | Listings | Incomplete | % |
| --- | ---: | ---: | ---: |
| Qiagen | 135 | 135 | 100.0% |
| Thermo Fisher | 131 | 125 | 95.4% |
| Arkray | 130 | 123 | 94.6% |
| Boditech | 161 | 116 | 72.0% |
| Abbott | 195 | 114 | 58.5% |
| Snibe | 177 | 102 | 57.6% |
| SD Biosensor | 152 | 99 | 65.1% |
| Mindray | 121 | 95 | 78.5% |
| Roche | 111 | 94 | 84.7% |
| Zybio | 125 | 89 | 71.2% |
| Erba Mannheim | 115 | 81 | 70.4% |
| Cepheid | 62 | 62 | 100.0% |
| Fujifilm | 61 | 59 | 96.7% |
| Horiba | 70 | 53 | 75.7% |
| Siemens Healthineers | 59 | 51 | 86.4% |
| Becton Dickinson | 49 | 49 | 100.0% |
| Bio-Rad | 45 | 43 | 95.6% |
| Calbiotech | 98 | 43 | 43.9% |
| Vedalab | 43 | 43 | 100.0% |
| QuidelOrtho | 41 | 41 | 100.0% |
| Acon | 52 | 38 | 73.1% |
| HemoCue | 42 | 35 | 83.3% |
| Werfen | 35 | 35 | 100.0% |
| Beckman Coulter | 67 | 32 | 47.8% |
| Molbio | 30 | 30 | 100.0% |
| EDAN | 31 | 29 | 93.5% |
| Seamaty | 27 | 27 | 100.0% |
| Ustar | 27 | 27 | 100.0% |
| Concile | 26 | 26 | 100.0% |
| NAL von minden | 29 | 26 | 89.7% |
| EKF Diagnostics | 29 | 24 | 82.8% |
| Bioantibody | 23 | 23 | 100.0% |
| Nova Biomedical | 23 | 23 | 100.0% |
| CTK Biotech | 49 | 22 | 44.9% |
| Hitado | 20 | 20 | 100.0% |
| Sysmex | 20 | 20 | 100.0% |
| Wondfo | 56 | 18 | 32.1% |
| (no brand) | 17 | 17 | 100.0% |
| Awareness Technology | 17 | 17 | 100.0% |
| Coyote | 17 | 17 | 100.0% |

Full list: [`docs/missing-data.csv`](missing-data.csv) — one row per incomplete listing.

