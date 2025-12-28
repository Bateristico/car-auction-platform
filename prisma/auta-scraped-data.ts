// Real auction data scraped from auta.ch on 2025-12-27
// Images replaced with Unsplash placeholders due to hotlink protection
// These are actual Swiss insurance/dealer car auctions

export interface ScrapedAuction {
  id: number
  title: string
  brand_name: string
  production_date: string
  run: number
  ref_id: string
  end_date: string
  vehicle_type: string
  price: string | null
  subprovider_name: string
  photos: string[]
  data: {
    Typ?: string
    Farbe?: string
    Hubraum?: string
    Zustand?: string
    Neupreis?: string
    Zeitwert?: string
    Bereifung?: string
    "Letzte MFK"?: string
    Ausstattung?: string[]
    "Chassis-Nr."?: string
    Information?: string
    "Schaden-Nr."?: string
    Typenschein?: string
    Reparaturkosten?: string
    Schadenbeschrieb?: string
    "Bauart / Aufbau / Türen"?: string
    Getriebe?: string
    Treibstoff?: string
    Antrieb?: string
  }
}

export const scrapedAuctions: ScrapedAuction[] = [
  {
    "id": 272455,
    "title": "CUPRA CUPRA BORN 58KWH",
    "brand_name": "CUPRA",
    "production_date": "2023-04-21",
    "run": 20008,
    "ref_id": "CHC-455-R",
    "end_date": "2025-12-28T07:42:00",
    "vehicle_type": "car",
    "price": "115500",
    "subprovider_name": "Zürich Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800",
      "https://images.unsplash.com/photo-1619317594084-bfe594e4d5ee?w=800"
    ],
    "data": {
      "Typ": "CUPRA BORN 58KWH",
      "Farbe": "weiss",
      "Zustand": "dem Alter entsprechend",
      "Neupreis": "45'200.00 CHF",
      "Zeitwert": "25'000.00 CHF",
      "Chassis-Nr.": "VSSZZZK19PP029987",
      "Schaden-Nr.": "337.939.752",
      "Typenschein": "IVI",
      "Reparaturkosten": "19'436.25 CHF",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Seitenairbag",
        "Kopfairbag",
        "LED Scheinwerfer",
        "Alufelgen",
        "Automatikgetriebe",
        "Klimaanlage",
        "Elektr. Parkhilfe",
        "Navigationssystem",
        "Radio/CD",
        "ACC Radar",
        "Metallic"
      ],
      "Bauart / Aufbau / Türen": "PKW / Sonstiges / 5"
    }
  },
  {
    "id": 272741,
    "title": "Opel Meriva 1.6i",
    "brand_name": "Opel",
    "production_date": "2009-12-18",
    "run": 168902,
    "ref_id": "CHC-741-R",
    "end_date": "2025-12-28T07:50:37",
    "vehicle_type": "car",
    "price": "18400",
    "subprovider_name": "Baloise Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
      "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800"
    ],
    "data": {
      "Typ": "Meriva 1.6i",
      "Farbe": "schwarz / metallic / 2-Schicht",
      "Hubraum": "1598",
      "Zustand": "durchschnittlich",
      "Neupreis": "27'300.00 CHF",
      "Zeitwert": "4'000.00 CHF",
      "Letzte MFK": "30.09.2022",
      "Chassis-Nr.": "W0L0XCE75A4069809",
      "Schaden-Nr.": "4.8792.25.6-SR-1",
      "Typenschein": "1OB309",
      "Reparaturkosten": "4'500.00 CHF",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Seitenairbag",
        "Klimaanlage",
        "Radio/CD",
        "Metallic"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 272145,
    "title": "Mercedes-Benz GLA SUV",
    "brand_name": "Mercedes-Benz",
    "production_date": "2016-01-26",
    "run": 50950,
    "ref_id": "CHC-145-R",
    "end_date": "2025-12-28T08:02:15",
    "vehicle_type": "car",
    "price": "94900",
    "subprovider_name": "Vaudoise Assurances",
    "photos": [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800",
      "https://images.unsplash.com/photo-1595787572806-dd2b8e39b2cc?w=800",
      "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800"
    ],
    "data": {
      "Typ": "GLA SUV",
      "Farbe": "schwarz / metallic / 2-Schicht",
      "Hubraum": "2143",
      "Zustand": "gepflegt",
      "Neupreis": "65'000.00 CHF",
      "Zeitwert": "17'000.00 CHF",
      "Letzte MFK": "15.11.2022",
      "Chassis-Nr.": "WDC1569051J233174",
      "Schaden-Nr.": "S25-134-898-101",
      "Typenschein": "1MG692",
      "Reparaturkosten": "15'000.00 CHF",
      "Ausstattung": [
        "Airbag Fahrer"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 4"
    }
  },
  {
    "id": 272146,
    "title": "Yamaha TMax 560 ABS Tech Max",
    "brand_name": "Yamaha",
    "production_date": "2020-05-27",
    "run": 12000,
    "ref_id": "CHC-146-R",
    "end_date": "2025-12-28T08:06:19",
    "vehicle_type": "motorcycle",
    "price": null,
    "subprovider_name": "Baloise Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800",
      "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800",
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800"
    ],
    "data": {
      "Typ": "TMax 560 ABS Tech Max",
      "Farbe": "schwarz",
      "Hubraum": "562",
      "Zustand": "gepflegt",
      "Neupreis": "14'810.00 CHF",
      "Zeitwert": "11'900.00 CHF",
      "Chassis-Nr.": "JYASJ184000001293",
      "Schaden-Nr.": "47070108259",
      "Typenschein": "6YA764",
      "Reparaturkosten": "7'500.00 CHF",
      "Bauart / Aufbau / Türen": "Motorrad / Roller / 0"
    }
  },
  {
    "id": 272826,
    "title": "AUDI A7 SPORTB. 50 TDI QUATTRO",
    "brand_name": "AUDI",
    "production_date": "2018-07-10",
    "run": 126000,
    "ref_id": "CHC-826-R",
    "end_date": "2025-12-28T11:49:00",
    "vehicle_type": "car",
    "price": "189200",
    "subprovider_name": "Zürich Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "A7 SPORTB. 50 TDI QUATTRO",
      "Farbe": "schwarz",
      "Hubraum": "2967",
      "Zustand": "gepflegt",
      "Neupreis": "123'250.00 CHF",
      "Zeitwert": "40'504.00 CHF",
      "Chassis-Nr.": "WAUZZZF26KN010948",
      "Schaden-Nr.": "337.851.551",
      "Reparaturkosten": "61'447.95 CHF",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Seitenairbag",
        "Kopfairbag",
        "LED Scheinwerfer",
        "Alufelgen",
        "Automatikgetriebe",
        "Ledersitze",
        "Klimaanlage",
        "Navigationssystem",
        "Radio/CD",
        "ACC Radar",
        "Schiebedach",
        "Metallic"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 270607,
    "title": "Jaguar F-Type Coupé 5.0 V8 R",
    "brand_name": "Jaguar",
    "production_date": "2014-09-15",
    "run": 35000,
    "ref_id": "CHA-607-R",
    "end_date": "2025-12-28T12:35:44",
    "vehicle_type": "car",
    "price": "235100",
    "subprovider_name": "Emil Frey",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "F-Type Coupé 5.0 V8 R",
      "Farbe": "schwarz / metallic",
      "Hubraum": "5000",
      "Zustand": "gepflegt",
      "Getriebe": "Automatik",
      "Treibstoff": "Benzin",
      "Letzte MFK": "12.09.2014",
      "Chassis-Nr.": "SAJAA63H1FMK17310",
      "Typenschein": "1JA319",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Seitenairbag",
        "Kopfairbag",
        "LED Scheinwerfer",
        "Alufelgen",
        "Automatikgetriebe",
        "Ledersitze",
        "Klimaanlage",
        "Navigationssystem",
        "Metallic"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 3"
    }
  },
  {
    "id": 271839,
    "title": "Porsche Macan 2.9 V6 Turbo",
    "brand_name": "Porsche",
    "production_date": "2020-02-10",
    "run": 63500,
    "ref_id": "CHB-839-R",
    "end_date": "2025-12-28T14:06:26",
    "vehicle_type": "car",
    "price": "279100",
    "subprovider_name": "Emil Frey",
    "photos": [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800",
      "https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?w=800"
    ],
    "data": {
      "Typ": "Macan 2.9 V6 Turbo",
      "Hubraum": "2894",
      "Zustand": "neuwertig",
      "Getriebe": "Automatik",
      "Treibstoff": "Benzin",
      "Antrieb": "4x4",
      "Letzte MFK": "12.03.2021",
      "Chassis-Nr.": "WP1ZZZ95ZLLB7244",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Seitenairbag",
        "Kopfairbag",
        "LED Scheinwerfer",
        "Alufelgen",
        "Automatikgetriebe",
        "Ledersitze",
        "Klimaanlage",
        "Elektr. Parkhilfe",
        "Navigationssystem",
        "Radio/CD",
        "ACC Radar",
        "Schiebedach",
        "Metallic"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 272550,
    "title": "MERCEDES-BENZ E 300/350 CDI BE",
    "brand_name": "MERCEDES-BENZ",
    "production_date": "2009-11-26",
    "run": 171283,
    "ref_id": "CHC-550-R",
    "end_date": "2025-12-28T13:23:00",
    "vehicle_type": "car",
    "price": "46500",
    "subprovider_name": "Zürich Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "E 300/350 CDI BE",
      "Farbe": "grau",
      "Hubraum": "2987",
      "Zustand": "gebraucht",
      "Neupreis": "109'632.00 CHF",
      "Zeitwert": "9'458.00 CHF",
      "Letzte MFK": "01.02.2023",
      "Chassis-Nr.": "WDD2122251A109559",
      "Schaden-Nr.": "337.961.954",
      "Typenschein": "1MD958",
      "Reparaturkosten": "18'042.70 CHF",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Alufelgen",
        "Anhängerkupplung",
        "Automatikgetriebe",
        "Ledersitze",
        "Klimaanlage",
        "Elektr. Parkhilfe",
        "Navigationssystem",
        "Radio/CD",
        "Schiebedach",
        "Metallic"
      ],
      "Bauart / Aufbau / Türen": "PKW / Kombi / 5"
    }
  },
  {
    "id": 272562,
    "title": "AUDI Q5 2.0 TDI QUATTRO",
    "brand_name": "AUDI",
    "production_date": "2015-07-03",
    "run": 123787,
    "ref_id": "CHC-562-R",
    "end_date": "2025-12-28T14:01:00",
    "vehicle_type": "car",
    "price": "87400",
    "subprovider_name": "Zürich Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "Q5 2.0 TDI QUATTRO",
      "Farbe": "blau",
      "Hubraum": "1968",
      "Zustand": "gebraucht",
      "Neupreis": "78'299.00 CHF",
      "Zeitwert": "19'000.00 CHF",
      "Letzte MFK": "01.04.2021",
      "Chassis-Nr.": "WAUZZZ8R0GA004474",
      "Schaden-Nr.": "337.820.982",
      "Reparaturkosten": "7'305.45 CHF",
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 272280,
    "title": "BMW X3 F25 20d xDrive SAG",
    "brand_name": "BMW",
    "production_date": "2015-06-24",
    "run": 176328,
    "ref_id": "CHC-280-R",
    "end_date": "2025-12-28T14:03:58",
    "vehicle_type": "car",
    "price": "68500",
    "subprovider_name": "Baloise Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=800",
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800",
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800"
    ],
    "data": {
      "Typ": "X3 F25 20d xDrive SAG",
      "Farbe": "schwarz / metallic / 2-Schicht",
      "Hubraum": "1995",
      "Neupreis": "76'830.00 CHF",
      "Zeitwert": "13'000.00 CHF",
      "Bereifung": "Pirelli Sottozero Winter 245/50 R 18 100 H",
      "Chassis-Nr.": "WBAWZ510X00M12080",
      "Schaden-Nr.": "47093011259",
      "Typenschein": "1BG406",
      "Reparaturkosten": "9'439.55 CHF",
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 272520,
    "title": "BMW 318D",
    "brand_name": "BMW",
    "production_date": "2014-09-17",
    "run": 203031,
    "ref_id": "CHC-520-R",
    "end_date": "2025-12-28T11:06:00",
    "vehicle_type": "car",
    "price": "50200",
    "subprovider_name": "Zürich Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=800",
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800",
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800"
    ],
    "data": {
      "Typ": "318D",
      "Farbe": "weiss",
      "Hubraum": "1995",
      "Zustand": "dem Alter und Kilometer entsprechend",
      "Neupreis": "60'630.00 CHF",
      "Zeitwert": "9'030.00 CHF",
      "Letzte MFK": "01.01.2024",
      "Chassis-Nr.": "WBA3D11000J854578",
      "Schaden-Nr.": "337.737.962",
      "Typenschein": "1BD625",
      "Reparaturkosten": "14'070.05 CHF",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Seitenairbag",
        "Kopfairbag",
        "Xenon Scheinwerfer",
        "Alufelgen",
        "Automatikgetriebe",
        "Klimaanlage",
        "Elektr. Parkhilfe",
        "Navigationssystem",
        "Radio/CD"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 4"
    }
  },
  {
    "id": 272809,
    "title": "Jeep Cherokee 2.0 TD",
    "brand_name": "Jeep",
    "production_date": "2014-08-14",
    "run": 87700,
    "ref_id": "CHC-809-R",
    "end_date": "2025-12-28T11:13:24",
    "vehicle_type": "car",
    "price": "58400",
    "subprovider_name": "[Profi-Händler]",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "Jeep Cherokee 2.0 TD",
      "Farbe": "dunkelgrau-metallic / grau",
      "Hubraum": "1956",
      "Letzte MFK": "11.09.2024",
      "Chassis-Nr.": "1C4PJLCY6EW282955",
      "Typenschein": "1JB112",
      "Ausstattung": [
        "Alufelgen",
        "Metallic"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 272814,
    "title": "VW Transporter",
    "brand_name": "VW",
    "production_date": "2017-05-03",
    "run": 278000,
    "ref_id": "CHC-814-R",
    "end_date": "2025-12-28T11:30:39",
    "vehicle_type": "truck",
    "price": null,
    "subprovider_name": "[Profi-Händler]",
    "photos": [
      "https://images.unsplash.com/photo-1471479917193-f00955256257?w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800"
    ],
    "data": {
      "Typ": "VW Transporter",
      "Farbe": "weiss",
      "Hubraum": "1968",
      "Chassis-Nr.": "WV1ZZZ7HZHH127813",
      "Bauart / Aufbau / Türen": "PKW / Limousine / 0"
    }
  },
  {
    "id": 272567,
    "title": "Toyota Yaris",
    "brand_name": "Toyota",
    "production_date": "2023-07-06",
    "run": 62230,
    "ref_id": "CHC-567-R",
    "end_date": "2025-12-28T14:25:52",
    "vehicle_type": "car",
    "price": "74700",
    "subprovider_name": "[Sonstige Versicherung]",
    "photos": [
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "Yaris",
      "Farbe": "weiss",
      "Hubraum": "1490",
      "Zustand": "durchschnittlich",
      "Bereifung": "185/65/15",
      "Letzte MFK": "06.07.2023",
      "Chassis-Nr.": "YARKBAC3700143716",
      "Schaden-Nr.": "CHM-2025-1005614",
      "Typenschein": "1TB481",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Alufelgen",
        "Automatikgetriebe",
        "Klimaanlage",
        "Navigationssystem",
        "Radio/CD"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 272612,
    "title": "HYUNDAI I10 1.0 ORIGO AUT.",
    "brand_name": "HYUNDAI",
    "production_date": "2024-12-30",
    "run": 18970,
    "ref_id": "CHC-612-R",
    "end_date": "2025-12-28T15:20:00",
    "vehicle_type": "car",
    "price": "71900",
    "subprovider_name": "Zürich Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "I10 1.0 ORIGO AUT. ORIGO",
      "Farbe": "weiss",
      "Hubraum": "998",
      "Zustand": "gut",
      "Neupreis": "19'600.00 CHF",
      "Zeitwert": "15'021.00 CHF",
      "Letzte MFK": "01.12.2024",
      "Chassis-Nr.": "NLHDN51C8SZ305485",
      "Schaden-Nr.": "337.939.298",
      "Typenschein": "1HC587",
      "Reparaturkosten": "16'303.70 CHF",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Seitenairbag",
        "Kopfairbag",
        "Automatikgetriebe",
        "Klimaanlage",
        "Radio/CD"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 4"
    }
  },
  {
    "id": 272896,
    "title": "Mercedes Benz A250 4m",
    "brand_name": "Mercedes Benz",
    "production_date": "2013-08-21",
    "run": 69500,
    "ref_id": "CHC-896-R",
    "end_date": "2025-12-28T16:00:39",
    "vehicle_type": "car",
    "price": "71200",
    "subprovider_name": "Emil Frey",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "A250 4m",
      "Farbe": "grau / metallic",
      "Hubraum": "1991",
      "Zustand": "gepflegt",
      "Getriebe": "Automatik",
      "Treibstoff": "Benzin",
      "Antrieb": "4x4",
      "Letzte MFK": "28.08.2023",
      "Chassis-Nr.": "WDD1760461J162154",
      "Typenschein": "1MF499",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Seitenairbag",
        "Kopfairbag",
        "Xenon Scheinwerfer",
        "Alufelgen",
        "Automatikgetriebe",
        "Ledersitze",
        "Klimaanlage",
        "Navigationssystem",
        "Radio/CD",
        "ACC Radar",
        "Metallic"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 272909,
    "title": "BMW 118i",
    "brand_name": "BMW",
    "production_date": "2016-01-25",
    "run": 91500,
    "ref_id": "CHC-909-R",
    "end_date": "2025-12-28T16:09:24",
    "vehicle_type": "car",
    "price": "55700",
    "subprovider_name": "Emil Frey",
    "photos": [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=800",
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800",
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800"
    ],
    "data": {
      "Typ": "118i",
      "Farbe": "weiss",
      "Hubraum": "1499",
      "Zustand": "gepflegt",
      "Treibstoff": "Benzin",
      "Bereifung": "Ganzjahresreifen",
      "Letzte MFK": "09.06.2023",
      "Chassis-Nr.": "WBA1R51080V751434",
      "Typenschein": "1BG736",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Seitenairbag"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 0"
    }
  },
  {
    "id": 272355,
    "title": "CITROEN C5 Tourer 2.2 HDi Exclusive Automatic",
    "brand_name": "CITROEN",
    "production_date": "2014-01-30",
    "run": 215812,
    "ref_id": "CHC-355-R",
    "end_date": "2025-12-28T16:16:05",
    "vehicle_type": "car",
    "price": "40000",
    "subprovider_name": "Baloise Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "C5 Tourer 2.2 HDi Exclusive Automatic",
      "Farbe": "grau / metallic / 2-Schicht",
      "Hubraum": "2179",
      "Zustand": "gepflegt",
      "Neupreis": "58'320.00 CHF",
      "Zeitwert": "8'700.00 CHF",
      "Bereifung": "225/55 R17",
      "Letzte MFK": "25.01.2024",
      "Chassis-Nr.": "VF7RW4HLAEL500510",
      "Schaden-Nr.": "4.8379.25.4-SR-1",
      "Typenschein": "1CE833",
      "Reparaturkosten": "15'000.00 CHF",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Seitenairbag",
        "Kopfairbag",
        "Xenon Scheinwerfer",
        "Alufelgen",
        "Anhängerkupplung",
        "Automatikgetriebe",
        "Ledersitze",
        "Klimaanlage",
        "Elektr. Parkhilfe",
        "Navigationssystem",
        "Metallic"
      ],
      "Bauart / Aufbau / Türen": "PKW / Kombi / 5"
    }
  },
  {
    "id": 272283,
    "title": "Skoda Octavia Combi 1.8 TSI 4x4",
    "brand_name": "Skoda",
    "production_date": "2012-06-08",
    "run": 131481,
    "ref_id": "CHC-283-R",
    "end_date": "2025-12-28T14:11:36",
    "vehicle_type": "car",
    "price": "31900",
    "subprovider_name": "[Profi-Händler]",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
      "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800"
    ],
    "data": {
      "Typ": "Octavia Combi 1.8 TSI 4x4",
      "Farbe": "grau",
      "Hubraum": "1798",
      "Zustand": "gepflegt",
      "Letzte MFK": "14.12.2022",
      "Chassis-Nr.": "TMBKK61Z8C2189654",
      "Typenschein": "1SF660",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Seitenairbag",
        "Alufelgen",
        "Anhängerkupplung",
        "Klimaanlage",
        "Radio/CD",
        "Metallic"
      ],
      "Bauart / Aufbau / Türen": "PKW / Kombi / 5"
    }
  },
  {
    "id": 272773,
    "title": "Citroen Grand C4 Picasso",
    "brand_name": "Citroen",
    "production_date": "2010-10-01",
    "run": 157376,
    "ref_id": "CHC-773-R",
    "end_date": "2025-12-28T09:44:45",
    "vehicle_type": "car",
    "price": "23000",
    "subprovider_name": "Generali Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "Grand C4 Picasso",
      "Farbe": "grau / metallic",
      "Hubraum": "1598",
      "Zustand": "durchschnittlich",
      "Neupreis": "45'000.00 CHF",
      "Zeitwert": "5'000.00 CHF",
      "Letzte MFK": "16.08.2024",
      "Chassis-Nr.": "VF7UA5FV8AJ780169",
      "Schaden-Nr.": "25-121666",
      "Typenschein": "1598",
      "Reparaturkosten": "10'000.00 CHF",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Automatikgetriebe",
        "Klimaanlage",
        "Elektr. Parkhilfe"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 272494,
    "title": "OPEL CORSA 1.0 T ECOF COLOR ED",
    "brand_name": "OPEL",
    "production_date": "2018-03-29",
    "run": 220531,
    "ref_id": "CHC-494-R",
    "end_date": "2025-12-28T09:57:00",
    "vehicle_type": "car",
    "price": "28800",
    "subprovider_name": "Zürich Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "CORSA 1.0 T ECOF COLOR ED",
      "Farbe": "blau",
      "Hubraum": "999",
      "Zustand": "dem Alter entsprechend",
      "Neupreis": "20'350.00 CHF",
      "Zeitwert": "6'000.00 CHF",
      "Letzte MFK": "01.12.2024",
      "Chassis-Nr.": "W0V0XEP68J4087914",
      "Schaden-Nr.": "337.959.575",
      "Typenschein": "1OC533",
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 272501,
    "title": "SKODA OCTAVIA 1.6 TDI AMBITION",
    "brand_name": "SKODA",
    "production_date": "2013-04-22",
    "run": 106167,
    "ref_id": "CHC-501-R",
    "end_date": "2025-12-28T10:25:00",
    "vehicle_type": "car",
    "price": "40000",
    "subprovider_name": "Zürich Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "OCTAVIA 1.6 TDI AMBITION",
      "Farbe": "grau",
      "Hubraum": "1598",
      "Zustand": "dem Alter entsprechend",
      "Neupreis": "37'778.00 CHF",
      "Zeitwert": "8'700.00 CHF",
      "Letzte MFK": "01.11.2022",
      "Chassis-Nr.": "TMBHT61Z6D2116050",
      "Schaden-Nr.": "337.959.575",
      "Typenschein": "1SF704",
      "Bauart / Aufbau / Türen": "PKW / Kombi / 5"
    }
  },
  {
    "id": 272517,
    "title": "AUDI A3 1.8T FSI ATTRACTION",
    "brand_name": "AUDI",
    "production_date": "2008-04-21",
    "run": 294440,
    "ref_id": "CHC-517-R",
    "end_date": "2025-12-28T10:53:00",
    "vehicle_type": "car",
    "price": "23800",
    "subprovider_name": "Zürich Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "A3 1.8T FSI ATTRACTION",
      "Farbe": "grau",
      "Hubraum": "1798",
      "Zustand": "dem Alter entsprechend",
      "Neupreis": "39'770.00 CHF",
      "Zeitwert": "2'000.00 CHF",
      "Letzte MFK": "01.06.2022",
      "Chassis-Nr.": "WAUZZZ8P68A156484",
      "Schaden-Nr.": "337.270.675",
      "Typenschein": "1AC390",
      "Reparaturkosten": "2'793.00 CHF",
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 272570,
    "title": "HONDA CB 125 R",
    "brand_name": "HONDA",
    "production_date": "2021-07-29",
    "run": 25046,
    "ref_id": "CHC-570-R",
    "end_date": "2025-12-28T14:26:00",
    "vehicle_type": "motorcycle",
    "price": null,
    "subprovider_name": "Zürich Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "CB 125 R",
      "Farbe": "grau",
      "Hubraum": "125",
      "Zustand": "gut",
      "Neupreis": "5'760.00 CHF",
      "Zeitwert": "3'620.00 CHF",
      "Letzte MFK": "01.07.2021",
      "Chassis-Nr.": "MLHJC91A6M5007399",
      "Schaden-Nr.": "337.919.302",
      "Typenschein": "6HA655",
      "Bauart / Aufbau / Türen": "Motorrad / Sonstiges / 0"
    }
  },
  {
    "id": 272615,
    "title": "CITROEN BERLINGO 1.6 HDI MSPACESP",
    "brand_name": "CITROEN",
    "production_date": "2010-12-16",
    "run": 174640,
    "ref_id": "CHC-615-R",
    "end_date": "2025-12-28T15:23:00",
    "vehicle_type": "car",
    "price": "27600",
    "subprovider_name": "Zürich Versicherung",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"
    ],
    "data": {
      "Typ": "BERLINGO 1.6 HDI MSPACESP",
      "Farbe": "grau",
      "Hubraum": "1560",
      "Zustand": "gebraucht",
      "Neupreis": "33'540.00 CHF",
      "Zeitwert": "6'000.00 CHF",
      "Letzte MFK": "01.11.2023",
      "Chassis-Nr.": "VF77J9HZCAJ770096",
      "Schaden-Nr.": "337.963.969",
      "Typenschein": "1CD859",
      "Bauart / Aufbau / Türen": "PKW / Van / 5"
    }
  },
  {
    "id": 272442,
    "title": "Opel Meriva A 18",
    "brand_name": "Opel",
    "production_date": "2008-11-07",
    "run": 180000,
    "ref_id": "CHC-442-R",
    "end_date": "2025-12-28T08:00:38",
    "vehicle_type": "car",
    "price": "13400",
    "subprovider_name": "[Private]",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
      "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800"
    ],
    "data": {
      "Typ": "Meriva A 18",
      "Farbe": "metallic",
      "Hubraum": "1796",
      "Zustand": "durchschnittlich",
      "Letzte MFK": "08.05.2023",
      "Chassis-Nr.": "W0L0XCE7594055367",
      "Typenschein": "1OB210",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer",
        "Alufelgen",
        "Automatikgetriebe",
        "Klimaanlage"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  },
  {
    "id": 272444,
    "title": "Opel Combo C16CNG",
    "brand_name": "Opel",
    "production_date": "2009-11-10",
    "run": 92900,
    "ref_id": "CHC-444-R",
    "end_date": "2025-12-28T08:01:07",
    "vehicle_type": "car",
    "price": "15900",
    "subprovider_name": "[Private]",
    "photos": [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
      "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800"
    ],
    "data": {
      "Typ": "Combo C16CNG",
      "Farbe": "weiss",
      "Hubraum": "1598",
      "Zustand": "gepflegt",
      "Letzte MFK": "15.11.2023",
      "Chassis-Nr.": "W0L0XCF25A4016899",
      "Typenschein": "30A591",
      "Ausstattung": [
        "Airbag Fahrer",
        "Airbag Beifahrer"
      ],
      "Bauart / Aufbau / Türen": "PKW / Limousine / 5"
    }
  }
]
