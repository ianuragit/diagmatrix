
## Source `src-a`

- Nav entries: 3234
- Parsed records: 1342
- Parse failures: 1892

### Categories

| Category | In nav | Parsed |
|---|---:|---:|
| Medical Reagents | 550 | 2 |
| Medical CLIA | 329 | 319 |
| Medical POCT | 311 | 308 |
| Medical FIA | 311 | 305 |
| Medical LAB | 310 | 1 |
| Medical Accesories | 302 | 1 |
| Medical Analyzer | 265 | 1 |
| Life Sciences | 237 | 0 |
| Medical Surgicals | 171 | 0 |
| Medical ELISA | 170 | 172 |
| Medical RTD | 150 | 150 |
| Medical IVD | 82 | 82 |
| Medical Consumables | 46 | 1 |

### Field coverage

| Field | Records | % |
|---|---:|---:|
| brand (stated) | 1110 | 82.7% |
| catalogue_no | 1082 | 80.6% |
| fact table | 1119 | 83.4% |
| spec rows | 1331 | 99.2% |
| image | 1342 | 100.0% |
| documents | 0 | 0.0% |
| components | 0 | 0.0% |
| related (source-linked) | 0 | 0.0% |
| description | 1323 | 98.6% |

Top fact-table keys: Brand (1110), Sample Type (960), Pack Size (921), CAT No (738), CAT No. (309), Application (297), Biomarker (175), Test Type (79), Number of Reactions(Preps)/Kit (44), Model (33), Result Time (Rapid Kits) (32), CAT No.Â (19), Cat. No (18), Method (17), Cat No (14)

### Sample records

```json
{
  "source": "src-a",
  "fetched_at": "2026-11-25T06:23:56.919Z",
  "name": "Abbott AFINION ACR",
  "category": "Medical POCT",
  "subcategory": null,
  "brand": "Abbott",
  "catalogue_no": "1116780",
  "facts": {
    "Brand": "Abbott",
    "Sample Type": "Urine",
    "Pack Size": "15T",
    "CAT No": "1116780"
  },
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 40,
  "specs_preview": {
    "Wall Mounted": "No",
    "Color": "White/Grey",
    "Material": "Plastic and Electronic Components",
    "Portable": "Yes"
  },
  "description_chars": 1449
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-25T08:26:00.734Z",
  "name": "Beckman Coulter Access 25 (OH) Vitamin D (CLIA)",
  "category": "Medical CLIA",
  "subcategory": null,
  "brand": "Beckman Coulter",
  "catalogue_no": "B24838",
  "facts": {
    "Brand": "Beckman Coulter",
    "Sample Type": "Serum/ Plasma",
    "Pack Size": "2 x 50T",
    "CAT No.": "B24838",
    "Application": "Bone Metabolism"
  },
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 10,
  "specs_preview": {
    "Storage Instructions": "2 to 10 Degree Celsius",
    "Real-Time Operation": "Yes",
    "Usage Type": "Laboratory",
    "Wall Mounted": "No"
  },
  "description_chars": 1214
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-25T06:00:55.769Z",
  "name": "Abbott Bioline DENGUE IgG CAPTURE ELISA",
  "category": "Medical ELISA",
  "subcategory": null,
  "brand": "Abbott",
  "catalogue_no": "11EK10",
  "facts": {
    "Brand": "Abbott",
    "Sample Type": "Serum",
    "Pack Size": "96 Wells",
    "CAT No": "11EK10"
  },
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 13,
  "specs_preview": {
    "Storage Instructions": "Store in a cool and dry place",
    "Features": "High Accuracy Reliable Results",
    "Accuracy": "High",
    "Wall Mounted": "No"
  },
  "description_chars": 165
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-25T07:55:40.862Z",
  "name": "Acon FIAflex beta-hCG FIA Test",
  "category": "Medical FIA",
  "subcategory": null,
  "brand": null,
  "catalogue_no": null,
  "facts": {},
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 35,
  "specs_preview": {
    "Dimension (L*W*H)": "Standard kit box size (custom/varies)",
    "Operating Type": "Semi-Automatic",
    "Features": "Rapid results, High sensitivity, Easy to use",
    "Wall Mounted": "No"
  },
  "description_chars": 1378
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-25T05:28:46.001Z",
  "name": "Abbott DETERMINE HIV-1/2 Set",
  "category": "Medical RTD",
  "subcategory": null,
  "brand": "Abbott",
  "catalogue_no": "7D2343SET",
  "facts": {
    "Brand": "Abbott",
    "Sample Type": "Serum/ Plasma/ WB",
    "Pack Size": "100T",
    "CAT No": "7D2343SET"
  },
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 28,
  "specs_preview": {
    "Material": "Plastic and test strip membrane",
    "Measurement Range": "Qualitative (Positive/Negative)",
    "Storage Instructions": "Store at 2-30°C, avoid direct sunlight",
    "Accuracy": ">99% (as per manufacturer studies)"
  },
  "description_chars": 1381
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
  "fetched_at": "2026-11-25T07:29:21.357Z",
  "name": "Fujifilm FUJI DRI-CHEM SLIDE GGT-P III Biochemistry Reagent Kit",
  "category": "Medical Reagents",
  "subcategory": null,
  "brand": "FUJIFILM",
  "catalogue_no": "15809736",
  "facts": {
    "Brand": "FUJIFILM",
    "Sample Type": "Serum/ Plasma",
    "Pack Size": "24T",
    "CAT No": "15809736",
    "Application": "High Density Lipo-protein Cholesterol Concentration"
  },
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 34,
  "specs_preview": {
    "Noise Level": "Low",
    "Use": "Hospital",
    "Usage Type": "Professional",
    "Condition": "New"
  },
  "description_chars": 227
}
```
```json
{
  "source": "src-a",
  "fetched_at": "2026-11-25T07:30:32.913Z",
  "name": "Bio-Rad Gene Pulser / MicroPulser Electroporation Cuvettes",
  "category": "Medical LAB",
  "subcategory": null,
  "brand": null,
  "catalogue_no": null,
  "facts": {},
  "image": "(present)",
  "documents": 0,
  "components": [],
  "spec_rows": 11,
  "specs_preview": {
    "Classification": "Laboratory Accessories",
    "Application": "Gene transfer, bacterial transformation, yeast transformation and mammalian cell transfection.",
    "Product Type": "Electroporation Cuvettes",
    "Usage": "Laboratory Usage"
  },
  "description_chars": 200
}
```

### Parse failures by reason

- 1892 × Not in cache and network is disabled (offline): <url>

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

- Records: 2413 (2333 canonical, 80 flagged duplicates)
- Canonical products by source: src-b 1097, src-a 1258 (in more than one source: 22)

### By category / product type

| Category | Instruments | Tests & reagents | Controls | Consumables | Unknown | Total |
|---|---:|---:|---:|---:|---:|---:|
| immunoassays | 30 | 838 | 11 | 6 | 0 | 885 |
| clinical-chemistry | 80 | 339 | 0 | 1 | 4 | 424 |
| rapid-tests | 2 | 290 | 0 | 1 | 0 | 293 |
| molecular | 26 | 172 | 0 | 0 | 3 | 201 |
| urinalysis | 34 | 74 | 0 | 0 | 4 | 112 |
| blood-gas | 32 | 70 | 4 | 1 | 1 | 108 |
| general | 19 | 35 | 4 | 2 | 26 | 86 |
| hematology | 44 | 15 | 8 | 1 | 12 | 80 |
| diabetes | 27 | 31 | 0 | 3 | 13 | 74 |
| coagulation | 20 | 44 | 0 | 0 | 3 | 67 |
| microbiology | 0 | 3 | 0 | 0 | 0 | 3 |

### Brands

| Brand | Products | Instruments | Tests & reagents |
|---|---:|---:|---:|
| Abbott | 191 | 19 | 161 |
| Snibe | 163 | 1 | 162 |
| Boditech | 161 | 9 | 150 |
| SD Biosensor | 150 | 11 | 137 |
| Arkray | 104 | 17 | 79 |
| Calbiotech | 98 | 0 | 98 |
| Roche | 96 | 24 | 70 |
| Zybio | 63 | 2 | 61 |
| Getein | 58 | 4 | 54 |
| CTK Biotech | 49 | 0 | 49 |
| Acon | 48 | 10 | 32 |
| Wondfo | 48 | 7 | 41 |
| Beckman Coulter | 46 | 0 | 46 |
| Siemens Healthineers | 45 | 18 | 27 |
| Mindray | 43 | 1 | 40 |
| Vedalab | 43 | 1 | 42 |
| HemoCue | 42 | 21 | 10 |
| Werfen | 35 | 10 | 24 |
| Horiba | 34 | 4 | 24 |
| Cepheid | 33 | 2 | 31 |
| EDAN | 31 | 6 | 23 |
| QuidelOrtho | 31 | 3 | 28 |
| Fujifilm | 30 | 3 | 26 |
| EKF Diagnostics | 29 | 7 | 10 |
| Molbio | 29 | 3 | 26 |
| NAL von minden | 29 | 5 | 24 |
| Seamaty | 27 | 2 | 25 |
| Ustar | 27 | 3 | 24 |
| Concile | 26 | 4 | 22 |
| Bioantibody | 23 | 1 | 18 |
| Nova Biomedical | 23 | 14 | 9 |
| InBios | 21 | 0 | 21 |
| Hitado | 20 | 0 | 20 |
| Coyote | 17 | 2 | 14 |
| Medtronic | 17 | 1 | 15 |
| Tascom | 16 | 1 | 15 |
| Micropoint | 15 | 3 | 12 |
| Erba Mannheim | 14 | 2 | 11 |
| Bosch | 13 | 1 | 12 |
| Radiometer | 13 | 4 | 9 |
| Aidian | 12 | 2 | 10 |
| Precision Biosensor | 12 | 1 | 11 |
| Dr. Müller | 11 | 4 | 7 |
| Meridian Bioscience | 11 | 2 | 9 |
| Sysmex | 11 | 6 | 4 |
| Thermo Fisher | 11 | 1 | 10 |
| Premier Medical | 10 | 0 | 10 |
| PTS Diagnostics | 10 | 2 | 8 |
| Eurolyser | 9 | 1 | 8 |
| Haemonetics | 9 | 2 | 7 |
| LSI Medience | 9 | 1 | 8 |
| LumiraDx | 9 | 1 | 8 |
| Qiagen | 9 | 1 | 6 |
| Acro Biotech | 8 | 0 | 8 |
| Analyticon | 8 | 2 | 6 |
| Human | 8 | 3 | 4 |
| Pluslife | 8 | 2 | 6 |
| Qualigen | 8 | 1 | 7 |
| Credo | 7 | 1 | 6 |
| Macherey-Nagel | 7 | 2 | 5 |
| Servoprax | 7 | 1 | 6 |
| URIT | 7 | 4 | 3 |
| Becton Dickinson | 6 | 1 | 5 |
| Bühlmann | 6 | 1 | 5 |
| FlashDx | 6 | 1 | 5 |
| J. Mitra | 6 | 0 | 6 |
| Actim | 5 | 1 | 4 |
| OPTI Medical | 5 | 1 | 4 |
| bioMérieux | 4 | 2 | 2 |
| Biosurfit | 4 | 1 | 3 |
| DiaSys | 4 | 2 | 2 |
| iLine | 4 | 3 | 1 |
| Melet Schloesing | 4 | 3 | 1 |
| MNCHIP | 4 | 1 | 3 |
| Noul | 4 | 1 | 3 |
| 77 Elektronika | 3 | 2 | 1 |
| HemoSonics | 3 | 1 | 2 |
| (none) | 3 | 0 | 3 |
| HiMedia | 3 | 0 | 2 |
| Jungbrunnen | 3 | 1 | 2 |
| Nihon Kohden | 3 | 3 | 0 |
| OraSure Technologies | 3 | 0 | 3 |
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
| Hemex Health | 2 | 1 | 1 |
| Keul | 2 | 0 | 2 |
| KH Medical | 2 | 0 | 2 |
| Liofilchem | 2 | 2 | 0 |
| MeMed | 2 | 1 | 1 |
| Bio-Rad | 1 | 0 | 0 |
| CellaVision | 1 | 0 | 0 |
| Copack | 1 | 0 | 0 |
| Dymind | 1 | 1 | 0 |
| Exias Medical | 1 | 1 | 0 |
| iHealth | 1 | 0 | 1 |
| Lepzi | 1 | 0 | 1 |
| Medcaptain | 1 | 1 | 0 |
| Medical Electronic Systems | 1 | 1 | 0 |
| PixCell | 1 | 1 | 0 |
| Rapha Diagnostics | 1 | 0 | 1 |
| Silver Lake Research | 1 | 0 | 1 |
| Skyla | 1 | 1 | 0 |
| Trivitron | 1 | 0 | 1 |

### Field coverage (canonical products)

| Field | Filled | % |
|---|---:|---:|
| name | 2333 | 100.0% |
| brand | 2330 | 99.9% |
| product_line | 790 | 33.9% |
| category | 2247 | 96.3% |
| subcategory | 2267 | 97.2% |
| technology | 2250 | 96.4% |
| analyte | 1981 | 84.9% |
| sample_type | 2083 | 89.3% |
| product_type | 2267 | 97.2% |
| subtype | 177 | 7.6% |
| pack_size | 841 | 36.0% |
| catalogue_no | 1025 | 43.9% |
| specs (≥1 row) | 2331 | 99.9% |
| summary | 2320 | 99.4% |
| image_local | 0 | 0.0% |
| documents | 239 | 10.2% |
| related | 2014 | 86.3% |
| classification_confidence ≥ 0.7 | 2144 | 91.9% |

### Duplicate groups (75) — non-canonical records are hidden and redirect

- **Roche CoaguChek Pro II** ← `roche-coagu-chek-pro-ii`
- **Roche Coagu Chek Xs Plus System** ← `roche-coaguchek-xs-plus-system`
- **Snibe MAGLUMI Cholylglycine (CLIA)** ← `snibe-maglumi-cholylglycine-clia-9386c6`
- **Snibe MAGLUMI EBV EA IgA (CLIA)** ← `snibe-maglumi-ebv-ea-iga-clia-138161`
- **Snibe MAGLUMI GAD65 (CLIA)** ← `snibe-maglumi-anti-gad65-clia`
- **URIT 31 Urine Analyzer** ← `urit-31-urine-analyzer`
- **InBios CHIKjj Detect IgM ELISA Kit** ← `inbios-chikjj-detect-igm-elisa-kit`
- **InBios DENV Detect IgM Capture ELISA Kit** ← `inbios-denv-detect-igm-capture-elisa`
- **InBios ZIKV Detect 2.0 IgM Capture ELISA Kit** ← `inbios-zikv-detect-2-0-igm-capture-elisa`
- **InBios Kalazar Detect Rapid Test for Visceral Leishmaniasis** ← `inbios-kalazar-detect-rapid-test-for-visceral-leishmaniasis-032ddb`
- **EDAN BG8 i15 Test Cartridge** ← `edan-bg8-i15-test-cartridge-d70e81`
- **EDAN BG9 i15 Test Cartridge** ← `edan-bg9-i15-test-cartridge-5f44c8`
- **EDAN BG10 i15 Test Cartridge** ← `edan-bg10-i15-test-cartridge-05c906`
- **EDAN CP50 i15 calibrant fluid pack** ← `edan-cp50-i15-calibrant-fluid-pack-4f2b7f`
- **EDAN i15 control level -1** ← `edan-i15-control-level-1`
- **EDAN i15 control level -2** ← `edan-i15-controls-level-2`
- **EDAN i15 control level -3** ← `edan-i15-controls-level-3`
- **EKF Diagnostics Biosen Glucose/Lactate system solution** ← `ekf-diagnostics-biosen-glucose-lactate-system-solution-338428`
- **Abbott Bioline Strep A** ← `abbott-bioline-strep-a-0cf4c0`
- **Abbott Bioline HIV 1 2 3.0** ← `abbott-bioline-hiv-1-2-3-0-89bfd7`
- **Boditech ichroma Human Chorionic Gonadotropin (beta-hCG)** ← `boditech-ichroma-human-chorionic-gonadotropin`
- **Copack Hemoglobin Color Scale** ← `copack-hemoglobin-color-scale-cfbea8`, `copack-hemoglobin-color-scale-e8f655`, `copack-hemoglobin-color-scale-bc01bb`
- **Acon On Call A1c HbA1c Test Kit** ← `acon-on-call-a1c-hba1c-test-kit`
- **Abbott BinaxNOW G6PD** ← `abbott-binaxnow-g6pd-bc031e`
- **Wondfo Finecare 2-MG Rapid Quantitative Test** ← `wondfo-finecare-beta2-mg-rapid-quantitative-test`
- **Wondfo Finecare beta hCG Rapid Quantitative Test** ← `wondfo-finecare-beta-hcg-rapid-quantitative-test-99b724`
- **SD Biosensor STANDARD GlucoNavii NFC Blood Glucose Test Strip** ← `sd-biosensor-standard-gluconavii-nfc-blood-glucose-test-strip-02a6f3`
- **CTK Biotech OnSite Duo Dengue Ag IgG IgM Rapid Test** ← `ctk-biotech-onsite-duo-dengue-ag-igg-igm-rapid-test-ce`
- **SD Biosensor STANDARD Q Tsutsugmushi IgM IgG** ← `sd-biosensor-standard-q-tsutsugamushi-igm-igg`
- **SD Biosensor STANDARD Q Malaria P.F/Pan Ag** ← `sd-biosensor-standard-q-malaria-p-f-pan-ag-3e7693`
- **SD Biosensor STANDARD Q Dengue Ag Ab Duo** ← `sd-biosensor-standard-q-dengue-ag-plus-ab-duo`
- **SD Biosensor STANDARD Q Malaria PF PV Ag** ← `sd-biosensor-standard-q-malaria-p-f-p-v-ag`
- **SD Biosensor STANDARD Q Dengue IgM/IgG** ← `sd-biosensor-standard-q-dengue-igm-igg-96fb0d`
- **CTK Biotech Onsite HEV IgM Rapid Test CE** ← `ctk-biotech-onsite-hev-igm-rapid-test`
- **CTK Biotech OnSite H.Pylori Ag Rapid Test** ← `ctk-biotech-onsite-h-pylori-ag-rapid-test`
- **CTK Biotech OnSite HAV IgG IgM Rapid Test** ← `ctk-biotech-onsite-hav-igg-igm-rapid-test-ce`
- **CTK Biotech OnSite Leptospira IgG IgM Combo Rapid Test** ← `ctk-biotech-onsite-leptospira-igg-igm-combo-rapid-test`
- **CTK Biotech OnSite S.Typhi Paratyphi Ag Rapid Test** ← `ctk-biotech-onsite-s-typhi-paratyphi-ag-rapid-test-68e100`
- **CTK Biotech OnSite Typhoid IgG IgM Rapid Test** ← `ctk-biotech-onsite-typhoid-igg-igm-rapid-test`
- **CTK Biotech OnSite Dengue IgG/IgM 3.0 Combo Rapid Test CE** ← `ctk-biotech-onsite-dengue-igg-igm-combo-rapid-test`
- **CTK Biotech OnSite Dengue Ag Rapid Test** ← `ctk-biotech-onsite-dengue-ag-rapid-test-ce`
- **SD Biosensor STANDARD Q Chikungunya IgM IgG** ← `sd-biosensor-standard-q-chikungunya-igm-igg-746165`
- **SD Biosensor STANDARD Q Ultra Dot HCV** ← `sd-biosensor-standard-q-ultra-dot-hcv-261382`
- **SD Biosensor STANDARD Q - HIV Syphilis Combo** ← `sd-biosensor-standard-q-hiv-syphilis-combo-6e8efe`
- **CTK Biotech OnSite Toxo IgG/IgM Combo Rapid Test** ← `ctk-biotech-onsite-toxo-igg-igm-combo-rapid-test-387f3b`
- **SD Biosensor Standard Q Lepospira Igg Igm** ← `sd-biosensor-standard-q-leptospira-igm-igg`
- **CTK Biotech TRUSTline Scrub typhus IgG IgM Rapid Test** ← `ctk-biotech-trustline-scrub-typhus-igg-igm-rapid-test`
- **SD Biosensor Standard Q COVID-19 Ag** ← `sd-biosensor-standard-q-covid-19-ag-6bf968`, `sd-biosensor-standard-q-covid-19-ag-7a88d5`, `sd-biosensor-standard-q-covid-19-ag-814d4a`
- **SD Biosensor Ultra COVID-19 Ag** ← `sd-biosensor-ultra-covid-19-ag`
- **Boditech ichroma Beta-HCG Test** ← `boditech-ichroma-human-chorionic-gonadotropin-beta-hcg-plus`
- **SD Biosensor Standard F Dengue IgM IgG FIA** ← `sd-biosensor-standard-f-dengue-igm-igg-fia-6bb735`
- **SD Biosensor Standard F Chikungunya IgM IgG FIA** ← `sd-biosensor-standard-f-chikungunya-igm-igg-fia-8774b5`
- **SD Biosensor Standard F S.Pneumoniae Ag FIA** ← `sd-biosensor-standard-f-s-pneumoniae-ag-fia-24d98d`
- **CTK Biotech TRUSTwell CHIK IgM ELISA Kit** ← `ctk-biotech-trustwell-chik-igm-elisa-ce`
- **CTK Biotech TRUSTwell HIV 1 2 Ab ELISA Kit** ← `ctk-biotech-trustwell-hiv-1-plus-2-ab-elisa`
- **CTK Biotech TRUSTwell Dengue IgG ELISA Kit** ← `ctk-biotech-trustwell-dengue-igg-elisa-ce`
- **CTK Biotech RecombiLISA HAV IgM ELISA Kit** ← `ctk-biotech-recombilisa-hav-igm-elisa-ce`
- **CTK Biotech TRUSTwell Dengue IgM ELISA Kit** ← `ctk-biotech-trustwell-dengue-igm-elisa-ce`
- **CTK Biotech TRUSTwell Syphilis Ab kit** ← `ctk-biotech-trustwell-syphilis-ab-elisa-ce`
- **Premier Medical FIRST RESPONSE HIV 12 SYPHILIS Combo Card Test** ← `premier-medical-first-response-hiv-1-plus-2-syphilis-combo-card-test`
- **Premier Medical First Response Malaria Ag. P.f. P.v. Card Test** ← `premier-medical-first-response-malaria-ag-pf-pv-card-test`
- **Premier Medical First Response SyphiliS Anti-TP CardTest** ← `premier-medical-first-response-syphilis-anti-tp-card-test`
- **Abbott Binaxnow Streptococcus Pneumoniae** ← `abbott-binaxnow-streptococcus-pneumoniae-antigen-card`
- **Roche cardiac Troponin T sensitive test (visual)** ← `roche-cardiac-trop-t-sensitive-test`
- **Arkray PocketChem A1c HbA1c Test Kit** ← `arkray-pocketchem-a1c-hba1c-device`
- **Arkray Compact Urine Analyzer PocketChem UA PU-4010** ← `arkray-pocketchem-ua-pu-4010-329320`
- **HemoCue Plasma Low Hb System** ← `hemocue-plasma-low-hb-system-dd8a26`
- **Acon Mission Hemoglobin Hb And Test Strip** ← `acon-mission-hb-hemoglobin-test-strips`
- **Boditech ichroma D Dimer Test** ← `boditech-ichroma-d-dimer`
- **Boditech ichroma PRL Test** ← `boditech-ichroma-prolactin-prl`
- **Boditech Ichroma Tn-I Plus Test** ← `boditech-ichroma-troponin-i-tn-i-plus`
- **OraSure Technologies ORAQUICK IN-HOME HIV TEST (Pharmacy Version)** ← `orasure-technologies-oraquick-in-home-hiv-test-community-version`, `orasure-technologies-oraquick-in-home-hiv-test-us-fda-version`
- **Arkray GLUCOCARD Vital GT-1050** ← `arkray-blood-glucose-test-meter-glucocard-vital-gt-1050`
- **Boditech AFIAS-6** ← `boditech-afias-6-dd2320`
- **Abbott DETERMINE HBsAg 2** ← `abbott-determine-hbsag-2-7da385`

### Cross-source merges (22)

- Roche CoaguChek Pro II (2 listings)
- Horiba Microsemi CRP (2 listings)
- SD Biosensor STANDARD Q Malaria P.F/Pan Ag (2 listings)
- SD Biosensor STANDARD Q Malaria PF PV Ag (2 listings)
- SD Biosensor STANDARD Q Dengue IgM/IgG (2 listings)
- SD Biosensor STANDARD Q Chikungunya IgM IgG (2 listings)
- Abbott Binaxnow Streptococcus Pneumoniae (2 listings)
- Arkray Compact Urine Analyzer PocketChem UA PU-4010 (2 listings)
- Arkray Spotchem El Se-1520 (2 listings)
- Siemens Healthineers Clinitek Microalbumin 2 (2 listings)
- Abbott NMP22 BLADDERCHEK (2 listings)
- SD Biosensor STANDARD Q COVID/Flu Ag Combo (2 listings)
- SD Biosensor STANDARD Q Dengue NS1 Ag (2 listings)
- SD Biosensor STANDARD Q Malaria P.f Ag (2 listings)
- Abbott Bioline ROTAVIRUS (2 listings)
- Abbott BINAXNOW INFLUENZA A&B CARD (2 listings)
- Abbott BINAXNOW MALARIA (2 listings)
- Abbott BINAXNOW RSV CARD (2 listings)
- Fujifilm DRI-CHEM NX10N (2 listings)
- Abbott NYCOCARD READER II (2 listings)
- HemoCue HbA1c 501 Test Cartridge (2 listings)
- Abbott DETERMINE SYPHILIS TP (2 listings)

### Scope filter

- Dropped as non-diagnostic: 4
  - ARKRAY Insulin Cooling Pouch - Uno Z — keyword "insulin cooling pouch"
  - ARKRAY Insulin Cooling Pouch - Duo Z for Travel — keyword "insulin cooling pouch"
  - Bio-Rad Gene Pulser / MicroPulser Electroporation Cuvettes — source category "Medical LAB"
  - Erba H360 Control — source category "Medical Accesories"
- Instrument child tests expanded into own records: 1231; matched to existing pages: 0

### Brand checks

- Name-derived brand disagreed with the stated brand (16):
  - Mindray Wash Buffer: using **Mindray**, source said EKF Diagnostics
  - Calbiotech Free Testosterone ELISA: using **Calbiotech**, source said InBios
  - ZYBIO EXR 25-OH-VITAMIN-D: using **Zybio**, source said Serum/ Plasma/WB
  - ZYBIO EXR T3: using **Zybio**, source said Serum/ Plasma/ WB
  - Mindray CLIA Hormone Calibrator: using **Mindray**, source said Calibrator
  - Mindray CLIA Thyroid Calibrator: using **Mindray**, source said Calibrator
  - ichroma Beta-HCG Test: using **Boditech**, source said Boditech Med Incorporated
  - ichroma FSH Test: using **Boditech**, source said Boditech Med Incorporated
  - Mindray CLIA Tumor Calibrator: using **Mindray**, source said Calibrator
  - AFIAS 6: using **Boditech**, source said Bio Technology Biotech
  - ichroma PRL Test: using **Boditech**, source said Boditech Med Incorporated
  - Ichroma Tn-I Plus Test: using **Boditech**, source said Boditech Med Incorporated
  - EKF Diagnostics DiaSpect T D24 Hemoglobin Microcuvettes: using **EKF Diagnostics**, source said EKFDiagnostics
  - LumiraDx: using **LumiraDx**, source said Roche
  - Xprecia Prime: using **Siemens Healthineers**, source said Universal Biosensors (OEM/distributor)
  - Xprecia Stride: using **Siemens Healthineers**, source said Universal Biosensors (OEM/distributor)
- Stated brands not in brands.yaml (passed through, tidied): 0 — 
- Products with no brand: 3 — Hepa card, Standrard F HbA1c, Strandard F U-Albumin FIA

### Low classification confidence (< 0.6): 84

- Arkray Urine test strips AUTION SCREEN — 0.59 (tech: none, analyte: none, sample: structured, type: keyword)
- Snibe Maglumi 2000 Plus Chemiluminescence Immunoassay (CLIA) System — 0.59 (tech: keyword, analyte: none, sample: none, type: keyword)
- Snibe Maglumi 600 Chemiluminescence Immunoassay (CLIA) System — 0.59 (tech: keyword, analyte: none, sample: none, type: keyword)
- Snibe Maglumi 800 Chemiluminescence Immunoassay (CLIA) System — 0.59 (tech: keyword, analyte: none, sample: none, type: keyword)
- Snibe MAGLUMI X3 Fully-auto Chemiluminescence Immunoassay (CLIA) System — 0.59 (tech: keyword, analyte: none, sample: none, type: keyword)
- Snibe MAGLUMI X6 Fully-auto Chemiluminescence Immunoassay (CLIA) System — 0.59 (tech: keyword, analyte: none, sample: none, type: keyword)
- Snibe MAGLUMI X8 Fully-auto Chemiluminescence Immunoassay (CLIA) System — 0.59 (tech: keyword, analyte: none, sample: none, type: keyword)
- Acon On Call MultiPro ACR — 0.59 (tech: none, analyte: keyword, sample: structured, type: none)
- Acon On Call MultiPro CRP — 0.59 (tech: none, analyte: keyword, sample: structured, type: none)
- Arkray Orinalyser U500 — 0.48 (tech: none, analyte: none, sample: structured, type: none)
- Medtronic HMS Plus Cartridges - Heparin Dose Response (HDR) - 6-Channel — 0.59 (tech: none, analyte: none, sample: structured, type: keyword)
- URIT PFS - 30 Lipid Meter — 0.56 (tech: none, analyte: keyword, sample: none, type: keyword)
- Qiagen Filter-Tips, 1000 µl — 0.44 (tech: none, analyte: none, sample: none, type: keyword)
- Arkray Blood Lactate Meter Lactate Pro 2 LT-1730 — 0.56 (tech: none, analyte: keyword, sample: none, type: keyword)
- Arkray Trustcheck BPM 3.0 Digital Blood Pressure Monitor — 0.33 (tech: none, analyte: none, sample: none, type: none)
- Erba Mannheim DekaPHAN LAURA — 0.53 (tech: structured, analyte: none, sample: none, type: none)
- Snibe MAGLUMI Starter 1+2 — 0.57 (tech: structured, analyte: none, sample: none, type: technology)
- SD Biosensor G6PD CONTROL — 0.57 (tech: none, analyte: keyword, sample: none, type: keyword:control)
- Snibe MAGLUMI Reaction Cup — 0.57 (tech: structured, analyte: none, sample: none, type: technology)
- Snibe MAGLUMI Light Check — 0.57 (tech: structured, analyte: none, sample: none, type: technology)
- Horiba ABX CRP STD — 0.44 (tech: none, analyte: keyword, sample: none, type: none)
- Horiba ABX Miniclean — 0.33 (tech: none, analyte: none, sample: none, type: none)
- Horiba ABX Minidil LMG — 0.53 (tech: structured, analyte: none, sample: none, type: none)
- Horiba CRP Unit 50 — 0.59 (tech: none, analyte: keyword, sample: structured, type: none)
- EKF Diagnostics Chip sensor glucose (type II) — 0.54 (tech: analyte, analyte: keyword, sample: none, type: none)
- EDAN BC4 i15 Test Cartridge — 0.44 (tech: none, analyte: none, sample: none, type: keyword)
- EDAN BG3 i15 Test Cartridge — 0.44 (tech: none, analyte: none, sample: none, type: keyword)
- EDAN BG4 i15 Test Cartridge — 0.44 (tech: none, analyte: none, sample: none, type: keyword)
- EDAN BG9 i15 Test Cartridge — 0.59 (tech: none, analyte: none, sample: structured, type: keyword)
- EDAN CP50 i15 calibrant fluid pack — 0.54 (tech: analyte, analyte: keyword, sample: none, type: none)
- EDAN CP100 i15 calibrant fluid pack — 0.33 (tech: none, analyte: none, sample: none, type: none)
- Mindray Wash Buffer — 0.56 (tech: category, analyte: none, sample: none, type: keyword)
- EKF Diagnostics Biosen S-Line Lab+ — 0.33 (tech: none, analyte: none, sample: none, type: none)
- EKF Diagnostics EasyCon Norm (QC material) — 0.33 (tech: none, analyte: none, sample: none, type: none)
- EKF Diagnostics Hemolyzing solution cups with 20 µl end-to-end capillaries (plastic capillaries) — 0.33 (tech: none, analyte: none, sample: none, type: none)
- EKF Diagnostics Safecups micro test tubes 2.0 mL — 0.44 (tech: none, analyte: none, sample: none, type: keyword)
- Snibe MAGLUMI Wash Concentrate — 0.5 (tech: category, analyte: none, sample: none, type: technology)
- Zybio EXR 25-OH-VITAMIN-D — 0.57 (tech: structured, analyte: none, sample: none, type: technology)
- Snibe MAGLUMI Tip — 0.5 (tech: category, analyte: none, sample: none, type: technology)
- EKF Diagnostics Biosen Hemolyzing solution cups with 20 µl end-to-end capillaries — 0.48 (tech: none, analyte: none, sample: structured, type: none)
