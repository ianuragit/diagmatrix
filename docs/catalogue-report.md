
## Source `src-a`

- Nav entries: 3234
- Parsed records: 141
- Parse failures: 3093

### Categories

| Category | In nav | Parsed |
|---|---:|---:|
| Medical Reagents | 550 | 0 |
| Medical CLIA | 329 | 0 |
| Medical POCT | 311 | 1 |
| Medical FIA | 311 | 0 |
| Medical LAB | 310 | 0 |
| Medical Accesories | 302 | 0 |
| Medical Analyzer | 265 | 1 |
| Life Sciences | 237 | 0 |
| Medical Surgicals | 171 | 0 |
| Medical ELISA | 170 | 1 |
| Medical RTD | 150 | 55 |
| Medical IVD | 82 | 82 |
| Medical Consumables | 46 | 1 |

### Field coverage

| Field | Records | % |
|---|---:|---:|
| brand (stated) | 110 | 78.0% |
| catalogue_no | 111 | 78.7% |
| fact table | 112 | 79.4% |
| spec rows | 139 | 98.6% |
| image | 141 | 100.0% |
| documents | 0 | 0.0% |
| components | 0 | 0.0% |
| related (source-linked) | 0 | 0.0% |
| description | 140 | 99.3% |

Top fact-table keys: Brand (110), Sample Type (102), Pack Size (100), CAT No (78), CAT No. (26), Number of Reactions(Preps)/Kit (9), Result Time (Rapid Kits) (7), Cat. No (6), Usage/Application (4), Application (2), Storage Temperature (2), Results (2), Certified (2), Model (1), Capacity (1)

### Sample records

```json
{
  "source": "src-a",
  "fetched_at": "2026-11-24T20:57:19.662Z",
  "name": "Acon Flowflex SARS-CoV-2 Antigen Rapid Test",
  "category": "Medical RTD",
  "subcategory": null,
  "brand": null,
  "catalogue_no": null,
  "facts": {},
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 33,
  "specs_preview": {
    "Measurement Range": "Qualitative: Positive/Negative",
    "Function": "Detects nucleocapsid protein antigen from SARS-CoV-2",
    "Storage Instructions": "Store at 2C30C, avoid direct sunlight, do not freeze",
    "Technology": "Lateral Flow Immunoassay"
  },
  "description_chars": 1435
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-24T20:48:46.392Z",
  "name": "Mindray Clinical Chemistry Analyzer BS-230",
  "category": "Medical Analyzer",
  "subcategory": null,
  "brand": "Mindray",
  "catalogue_no": "BS-230",
  "facts": {
    "Brand": "Mindray",
    "Model": "BS-230",
    "Capacity": "200 Test/Hr",
    "CAT No": "BS-230",
    "Application": "Biochemistry"
  },
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 0,
  "specs_preview": {},
  "description_chars": 1336
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-24T20:48:47.418Z",
  "name": "Qiagen Filter-Tips, 1000 l",
  "category": "Medical Consumables",
  "subcategory": null,
  "brand": null,
  "catalogue_no": null,
  "facts": {},
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 0,
  "specs_preview": {},
  "description_chars": 1703
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-24T20:48:48.351Z",
  "name": "EDAN i15 control level -1",
  "category": "Medical POCT",
  "subcategory": null,
  "brand": "EDAN",
  "catalogue_no": "83.67.241310",
  "facts": {
    "Brand": "EDAN",
    "Pack Size": "5 2.5ml",
    "CAT No.": "83.67.241310",
    "Application": "Control"
  },
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 6,
  "specs_preview": {
    "Wall Mounted": "No",
    "Noise Level": "No",
    "Use": "Labouratory",
    "Usage Type": "Hospital and Lab"
  },
  "description_chars": 196
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-24T20:54:35.023Z",
  "name": "Abbott ABON COT One Step Cotinine Test Device Urine",
  "category": "Medical IVD",
  "subcategory": null,
  "brand": "Abbott",
  "catalogue_no": "DCT-A102",
  "facts": {
    "Brand": "Abbott",
    "Sample Type": "Urine",
    "Pack Size": "40T",
    "CAT No": "DCT-A102"
  },
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 27,
  "specs_preview": {
    "Real-Time Operation": "Yes",
    "Usage Type": "Single use",
    "Technology": "Immunochromatographic assay",
    "Weight": "Approx. 10 grams per device"
  },
  "description_chars": 959
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-24T20:48:45.436Z",
  "name": "Calbiotech Free Testosterone ELISA",
  "category": "Medical ELISA",
  "subcategory": null,
  "brand": "InBios",
  "catalogue_no": "FT178S",
  "facts": {
    "Brand": "InBios",
    "Sample Type": "Serum/ Plasma",
    "Pack Size": "96 Wells",
    "CAT No.": "FT178S"
  },
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 6,
  "specs_preview": {
    "Portable": "Yes",
    "Condition": "New",
    "Wall Mounted": "No",
    "Noise Level": "No"
  },
  "description_chars": 1055
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-24T20:56:36.825Z",
  "name": "Acon hCG (Urine)",
  "category": "Medical RTD",
  "subcategory": null,
  "brand": "Acon",
  "catalogue_no": "ACKCRDPC3",
  "facts": {
    "Brand": "Acon",
    "Sample Type": "Urine",
    "Pack Size": "50T",
    "CAT No": "ACKCRDPC3"
  },
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 32,
  "specs_preview": {
    "Instruments Type": "Rapid Diagnostic Test",
    "Frequency": "Single use",
    "Storage Instructions": "Store at 2-30C, Do not freeze",
    "Material": "Other"
  },
  "description_chars": 1219
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-24T20:55:34.389Z",
  "name": "Abbott ABON Urine Test E-Z Split Key Drug Screen Cup",
  "category": "Medical IVD",
  "subcategory": null,
  "brand": null,
  "catalogue_no": "DBD-1107",
  "facts": {
    "Sample Type": "Urine",
    "Pack Size": "25T",
    "CAT No.": "DBD-1107"
  },
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 6,
  "specs_preview": {
    "Wall Mounted": "No",
    "Noise Level": "No",
    "Portable": "Yes",
    "Usage Type": "Hospital and Lab"
  },
  "description_chars": 357
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-24T20:56:01.290Z",
  "name": "Abbott BINAXNOW COVID-19 Ag CARD",
  "category": "Medical IVD",
  "subcategory": null,
  "brand": null,
  "catalogue_no": null,
  "facts": {},
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 31,
  "specs_preview": {
    "Real-Time Operation": "Yes",
    "Color": "White card with printed panel",
    "Technology": "Lateral Flow Immunoassay",
    "Weight": "Lightweight, single-use"
  },
  "description_chars": 1498
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-24T20:56:31.710Z",
  "name": "Abbott BinaxNOW Covid-19 Rapid Antigen Card Test Kit",
  "category": "Medical IVD",
  "subcategory": null,
  "brand": null,
  "catalogue_no": null,
  "facts": {},
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 30,
  "specs_preview": {
    "Function": "Detects presence of COVID-19 viral antigens",
    "Shelf Life": "12 months",
    "Measurement Range": "Qualitative (Positive/Negative)",
    "Condition": "New"
  },
  "description_chars": 1841
}
```

### Parse failures by reason

- 3093 × Not in cache and network is disabled (offline): <url>

## Source `src-b`

- Nav entries: 304
- Parsed records: 303
- Parse failures: 1

### Categories (from parsed pages)

| Category | Parsed |
|---|---:|
| Schnelltests | 79 |
| (none) | 31 |
| Einzelparameter-Geräte | 28 |
| Multiparameter-Geräte | 21 |
| Blutbild | 21 |
| Kardiologie | 20 |
| HbA1c | 20 |
| Reader | 19 |
| Stationäre BGA-Geräte | 17 |
| PCR | 15 |
| LAMP | 9 |
| Glukose | 7 |
| Mobile BGA-Geräte | 4 |
| Toxikologie | 3 |
| Transparency Partner | 3 |
| Urindiagnostik | 2 |
| Künstlicher Intelligenz (KI) | 2 |
| Apotheke | 1 |
| Urologie | 1 |

### Field coverage

| Field | Records | % |
|---|---:|---:|
| brand (stated) | 303 | 100.0% |
| catalogue_no | 0 | 0.0% |
| fact table | 303 | 100.0% |
| spec rows | 303 | 100.0% |
| image | 296 | 97.7% |
| documents | 286 | 94.4% |
| components | 292 | 96.4% |
| related (source-linked) | 206 | 68.0% |
| description | 298 | 98.3% |

Top fact-table keys: Manufacturer (303), Methode (296), Parameter (290), Categories (272), Alternative name (19), Probentyp (10), Zeit bis zum Ergebnis (s) (3), Probenvolumen (µL) (1)

### Sample records

```json
{
  "source": "src-b",
  "fetched_at": "2026-11-25T03:34:41.655Z",
  "name": "AFIAS-1",
  "category": "Kardiologie",
  "subcategory": "HbA1c",
  "brand": "BODITECH",
  "catalogue_no": null,
  "facts": {
    "Manufacturer": "BODITECH",
    "Parameter": "Alpha-Fetoprotein (AFP), Carcinoembryonales Antigen (CEA), Cortisol, C-reaktives Protein (CRP), D-Dimer, Ferritin, Freies PSA (fPSA), Follikelstimulierendes Hormon (FSH), HbA1c, hCG, Influenza A, Influenza B, Interleukin, Luteinisierendes Hormon (LH), Myoglobin, NT-proBNP, Procalcitonin (PCT), Prostata-spezifisches Antigen (PSA), RSV, SARS-CoV-2, Trijodthyronin (T3), Thyroxin (T4), Testosteron, Troponin I, Troponin T, Thyreoidea-stimulierendes Hormon (TSH), Vitamin D, Anti-Müller-Hormon (AMH), Progesteron, Prolaktin, Cancer Antigen, Mikroalbumin",
    "Methode": "Multiparameter, Fluoreszenz-Immunoassay (FIA)",
    "Categories": "Kardiologie, HbA1c, Multiparameter-Geräte, Onkologie, CRP, Vitamin D, Apotheke, Gerätetyp, Beliebte POCT-Parameter",
    "Alternative name": "AFIAS-1 Analysesystem"
  },
  "image": "(present)",
  "documents": 12,
  "components": [
    "CRP",
    "D-Dimer",
    "NT-proBNP",
    "PCT",
    "Troponin I Plus"
  ],
  "spec_rows": 7,
  "specs_preview": {
    "Parameter": "Alpha-Fetoprotein (AFP), Carcinoembryonales Antigen (CEA), Cortisol, C-reaktives Protein (CRP), D-Dimer, Ferritin, Freies PSA (fPSA), Follikelstimulierendes Hormon (FSH), HbA1c, hCG, Influenza A, Influenza B, Interleukin, Luteinisierendes Hormon (LH), Myoglobin, NT-proBNP, Procalcitonin (PCT), Prostata-spezifisches Antigen (PSA), RSV, SARS-CoV-2, Trijodthyronin (T3), Thyroxin (T4), Testosteron, Troponin I, Troponin T, Thyreoidea-stimulierendes Hormon (TSH), Vitamin D, Anti-Müller-Hormon (AMH), Progesteron, Prolaktin, Cancer Antigen, Mikroalbumin",
    "Konnektivität": "HL7, LAN, WLAN",
    "Methode": "Multiparameter, Fluoreszenz-Immunoassay (FIA)",
    "Depth (cm)": "32.1"
  },
  "description_chars": 4427
}
```
```json
{
  "source": "src-b",
  "fetched_at": "2026-11-25T03:37:36.117Z",
  "name": "Edan i15",
  "category": "Mobile BGA-Geräte",
  "subcategory": "Transparency Partner",
  "brand": "EDAN",
  "catalogue_no": null,
  "facts": {
    "Manufacturer": "EDAN",
    "Parameter": "Chlorid, Glukose, Hämatokrit, Ionisiertes Kalzium, Kalium, Laktat, Natrium, pCO2, pH, pO2, Hämoglobin",
    "Methode": "Blutgasanalyse (BGA)",
    "Categories": "Mobile BGA-Geräte, Transparency Partner, Blutgase"
  },
  "image": "(present)",
  "documents": 1,
  "components": [
    "BG3",
    "BG8",
    "BG4",
    "BG9",
    "BG10"
  ],
  "spec_rows": 7,
  "specs_preview": {
    "Parameter": "Chlorid, Glukose, Hämatokrit, Ionisiertes Kalzium, Kalium, Laktat, Natrium, pCO2, pH, pO2, Hämoglobin",
    "Konnektivität": "POCT1-A, LAN, WLAN",
    "Methode": "Blutgasanalyse (BGA)",
    "Weight (kg)": "3.8"
  },
  "description_chars": 4956
}
```
```json
{
  "source": "src-b",
  "fetched_at": "2026-11-25T03:34:21.997Z",
  "name": "Abon Chlamydia",
  "category": "Schnelltests",
  "subcategory": null,
  "brand": "ABON",
  "catalogue_no": null,
  "facts": {
    "Manufacturer": "ABON",
    "Parameter": "Chlamydia",
    "Methode": "Schnelltest, Harnanalyse",
    "Categories": "Schnelltests"
  },
  "image": "(present)",
  "documents": 1,
  "components": [
    "Abon Chlamydia"
  ],
  "spec_rows": 2,
  "specs_preview": {
    "Parameter": "Chlamydia",
    "Methode": "Schnelltest, Harnanalyse"
  },
  "description_chars": 1061
}
```
```json
{
  "source": "src-b",
  "fetched_at": "2026-11-25T03:34:19.842Z",
  "name": "ABL800 Flex",
  "category": "Stationäre BGA-Geräte",
  "subcategory": "(Co) Oxymetrie",
  "brand": "RADIOMETER",
  "catalogue_no": null,
  "facts": {
    "Manufacturer": "RADIOMETER",
    "Parameter": "Bilirubin, Chlorid, Glukose, Hämoglobin, Ionisiertes Kalzium, Kalium, Kreatinin, Laktat, Natrium, pCO2, pH, pO2",
    "Methode": "Blutgasanalyse (BGA), (Co) Oxymetrie",
    "Categories": "Stationäre BGA-Geräte, (Co) Oxymetrie, Blutgase"
  },
  "image": "(present)",
  "documents": 25,
  "components": [
    "ABL800 Flex"
  ],
  "spec_rows": 7,
  "specs_preview": {
    "Parameter": "Bilirubin, Chlorid, Glukose, Hämoglobin, Ionisiertes Kalzium, Kalium, Kreatinin, Laktat, Natrium, pCO2, pH, pO2",
    "Konnektivität": "HL7, POCT1-A, LAN",
    "Methode": "Blutgasanalyse (BGA), (Co) Oxymetrie",
    "Depth (cm)": "47.6"
  },
  "description_chars": 4092
}
```
```json
{
  "source": "src-b",
  "fetched_at": "2026-11-25T03:34:15.293Z",
  "name": "ABL9",
  "category": "Stationäre BGA-Geräte",
  "subcategory": "Mobile BGA-Geräte",
  "brand": "RADIOMETER",
  "catalogue_no": null,
  "facts": {
    "Manufacturer": "RADIOMETER",
    "Parameter": "Chlorid, Hämatokrit, Ionisiertes Kalzium, Kalium, Laktat, Natrium, pCO2, pH, pO2",
    "Methode": "Blutgasanalyse (BGA)",
    "Categories": "Stationäre BGA-Geräte, Mobile BGA-Geräte, Blutgase",
    "Alternative name": "Radiometer ABL9 Blutgasanalysator"
  },
  "image": "(present)",
  "documents": 3,
  "components": [
    "ABL9"
  ],
  "spec_rows": 8,
  "specs_preview": {
    "Parameter": "Chlorid, Hämatokrit, Ionisiertes Kalzium, Kalium, Laktat, Natrium, pCO2, pH, pO2",
    "Konnektivität": "HL7, LAN",
    "Methode": "Blutgasanalyse (BGA)",
    "Connectivity Info": "AQURE"
  },
  "description_chars": 5528
}
```
```json
{
  "source": "src-b",
  "fetched_at": "2026-11-25T03:34:55.964Z",
  "name": "ALFA",
  "category": "Einzelparameter-Geräte",
  "subcategory": "Reader",
  "brand": "DR. FOOKE",
  "catalogue_no": null,
  "facts": {
    "Manufacturer": "DR. FOOKE",
    "Parameter": "Immunoglobulin E",
    "Methode": "Reader, Einzelparameter",
    "Categories": "Einzelparameter-Geräte, Reader"
  },
  "image": "(present)",
  "documents": 1,
  "components": [
    "Total IgE Basis Set"
  ],
  "spec_rows": 2,
  "specs_preview": {
    "Parameter": "Immunoglobulin E",
    "Methode": "Reader, Einzelparameter"
  },
  "description_chars": 3939
}
```
```json
{
  "source": "src-b",
  "fetched_at": "2026-11-25T03:34:51.563Z",
  "name": "Afinion 2",
  "category": "HbA1c",
  "subcategory": "Multiparameter-Geräte",
  "brand": "ABBOTT",
  "catalogue_no": null,
  "facts": {
    "Manufacturer": "ABBOTT",
    "Parameter": "Mikroalbumin, Cholesterin, C-reaktives Protein (CRP), HbA1c, HDL-Cholesterin, LDL-Cholesterin, Triglyceride",
    "Methode": "Multiparameter",
    "Categories": "HbA1c, Multiparameter-Geräte, CRP, Cholesterin, Kreatinin, Urologie, Diabetologie, Apotheke, Gerätetyp, Beliebte POCT-Parameter"
  },
  "image": "(present)",
  "documents": 24,
  "components": [
    "Lipid Panel",
    "CRP",
    "ACR",
    "HbA1c"
  ],
  "spec_rows": 7,
  "specs_preview": {
    "Parameter": "Mikroalbumin, Cholesterin, C-reaktives Protein (CRP), HbA1c, HDL-Cholesterin, LDL-Cholesterin, Triglyceride",
    "Konnektivität": "HL7, POCT1-A, LAN",
    "Methode": "Multiparameter",
    "Width (cm)": "20"
  },
  "description_chars": 3861
}
```
```json
{
  "source": "src-b",
  "fetched_at": "2026-11-25T03:34:26.493Z",
  "name": "Accu-Chek Inform II",
  "category": "Glukose",
  "subcategory": "Einzelparameter-Geräte",
  "brand": "ROCHE",
  "catalogue_no": null,
  "facts": {
    "Manufacturer": "ROCHE",
    "Parameter": "Glukose",
    "Methode": "Einzelparameter",
    "Categories": "Glukose, Einzelparameter-Geräte, Diabetologie, Gerätetyp"
  },
  "image": "(present)",
  "documents": 27,
  "components": [
    "Teststreifen"
  ],
  "spec_rows": 8,
  "specs_preview": {
    "Parameter": "Glukose",
    "Konnektivität": "POCT1-A, LAN, WLAN",
    "Methode": "Einzelparameter",
    "Data Manager": "cobas infinity"
  },
  "description_chars": 3735
}
```
```json
{
  "source": "src-b",
  "fetched_at": "2026-11-25T03:34:28.779Z",
  "name": "Accutrend Plus",
  "category": "Multiparameter-Geräte",
  "subcategory": "Laktat",
  "brand": "ROCHE",
  "catalogue_no": null,
  "facts": {
    "Manufacturer": "ROCHE",
    "Parameter": "Cholesterin, Laktat, Triglyceride",
    "Methode": "Multiparameter",
    "Categories": "Multiparameter-Geräte, Laktat, Cholesterin, Gerätetyp, Beliebte POCT-Parameter"
  },
  "image": "(present)",
  "documents": 13,
  "components": [
    "Cholesterol",
    "BM-Lactate"
  ],
  "spec_rows": 6,
  "specs_preview": {
    "Parameter": "Cholesterin, Laktat, Triglyceride",
    "Methode": "Multiparameter",
    "Weight (kg)": "0.14",
    "Height (cm)": "15.4"
  },
  "description_chars": 4386
}
```
```json
{
  "source": "src-b",
  "fetched_at": "2026-11-25T03:37:18.070Z",
  "name": "DrugTest 5000",
  "category": "Toxikologie",
  "subcategory": null,
  "brand": "DRAEGER",
  "catalogue_no": null,
  "facts": {
    "Manufacturer": "DRAEGER",
    "Parameter": "Amphetamine, Benzodiazepine, Ketamin, Kokain, Methadon, Methamphetamine, Opiate, THC",
    "Methode": "Multiparameter",
    "Categories": "Toxikologie"
  },
  "image": "(present)",
  "documents": 21,
  "components": [
    "Test-Kit"
  ],
  "spec_rows": 6,
  "specs_preview": {
    "Parameter": "Amphetamine, Benzodiazepine, Ketamin, Kokain, Methadon, Methamphetamine, Opiate, THC",
    "Methode": "Multiparameter",
    "Depth (cm)": "25",
    "Width (cm)": "20"
  },
  "description_chars": 4084
}
```

### Parse failures by reason

- 1 × no product record in payload

## Catalogue

- Records: 1224 (1217 canonical, 7 flagged duplicates)
- Canonical products by source: src-b 1096, src-a 134 (in more than one source: 13)

### By category / product type

| Category | Instruments | Tests & reagents | Controls | Consumables | Unknown | Total |
|---|---:|---:|---:|---:|---:|---:|
| clinical-chemistry | 73 | 335 | 0 | 0 | 0 | 408 |
| molecular | 24 | 169 | 0 | 0 | 0 | 193 |
| rapid-tests | 0 | 186 | 0 | 1 | 0 | 187 |
| immunoassays | 10 | 115 | 0 | 0 | 0 | 125 |
| blood-gas | 24 | 61 | 0 | 1 | 0 | 86 |
| urinalysis | 24 | 60 | 0 | 0 | 0 | 84 |
| coagulation | 14 | 34 | 0 | 0 | 0 | 48 |
| hematology | 31 | 12 | 1 | 1 | 0 | 45 |
| diabetes | 11 | 9 | 0 | 1 | 0 | 21 |
| general | 6 | 4 | 1 | 1 | 5 | 17 |
| microbiology | 0 | 3 | 0 | 0 | 0 | 3 |

### Brands

| Brand | Products | Instruments | Tests & reagents |
|---|---:|---:|---:|
| Abbott | 132 | 9 | 122 |
| SD Biosensor | 86 | 3 | 83 |
| Arkray | 72 | 7 | 65 |
| Roche | 62 | 15 | 47 |
| Vedalab | 43 | 1 | 42 |
| Boditech | 35 | 4 | 31 |
| Werfen | 35 | 10 | 24 |
| Cepheid | 33 | 2 | 31 |
| Siemens Healthineers | 32 | 13 | 19 |
| QuidelOrtho | 31 | 3 | 28 |
| Molbio | 29 | 3 | 26 |
| NAL von minden | 29 | 5 | 24 |
| Fujifilm | 28 | 3 | 25 |
| Seamaty | 27 | 2 | 25 |
| Ustar | 27 | 3 | 24 |
| Concile | 26 | 4 | 22 |
| Bioantibody | 23 | 1 | 18 |
| Nova Biomedical | 23 | 14 | 9 |
| Hitado | 20 | 0 | 20 |
| EDAN | 19 | 4 | 15 |
| Coyote | 17 | 2 | 14 |
| Tascom | 16 | 1 | 15 |
| Micropoint | 15 | 3 | 12 |
| Bosch | 13 | 1 | 12 |
| Radiometer | 13 | 4 | 9 |
| Aidian | 12 | 2 | 10 |
| CTK Biotech | 12 | 0 | 12 |
| HemoCue | 12 | 8 | 4 |
| Precision Biosensor | 12 | 1 | 11 |
| Dr. Müller | 11 | 4 | 7 |
| EKF Diagnostics | 11 | 4 | 6 |
| Meridian Bioscience | 11 | 2 | 9 |
| PTS Diagnostics | 10 | 2 | 8 |
| Sysmex | 10 | 6 | 4 |
| Eurolyser | 9 | 1 | 8 |
| Haemonetics | 9 | 2 | 7 |
| LSI Medience | 9 | 1 | 8 |
| LumiraDx | 9 | 1 | 8 |
| Analyticon | 8 | 2 | 6 |
| Human | 8 | 3 | 4 |
| Pluslife | 8 | 2 | 6 |
| Qiagen | 8 | 1 | 6 |
| Qualigen | 8 | 1 | 7 |
| Credo | 7 | 1 | 6 |
| Macherey-Nagel | 7 | 2 | 5 |
| Servoprax | 7 | 1 | 6 |
| Becton Dickinson | 6 | 1 | 5 |
| Bühlmann | 6 | 1 | 5 |
| FlashDx | 6 | 1 | 5 |
| Actim | 5 | 1 | 4 |
| Horiba | 5 | 4 | 1 |
| OPTI Medical | 5 | 1 | 4 |
| Premier Medical | 5 | 0 | 5 |
| Acon | 4 | 1 | 3 |
| bioMérieux | 4 | 2 | 2 |
| Biosurfit | 4 | 1 | 3 |
| DiaSys | 4 | 2 | 2 |
| iLine | 4 | 3 | 1 |
| Melet Schloesing | 4 | 3 | 1 |
| MNCHIP | 4 | 1 | 3 |
| Noul | 4 | 1 | 3 |
| 77 Elektronika | 3 | 2 | 1 |
| Erba Mannheim | 3 | 0 | 3 |
| HemoSonics | 3 | 1 | 2 |
| Jungbrunnen | 3 | 1 | 2 |
| Nihon Kohden | 3 | 3 | 0 |
| Orphée | 3 | 3 | 0 |
| Schebo | 3 | 0 | 3 |
| Apexbio | 2 | 1 | 1 |
| Bilimetrix | 2 | 1 | 1 |
| Bonraybio | 2 | 1 | 1 |
| Diesse | 2 | 1 | 1 |
| Doasense | 2 | 1 | 1 |
| Dr. Fooke | 2 | 1 | 1 |
| Dräger | 2 | 1 | 1 |
| Eschweiler | 2 | 2 | 0 |
| Essenlix | 2 | 1 | 1 |
| InBios | 2 | 0 | 2 |
| Keul | 2 | 0 | 2 |
| Liofilchem | 2 | 2 | 0 |
| MeMed | 2 | 1 | 1 |
| RADI | 2 | 0 | 2 |
| Acro Biotech | 1 | 0 | 1 |
| Calbiotech | 1 | 0 | 1 |
| Dymind | 1 | 1 | 0 |
| Exias Medical | 1 | 1 | 0 |
| HemoTypeSC | 1 | 0 | 1 |
| iHealth | 1 | 0 | 1 |
| Lepzi | 1 | 0 | 1 |
| Medcaptain | 1 | 1 | 0 |
| Medical Electronic Systems | 1 | 1 | 0 |
| Mindray | 1 | 1 | 0 |
| PixCell | 1 | 1 | 0 |
| Thermo Fisher | 1 | 0 | 1 |
| Trivitron | 1 | 0 | 1 |
| Zybio | 1 | 1 | 0 |

### Field coverage (canonical products)

| Field | Filled | % |
|---|---:|---:|
| name | 1217 | 100.0% |
| brand | 1217 | 100.0% |
| product_line | 209 | 17.2% |
| category | 1200 | 98.6% |
| subcategory | 1212 | 99.6% |
| technology | 1203 | 98.8% |
| analyte | 1164 | 95.6% |
| sample_type | 1156 | 95.0% |
| product_type | 1212 | 99.6% |
| subtype | 59 | 4.8% |
| pack_size | 96 | 7.9% |
| catalogue_no | 106 | 8.7% |
| specs (≥1 row) | 1216 | 99.9% |
| summary | 1217 | 100.0% |
| image_local | 0 | 0.0% |
| documents | 239 | 19.6% |
| related | 1198 | 98.4% |
| classification_confidence ≥ 0.7 | 1200 | 98.6% |

### Duplicate groups (6) — non-canonical records are hidden and redirect

- **InBios Kalazar Detect Rapid Test for Visceral Leishmaniasis** ← `inbios-kalazar-detect-rapid-test-for-visceral-leishmaniasis-032ddb`
- **Abbott Bioline Strep A** ← `abbott-bioline-strep-a-0cf4c0`
- **Abbott Bioline HIV 1 2 3.0** ← `abbott-bioline-hiv-1-2-3-0-89bfd7`
- **Abbott BinaxNOW G6PD** ← `abbott-binaxnow-g6pd-bc031e`
- **SD Biosensor Standard Q COVID-19 Ag** ← `sd-biosensor-standard-q-covid-19-ag-6bf968`, `sd-biosensor-standard-q-covid-19-ag-7a88d5`
- **Abbott DETERMINE HBsAg 2** ← `abbott-determine-hbsag-2-7da385`

### Cross-source merges (13)

- Abbott Binaxnow Streptococcus Pneumoniae (2 listings)
- Abbott NMP22 BLADDERCHEK (2 listings)
- SD Biosensor STANDARD Q COVID/Flu Ag Combo (2 listings)
- SD Biosensor STANDARD Q Dengue IgM/IgG (2 listings)
- SD Biosensor STANDARD Q Dengue NS1 Ag (2 listings)
- SD Biosensor STANDARD Q Malaria P.f Ag (2 listings)
- SD Biosensor STANDARD Q Malaria P.F/P.V Ag (2 listings)
- SD Biosensor STANDARD Q Malaria P.F/Pan Ag (2 listings)
- Abbott Bioline ROTAVIRUS (2 listings)
- Abbott BINAXNOW INFLUENZA A&B CARD (2 listings)
- Abbott BINAXNOW MALARIA (2 listings)
- Abbott BINAXNOW RSV CARD (2 listings)
- Abbott DETERMINE SYPHILIS TP (2 listings)

### Scope filter

- Dropped as non-diagnostic: 0
- Instrument child tests expanded into own records: 1329; matched to existing pages: 0

### Brand checks

- Name-derived brand disagreed with the stated brand (4):
  - Calbiotech Free Testosterone ELISA: using **Calbiotech**, source said InBios
  - LumiraDx: using **LumiraDx**, source said Roche
  - Xprecia Prime: using **Siemens Healthineers**, source said Universal Biosensors (OEM/distributor)
  - Xprecia Stride: using **Siemens Healthineers**, source said Universal Biosensors (OEM/distributor)
- Stated brands not in brands.yaml (passed through, tidied): 0 — 
- Products with no brand: 0

### Low classification confidence (< 0.6): 9

- Qiagen Filter-Tips, 1000 µl — 0.44 (tech: none, analyte: none, sample: none, type: keyword)
- EDAN i15 control level -1 — 0.46 (tech: none, analyte: none, sample: none, type: keyword:control)
- Bioantibody Total PSA — 0.5 (tech: none, analyte: structured, sample: none, type: none)
- Bioantibody Testosterone — 0.5 (tech: none, analyte: structured, sample: none, type: none)
- Bioantibody β-hCG — 0.5 (tech: none, analyte: structured, sample: none, type: none)
- Bioantibody LH/FSH/Progesteron/Prolaktin — 0.5 (tech: none, analyte: structured, sample: none, type: none)
- NAL von minden RSS flash 2.0 — 0.43 (tech: none, analyte: none, sample: none, type: structured)
- Ustar SP Assay — 0.55 (tech: parent, analyte: none, sample: none, type: component)
- Ustar UU Assay — 0.55 (tech: parent, analyte: none, sample: none, type: component)
