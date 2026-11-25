# Data quality report

Generated 2026-11-25 from `data/products.json`.

## Summary

| Metric | Value |
| --- | ---: |
| Listings (records) | 2413 |
| Canonical products | 2333 |
| Flagged duplicate listings (hidden, redirect) | 80 |
| Duplicate groups | 75 |
| Cross-source merges | 22 |
| Complete listings (all required fields) | 618 (26.5%) |
| Incomplete listings | 1715 (73.5%) |
| Complete on core facts (ignoring catalogue no. & pack size) | 1777 (76.2%) |
| Brands in catalogue | 111 |
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
| Abbott | 191 | abbott.com | ✅ verified (domain resolves) |  |
| Snibe | 163 | snibe.com | ✅ verified (domain resolves) |  |
| Boditech | 161 | boditech.co.kr | ✅ verified (domain resolves) |  |
| SD Biosensor | 150 | sdbiosensor.com | ✅ verified (domain resolves) |  |
| Arkray | 104 | arkray.co.jp | ✅ verified (domain resolves) |  |
| Calbiotech | 98 | calbiotech.com | ✅ verified (domain resolves) |  |
| Roche | 96 | roche.com | ✅ verified (domain resolves) |  |
| Zybio | 63 | zybio.com | ✅ verified (domain resolves) |  |
| Getein | 58 | getein.com.cn | ✅ verified (domain resolves) |  |
| CTK Biotech | 49 | ctkbiotech.com | ✅ verified (domain resolves) |  |
| Wondfo | 48 | wondfo.com | ✅ verified (domain resolves) |  |
| Acon | 48 | aconlabs.com | ✅ verified (domain resolves) |  |
| Beckman Coulter | 46 | beckmancoulter.com | ✅ verified (domain resolves) |  |
| Siemens Healthineers | 45 | siemens-healthineers.com | ✅ verified (domain resolves) |  |
| Mindray | 43 | mindray.com | ✅ verified (domain resolves) |  |
| Vedalab | 43 | vedalab.com | ✅ verified (domain resolves) |  |
| HemoCue | 42 | hemocue.com | ✅ verified (domain resolves) |  |
| Werfen | 35 | werfen.com | ✅ verified (domain resolves) |  |
| Horiba | 34 | horiba.com | ✅ verified (domain resolves) |  |
| Cepheid | 33 | cepheid.com | ✅ verified (domain resolves) |  |
| EDAN | 31 | edan.com | ✅ verified (domain resolves) |  |
| QuidelOrtho | 31 | quidelortho.com | ✅ verified (domain resolves) |  |
| Fujifilm | 30 | fujifilm.com | ✅ verified (domain resolves) |  |
| Molbio | 29 | molbiodiagnostics.com | ✅ verified (domain resolves) |  |
| EKF Diagnostics | 29 | ekfdiagnostics.com | ✅ verified (domain resolves) |  |
| NAL von minden | 29 | nal-vonminden.com | ✅ verified (domain resolves) |  |
| Ustar | 27 | bioustar.com | ✅ verified (domain resolves) |  |
| Seamaty | 27 | seamaty.com | ✅ verified (domain resolves) |  |
| Concile | 26 | concile.de | ✅ verified (domain resolves) |  |
| Nova Biomedical | 23 | novabiomedical.com | ✅ verified (domain resolves) |  |
| Bioantibody | 23 | bioantibody.com | ✅ verified (domain resolves) |  |
| InBios | 21 | inbios.com | ✅ verified (domain resolves) |  |
| Hitado | 20 | hitado.de | ✅ verified (domain resolves) |  |
| Coyote | 17 | coyotebio.com | ✅ verified (domain resolves) |  |
| Medtronic | 17 | medtronic.com | ✅ verified (domain resolves) |  |
| Micropoint | 15 | micropointbio.com | ✅ verified (domain resolves) |  |
| Erba Mannheim | 14 | erbamannheim.com | ✅ verified (domain resolves) |  |
| Radiometer | 13 | radiometer.com | ✅ verified (domain resolves) |  |
| Bosch | 13 | bosch-vivalytic.com | ✅ verified (domain resolves) |  |
| Aidian | 12 | aidian.eu | ✅ verified (domain resolves) |  |
| Precision Biosensor | 12 | precisionbiosensor.com | ✅ verified (domain resolves) |  |
| Thermo Fisher | 11 | thermofisher.com | ✅ verified (domain resolves) |  |
| Meridian Bioscience | 11 | meridianbioscience.com | ✅ verified (domain resolves) |  |
| Dr. Müller | 11 | dr-mueller-geraetebau.de | ✅ verified (domain resolves) |  |
| Sysmex | 11 | sysmex.com | ✅ verified (domain resolves) |  |
| Premier Medical | 10 | premiermedcorp.com | ✅ verified (domain resolves) |  |
| PTS Diagnostics | 10 | ptsdiagnostics.com | ✅ verified (domain resolves) |  |
| Qiagen | 9 | qiagen.com | ✅ verified (domain resolves) |  |
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
| Macherey-Nagel | 7 | mn-net.com | ✅ verified (domain resolves) |  |
| Servoprax | 7 | servoprax.de | ✅ verified (domain resolves) |  |
| URIT | 7 | urit.com | ✅ verified (domain resolves) |  |
| Becton Dickinson | 6 | bd.com | ✅ verified (domain resolves) |  |
| Bühlmann | 6 | buhlmannlabs.ch | ✅ verified (domain resolves) |  |
| FlashDx | 6 | flashdx.com | ✅ verified (domain resolves) | FlashDx (sSPRT point-of-care PCR) — confirmed by web search |
| J. Mitra | 6 | jmitra.co.in | ✅ verified (domain resolves) |  |
| Actim | 5 | actimtest.com | ✅ verified (domain resolves) |  |
| OPTI Medical | 5 | optimedical.com | ✅ verified (domain resolves) |  |
| bioMérieux | 4 | biomerieux.com | ✅ verified (domain resolves) |  |
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
| Bio-Rad | 1 | bio-rad.com | ✅ verified (domain resolves) |  |
| Copack | 1 | copack.de | ✅ verified (domain resolves) |  |
| CellaVision | 1 | cellavision.com | ✅ verified (domain resolves) |  |

Products with no brand: Hepa card, Standrard F HbA1c, Strandard F U-Albumin FIA

Name-derived brand differs from the brand the source stated (name wins):

- Mindray Wash Buffer: **Mindray** (source: EKF Diagnostics)
- Calbiotech Free Testosterone ELISA: **Calbiotech** (source: InBios)
- ZYBIO EXR 25-OH-VITAMIN-D: **Zybio** (source: Serum/ Plasma/WB)
- ZYBIO EXR T3: **Zybio** (source: Serum/ Plasma/ WB)
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

- **Catalogue-number conflicts** (same brand + number on clearly different products — number withheld on all of them until corrected via `overrides.yaml`): 24
  - `G136-142` — Acon On Call MultiPro ACR / Acon On Call MultiPro CRP
  - `130270001M` — Snibe MAGLUMI GH (CLIA) / Snibe MAGLUMI HA (CLIA)
  - `130211003M` — Snibe MAGLUMI Osteocalcin (CLIA) / Snibe MAGLUMI PAPP-A (CLIA)
  - `304-08POR` — Medtronic HMS Plus Cartridges - Gold - 1.5-4.0 mg/kg / Medtronic HMS Plus Cartridges - Heparin Dose Response (HDR) - 6-Channel
  - `10500566000, 10500567700` — Mindray B-type natriuretic peptide (CLIA) / Mindray Cancer Antigen 125 (CLIA)
  - `10500566900, 10500568600` — Mindray Neuron-specific enolase (CLIA) / Mindray Parathyroid hormone (CLIA)
  - `130201525M` — Snibe MAGLUMI HE4 (CLIA) / Snibe MAGLUMI H.Pylori IgM CLIA
  - `130212002M` — Snibe MAGLUMI Rubella IgG (CLIA) / Snibe MAGLUMI Toxo IgM (CLIA)
  - `130212006M` — Snibe MAGLUMI CMV IgM (CLIA) / Snibe MAGLUMI HSV 1/2 IgM (CLIA) / Snibe MAGLUMI EPO (CLIA)
  - `130265001M` — Snibe MAGLUMI EBV EA IgG (CLIA) / Snibe MAGLUMI Reaction Cup
  - `44FK30` — Abbott Bioline CHOLERA Ag 01/0139 / Abbott BINAXNOW INFLUENZA A&B CARD
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
- **Out of scope (non-diagnostic) dropped**: 4 — ARKRAY Insulin Cooling Pouch - Uno Z (keyword "insulin cooling pouch"); ARKRAY Insulin Cooling Pouch - Duo Z for Travel (keyword "insulin cooling pouch"); Bio-Rad Gene Pulser / MicroPulser Electroporation Cuvettes (source category "Medical LAB"); Erba H360 Control (source category "Medical Accesories")
- **Untranslated (non-English) text**: 0
- **Very short product names** (≤ 2 letters/digits; shown with brand): 24 — Abbott G, Abbott G3+, Arkray CK, Biosurfit BC, Boditech LH, Boditech T3, Boditech T4, Cepheid GI, Cepheid TV, Concile α1+, Dr. Müller Hb, MeMed BV, OPTI Medical B, Roche Li+, Roche PT, SD Biosensor T3, SD Biosensor T4, Tascom CK, Tascom Hb, Tascom K, Tascom TC, Tascom TG, Vedalab LH, Werfen PT
- **Listings with several catalogue numbers** (pack variants, kept as listed): 53
- **Same-named different products** given a pack-size / Cat. no. suffix: 26
- **Low classification confidence** (< 0.6): 84
  - Arkray Urine test strips AUTION SCREEN (0.59)
  - Snibe Maglumi 2000 Plus Chemiluminescence Immunoassay (CLIA) System (0.59)
  - Snibe Maglumi 600 Chemiluminescence Immunoassay (CLIA) System (0.59)
  - Snibe Maglumi 800 Chemiluminescence Immunoassay (CLIA) System (0.59)
  - Snibe MAGLUMI X3 Fully-auto Chemiluminescence Immunoassay (CLIA) System (0.59)
  - Snibe MAGLUMI X6 Fully-auto Chemiluminescence Immunoassay (CLIA) System (0.59)
  - Snibe MAGLUMI X8 Fully-auto Chemiluminescence Immunoassay (CLIA) System (0.59)
  - Acon On Call MultiPro ACR (0.59)
  - Acon On Call MultiPro CRP (0.59)
  - Arkray Orinalyser U500 (0.48)
  - Medtronic HMS Plus Cartridges - Heparin Dose Response (HDR) - 6-Channel (0.59)
  - URIT PFS - 30 Lipid Meter (0.56)
  - Qiagen Filter-Tips, 1000 µl (0.44)
  - Arkray Blood Lactate Meter Lactate Pro 2 LT-1730 (0.56)
  - Arkray Trustcheck BPM 3.0 Digital Blood Pressure Monitor (0.33)
  - Erba Mannheim DekaPHAN LAURA (0.53)
  - Snibe MAGLUMI Starter 1+2 (0.57)
  - SD Biosensor G6PD CONTROL (0.57)
  - Snibe MAGLUMI Reaction Cup (0.57)
  - Snibe MAGLUMI Light Check (0.57)
  - Horiba ABX CRP STD (0.44)
  - Horiba ABX Miniclean (0.33)
  - Horiba ABX Minidil LMG (0.53)
  - Horiba CRP Unit 50 (0.59)
  - EKF Diagnostics Chip sensor glucose (type II) (0.54)
  - EDAN BC4 i15 Test Cartridge (0.44)
  - EDAN BG3 i15 Test Cartridge (0.44)
  - EDAN BG4 i15 Test Cartridge (0.44)
  - EDAN BG9 i15 Test Cartridge (0.59)
  - EDAN CP50 i15 calibrant fluid pack (0.54)

## Deduplication

Listings are grouped by brand + normalised name (spelling, punctuation, plurals, pack sizes, word order ignored). Same brand + same catalogue number also groups spelling variants, unless the names differ in a distinguishing word (IgG/IgM/Ag/Ab/Duo/Combo/Self) or the analytes differ. Instruments and reagents are never merged; different catalogue numbers are never merged.

Possible duplicates for review (same brand, ≥ 80% name overlap, same or unknown catalogue number, not merged): **25**

| Product A | Product B | Overlap |
| --- | --- | ---: |
| `werfen-blood-gas-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gas-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 91% |
| `werfen-blood-gases-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gases-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 91% |
| `boditech-afias-covid-19-flu-a-plus-b-rsv-ag` | `boditech-covid-19-flu-a-plus-b-rsv-ag-0b251a` | 86% |
| `boditech-covid-19-flu-a-plus-b-rsv-ag` | `boditech-covid-19-flu-a-plus-b-rsv-ag-0b251a` | 86% |
| `roche-bg-plus-hct-plus-electrolytes-plus-glu-plus-lac` | `roche-bg-plus-hct-plus-electrolytes-plus-glu-plus-lac-plus-coox` | 86% |
| `sd-biosensor-standard-i-q-covid-flu-ag-combo-test` | `sd-biosensor-standard-q-covid-flu-ag-combo` | 86% |
| `werfen-blood-gas-electrolytes-glu-lac-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gases-electrolytes-glu-lac-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 86% |
| `werfen-blood-gas-electrolytes-glu-lac-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gas-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 85% |
| `werfen-blood-gases-electrolytes-glu-lac-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gases-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 85% |
| `boditech-afias-thyroid-stimulating-hormone-tsh` | `boditech-afias-thyroid-stimulating-hormone-tsh-plus` | 83% |
| `inbios-scrub-typhus-detect-igg-elisa-kit` | `inbios-scrub-typhus-detect-igg-elisa-system` | 83% |
| `premier-medical-first-response-syphilis-anti-tp-card-test-f2d9bd` | `premier-medical-first-response-syphilis-anti-tp-cardtest` | 83% |
| `werfen-blood-gas-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gases-electrolytes-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 83% |
| `werfen-blood-gas-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | `werfen-blood-gases-hct-thb-o2hb-hhb-cohb-methb-so2-tbili` | 82% |
| `acon-on-call-plus-glucometer` | `acon-on-call-plus-glucometer-test-strips` | 80% |
| `acro-biotech-juschek-alcohol-alc-rapid-test-dipstick` | `acro-biotech-juschek-alcohol-alc-rapid-test-dipstick-saliva` | 80% |
| `calbiotech-hsv-1-and-2-igm-elisa` | `calbiotech-hsv-1-igm-elisa` | 80% |
| `edan-i15-blood-gas-and-analyzer` | `edan-i15-blood-gas-and-chemistry-analyzer` | 80% |
| `ekf-diagnostics-biosen-hemolyzing-solution-cups-with-20-l-end-to-end-capillaries` | `ekf-diagnostics-hemolyzing-solution-cups-with-20-l-end-to-end-capillaries-plastic-capillaries` | 80% |
| `inbios-scrub-typhus-detect-igg-elisa-kit` | `inbios-scrub-typhus-detect-igg-rapid-test` | 80% |
| `inbios-scrub-typhus-detect-igm-elisa-kit` | `inbios-scrub-typhus-detect-igm-rapid-test` | 80% |
| `sd-biosensor-standard-q-covid-19-ag` | `sd-biosensor-standard-q-covid-19-ag-nasal` | 80% |
| `sd-biosensor-standard-q-covid-19-ag` | `sd-biosensor-standard-q-covid-19-ag-nasopharyngeal` | 80% |
| `wondfo-finecare-fia-meter-iii-plus` | `wondfo-finecare-fia-meter-plus` | 80% |
| `wondfo-finecare-fia-meter-lll-plus` | `wondfo-finecare-fia-meter-plus` | 80% |

## Missing data

A listing is **complete** when it has every field required for its type. All: brand, category, technology, summary, ≥ 2 spec rows. Tests/reagents also: product type, analyte, sample type, catalogue number, pack size. Instruments also: analyte, catalogue number. Consumables also: catalogue number, pack size.

| Field | Required for | Missing | % of those listings |
| --- | ---: | ---: | ---: |
| brand | 2333 | 3 | 0.1% |
| category | 2333 | 86 | 3.7% |
| technology | 2333 | 83 | 3.6% |
| summary | 2333 | 13 | 0.6% |
| specs | 2333 | 40 | 1.7% |
| product_type | 2004 | 66 | 3.3% |
| analyte | 2318 | 347 | 15.0% |
| sample_type | 2004 | 199 | 9.9% |
| catalogue_no | 2333 | 1293 | 55.4% |
| pack_size | 2019 | 1181 | 58.5% |

Listings by number of missing fields:

| Missing fields | Listings |
| ---: | ---: |
| 0 | 618 |
| 1 | 540 |
| 2 | 927 |
| 3 | 145 |
| 4 | 70 |
| 5 | 16 |
| 6 | 1 |
| 7 | 12 |
| 8 | 4 |

Note: the second source publishes no catalogue numbers or pack sizes, so most of its listings miss exactly those two fields. Add them by hand (`data/manual/`) or from another source to raise completeness.

### Incomplete listings by source

| Source | Listings | Incomplete | % |
| --- | ---: | ---: | ---: |
| src-b | 1097 | 1072 | 97.7% |
| src-a | 1258 | 651 | 51.7% |

### Incomplete listings by category

| Category | Listings | Incomplete | % |
| --- | ---: | ---: | ---: |
| immunoassays | 885 | 487 | 55.0% |
| clinical-chemistry | 424 | 414 | 97.6% |
| molecular | 201 | 197 | 98.0% |
| rapid-tests | 293 | 151 | 51.5% |
| urinalysis | 112 | 107 | 95.5% |
| blood-gas | 108 | 97 | 89.8% |
| general | 86 | 86 | 100.0% |
| hematology | 80 | 64 | 80.0% |
| coagulation | 67 | 58 | 86.6% |
| diabetes | 74 | 51 | 68.9% |
| microbiology | 3 | 3 | 100.0% |

### Incomplete listings by product type

| Product type | Listings | Incomplete | % |
| --- | ---: | ---: | ---: |
| reagent | 1911 | 1349 | 70.6% |
| instrument | 314 | 263 | 83.8% |
| (unknown) | 66 | 66 | 100.0% |
| control | 27 | 26 | 96.3% |
| consumable | 15 | 11 | 73.3% |

### Incomplete listings by brand

| Brand | Listings | Incomplete | % |
| --- | ---: | ---: | ---: |
| Boditech | 161 | 116 | 72.0% |
| Abbott | 191 | 110 | 57.6% |
| Arkray | 104 | 99 | 95.2% |
| SD Biosensor | 150 | 99 | 66.0% |
| Snibe | 163 | 90 | 55.2% |
| Roche | 96 | 80 | 83.3% |
| Calbiotech | 98 | 43 | 43.9% |
| Vedalab | 43 | 43 | 100.0% |
| Siemens Healthineers | 45 | 38 | 84.4% |
| HemoCue | 42 | 35 | 83.3% |
| Werfen | 35 | 35 | 100.0% |
| Acon | 48 | 34 | 70.8% |
| Cepheid | 33 | 33 | 100.0% |
| QuidelOrtho | 31 | 31 | 100.0% |
| EDAN | 31 | 29 | 93.5% |
| Molbio | 29 | 29 | 100.0% |
| Fujifilm | 30 | 28 | 93.3% |
| Seamaty | 27 | 27 | 100.0% |
| Ustar | 27 | 27 | 100.0% |
| Zybio | 63 | 27 | 42.9% |
| Concile | 26 | 26 | 100.0% |
| NAL von minden | 29 | 26 | 89.7% |
| EKF Diagnostics | 29 | 24 | 82.8% |
| Bioantibody | 23 | 23 | 100.0% |
| Nova Biomedical | 23 | 23 | 100.0% |
| CTK Biotech | 49 | 22 | 44.9% |
| Mindray | 43 | 22 | 51.2% |
| Hitado | 20 | 20 | 100.0% |
| Coyote | 17 | 17 | 100.0% |
| Horiba | 34 | 17 | 50.0% |
| InBios | 21 | 16 | 76.2% |
| Medtronic | 17 | 16 | 94.1% |
| Tascom | 16 | 16 | 100.0% |
| Micropoint | 15 | 15 | 100.0% |
| Beckman Coulter | 46 | 13 | 28.3% |
| Bosch | 13 | 13 | 100.0% |
| Radiometer | 13 | 13 | 100.0% |
| Aidian | 12 | 12 | 100.0% |
| Getein | 58 | 12 | 20.7% |
| Precision Biosensor | 12 | 12 | 100.0% |

Full list: [`docs/missing-data.csv`](missing-data.csv) — one row per incomplete listing.

