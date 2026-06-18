/* ==========================================================================
   FG-BMK (TPAMI) project page — inlined data
   All leaderboard / findings data is embedded here (instead of fetched) so the
   page renders correctly even when opened directly from disk (file://), where
   browsers block fetch() of local JSON. Values are identical to the verified
   ICLR page; do not edit numbers without re-verifying against the paper.
   ========================================================================== */
window.FGBMK_DATA = {
  knowledgeBias: {
    "datasets": [
      {
        "key": "cub",
        "name": "CUB-200"
      },
      {
        "key": "stanforddog",
        "name": "Stanford Dogs"
      },
      {
        "key": "aircraft",
        "name": "FGVC Aircraft"
      },
      {
        "key": "flowers102",
        "name": "Flowers-102"
      }
    ],
    "data": {
      "cub": [
        {
          "model": "GPT-4o",
          "badge": "LVLM",
          "overall": 96.9,
          "worst": {
            "cat": "Tree Sparrow",
            "acc": 66.7
          },
          "best": {
            "cat": "Common Yellowthroat",
            "acc": 100.0
          },
          "gap": 33.3,
          "std": 4.5,
          "n": 200,
          "perfect": 77,
          "hist": [
            0,
            1,
            2,
            9,
            188
          ]
        },
        {
          "model": "Qwen3-VL",
          "badge": "LVLM",
          "overall": 93.5,
          "worst": {
            "cat": "Spotted Catbird",
            "acc": 53.3
          },
          "best": {
            "cat": "Winter Wren",
            "acc": 100.0
          },
          "gap": 46.7,
          "std": 8.7,
          "n": 200,
          "perfect": 45,
          "hist": [
            4,
            1,
            8,
            23,
            164
          ]
        },
        {
          "model": "InternVL3",
          "badge": "LVLM",
          "overall": 90.8,
          "worst": {
            "cat": "Black Billed Cuckoo",
            "acc": 40.0
          },
          "best": {
            "cat": "Pileated Woodpecker",
            "acc": 100.0
          },
          "gap": 60.0,
          "std": 8.9,
          "n": 200,
          "perfect": 23,
          "hist": [
            3,
            3,
            12,
            48,
            134
          ]
        },
        {
          "model": "Qwen2.5-VL",
          "badge": "LVLM",
          "overall": 90.2,
          "worst": {
            "cat": "Swainson Warbler",
            "acc": 48.1
          },
          "best": {
            "cat": "Winter Wren",
            "acc": 100.0
          },
          "gap": 51.9,
          "std": 12.8,
          "n": 200,
          "perfect": 46,
          "hist": [
            9,
            10,
            17,
            24,
            140
          ]
        },
        {
          "model": "LLaVA-1.5",
          "badge": "LVLM",
          "overall": 76.8,
          "worst": {
            "cat": "Black Billed Cuckoo",
            "acc": 28.3
          },
          "best": {
            "cat": "Common Raven",
            "acc": 100.0
          },
          "gap": 71.7,
          "std": 14.0,
          "n": 200,
          "perfect": 2,
          "hist": [
            25,
            21,
            49,
            74,
            31
          ]
        }
      ],
      "stanforddog": [
        {
          "model": "Qwen2.5-VL",
          "badge": "LVLM",
          "overall": 94.2,
          "worst": {
            "cat": "Giant Schnauzer",
            "acc": 61.4
          },
          "best": {
            "cat": "Mexican Hairless",
            "acc": 100.0
          },
          "gap": 38.6,
          "std": 6.2,
          "n": 120,
          "perfect": 3,
          "hist": [
            0,
            2,
            2,
            15,
            101
          ]
        },
        {
          "model": "Qwen3-VL",
          "badge": "LVLM",
          "overall": 92.1,
          "worst": {
            "cat": "Boston Bull",
            "acc": 57.3
          },
          "best": {
            "cat": "Pug",
            "acc": 100.0
          },
          "gap": 42.7,
          "std": 8.0,
          "n": 120,
          "perfect": 5,
          "hist": [
            1,
            2,
            7,
            17,
            93
          ]
        },
        {
          "model": "InternVL3",
          "badge": "LVLM",
          "overall": 91.9,
          "worst": {
            "cat": "Cardigan",
            "acc": 70.0
          },
          "best": {
            "cat": "African Hunting Dog",
            "acc": 100.0
          },
          "gap": 30.0,
          "std": 5.3,
          "n": 120,
          "perfect": 2,
          "hist": [
            0,
            0,
            4,
            31,
            85
          ]
        },
        {
          "model": "LLaVA-1.5",
          "badge": "LVLM",
          "overall": 77.3,
          "worst": {
            "cat": "Dandie Dinmont",
            "acc": 33.1
          },
          "best": {
            "cat": "Staffordshire Bullterrier",
            "acc": 96.4
          },
          "gap": 63.2,
          "std": 12.5,
          "n": 120,
          "perfect": 0,
          "hist": [
            12,
            13,
            38,
            40,
            17
          ]
        }
      ],
      "aircraft": [
        {
          "model": "Qwen2.5-VL",
          "badge": "LVLM",
          "overall": 88.9,
          "worst": {
            "cat": "Dhc-1",
            "acc": 47.0
          },
          "best": {
            "cat": "Tornado",
            "acc": 100.0
          },
          "gap": 53.0,
          "std": 9.8,
          "n": 100,
          "perfect": 9,
          "hist": [
            1,
            5,
            11,
            31,
            52
          ]
        },
        {
          "model": "InternVL3",
          "badge": "LVLM",
          "overall": 87.1,
          "worst": {
            "cat": "Md-90",
            "acc": 54.5
          },
          "best": {
            "cat": "Tornado",
            "acc": 100.0
          },
          "gap": 45.5,
          "std": 7.5,
          "n": 100,
          "perfect": 2,
          "hist": [
            1,
            1,
            11,
            51,
            36
          ]
        },
        {
          "model": "Qwen3-VL",
          "badge": "LVLM",
          "overall": 80.5,
          "worst": {
            "cat": "E-195",
            "acc": 45.5
          },
          "best": {
            "cat": "Tornado",
            "acc": 100.0
          },
          "gap": 54.5,
          "std": 13.0,
          "n": 100,
          "perfect": 2,
          "hist": [
            7,
            15,
            22,
            31,
            25
          ]
        },
        {
          "model": "LLaVA-1.5",
          "badge": "LVLM",
          "overall": 78.7,
          "worst": {
            "cat": "Yak-42",
            "acc": 39.4
          },
          "best": {
            "cat": "Hawk T1",
            "acc": 98.5
          },
          "gap": 59.1,
          "std": 11.9,
          "n": 100,
          "perfect": 0,
          "hist": [
            6,
            11,
            31,
            35,
            17
          ]
        }
      ],
      "flowers102": [
        {
          "model": "GPT-4o",
          "badge": "LVLM",
          "overall": 96.3,
          "worst": {
            "cat": "Ball Moss",
            "acc": 48.1
          },
          "best": {
            "cat": "Blackberry Lily",
            "acc": 100.0
          },
          "gap": 51.9,
          "std": 11.2,
          "n": 102,
          "perfect": 72,
          "hist": [
            5,
            0,
            2,
            4,
            91
          ]
        },
        {
          "model": "Qwen3-VL",
          "badge": "LVLM",
          "overall": 93.8,
          "worst": {
            "cat": "Pink Primrose",
            "acc": 47.5
          },
          "best": {
            "cat": "Blanket Flower",
            "acc": 100.0
          },
          "gap": 52.5,
          "std": 13.7,
          "n": 102,
          "perfect": 40,
          "hist": [
            7,
            2,
            3,
            3,
            87
          ]
        },
        {
          "model": "Qwen2.5-VL",
          "badge": "LVLM",
          "overall": 93.3,
          "worst": {
            "cat": "Watercress",
            "acc": 46.7
          },
          "best": {
            "cat": "Hippeastrum",
            "acc": 100.0
          },
          "gap": 53.3,
          "std": 12.5,
          "n": 102,
          "perfect": 33,
          "hist": [
            6,
            1,
            3,
            6,
            86
          ]
        },
        {
          "model": "InternVL3",
          "badge": "LVLM",
          "overall": 89.2,
          "worst": {
            "cat": "Ball Moss",
            "acc": 38.5
          },
          "best": {
            "cat": "Water Lily",
            "acc": 100.0
          },
          "gap": 61.5,
          "std": 12.4,
          "n": 102,
          "perfect": 5,
          "hist": [
            5,
            3,
            4,
            27,
            63
          ]
        },
        {
          "model": "LLaVA-1.5",
          "badge": "LVLM",
          "overall": 76.8,
          "worst": {
            "cat": "Watercress",
            "acc": 32.6
          },
          "best": {
            "cat": "Sunflower",
            "acc": 100.0
          },
          "gap": 67.4,
          "std": 13.5,
          "n": 102,
          "perfect": 2,
          "hist": [
            10,
            16,
            32,
            28,
            16
          ]
        }
      ]
    }
  },

  machine: {
    classification: [
      { id: 1, model: "InternVL", badge: "LVLM", scores: { cub: 89.92, flowers: 99.41, dogs: 89.09, cars: 93.34, aircrafts: 79.05, products: 58.03, food101: 96.07, clothes: 71.12, vegfru: 95.57, skincon: 94.53, wine: 94.07, inat2021: 57.90 } },
      { id: 2, model: "DINOv2-L", badge: "PURE VISION", scores: { cub: 91.65, flowers: 99.69, dogs: 90.50, cars: 91.72, aircrafts: 78.88, products: 58.88, food101: 95.12, clothes: 66.70, vegfru: 96.44, skincon: 94.79, wine: 96.36, inat2021: 77.07 } },
      { id: 3, model: "EVA-CLIP", badge: "VLM", scores: { cub: 88.95, flowers: 99.45, dogs: 87.69, cars: 94.30, aircrafts: 70.27, products: 65.05, food101: 95.67, clothes: 72.03, vegfru: 94.73, skincon: 94.49, wine: 92.53, inat2021: 64.70 } },
      { id: 4, model: "BEIT3", badge: "VLM", scores: { cub: 82.67, flowers: 95.59, dogs: 80.07, cars: 88.43, aircrafts: 50.47, products: 49.21, food101: 89.13, clothes: 65.45, vegfru: 85.84, skincon: 86.42, wine: 88.85, inat2021: 43.55 } },
      { id: 5, model: "Qwen", badge: "LVLM", scores: { cub: 80.08, flowers: 97.43, dogs: 77.02, cars: 90.67, aircrafts: 51.15, products: 54.33, food101: 88.90, clothes: 69.37, vegfru: 86.98, skincon: 73.90, wine: 90.70, inat2021: 38.90 } },
      { id: 6, model: "CoCa", badge: "VLM", scores: { cub: 79.89, flowers: 98.46, dogs: 81.24, cars: 92.36, aircrafts: 63.40, products: 39.12, food101: 92.38, clothes: 71.45, vegfru: 91.08, skincon: 86.70, wine: 90.72, inat2021: 40.59 } },
      { id: 7, model: "LLaVA-1.5-7B", badge: "LVLM", scores: { cub: 79.54, flowers: 98.04, dogs: 80.73, cars: 87.56, aircrafts: 62.46, products: 51.31, food101: 94.53, clothes: 68.69, vegfru: 90.72, skincon: 81.29, wine: 93.98, inat2021: 39.77 } }
    ],
    retrieval: [
      { id: 1, model: "InternVL", badge: "LVLM", scores: { cub: 91.47, flowers: 99.66, dogs: 92.33, cars: 92.47, aircrafts: 79.86, products: 44.08, food101: 96.17, clothes: 70.68, vegfru: 95.88, skincon: 64.86, wine: 71.61, inat2021: 42.97 } },
      { id: 2, model: "DINOv2-L", badge: "PURE VISION", scores: { cub: 91.95, flowers: 99.70, dogs: 91.72, cars: 89.53, aircrafts: 81.07, products: 30.05, food101: 92.48, clothes: 69.53, vegfru: 95.06, skincon: 62.49, wine: 78.77, inat2021: 40.58 } },
      { id: 3, model: "EVA-CLIP", badge: "VLM", scores: { cub: 90.33, flowers: 99.60, dogs: 89.47, cars: 95.11, aircrafts: 77.81, products: 48.05, food101: 95.09, clothes: 73.69, vegfru: 93.77, skincon: 67.32, wine: 70.66, inat2021: 38.65 } },
      { id: 4, model: "BEIT3", badge: "VLM", scores: { cub: 84.06, flowers: 95.98, dogs: 82.96, cars: 88.77, aircrafts: 57.64, products: 37.36, food101: 86.27, clothes: 66.40, vegfru: 83.89, skincon: 62.48, wine: 68.50, inat2021: 31.83 } },
      { id: 5, model: "CoCa", badge: "VLM", scores: { cub: 77.38, flowers: 96.88, dogs: 79.46, cars: 88.44, aircrafts: 69.46, products: 32.94, food101: 85.79, clothes: 69.55, vegfru: 85.54, skincon: 60.23, wine: 65.40, inat2021: 36.88 } },
      { id: 6, model: "LLaVA-1.5-7B", badge: "LVLM", scores: { cub: 75.63, flowers: 96.24, dogs: 77.43, cars: 85.49, aircrafts: 63.56, products: 30.85, food101: 87.55, clothes: 67.86, vegfru: 79.04, skincon: 61.44, wine: 65.19, inat2021: 34.79 } },
      { id: 7, model: "Qwen", badge: "LVLM", scores: { cub: 74.80, flowers: 95.11, dogs: 74.16, cars: 86.64, aircrafts: 50.66, products: 29.29, food101: 81.77, clothes: 68.78, vegfru: 78.06, skincon: 60.51, wine: 62.84, inat2021: 35.67 } }
    ]
  },

  attribute: [
    { id: 1, model: "InternVL3-7B", badge: "LVLM",
      overview: { color: 47.4, pattern: 50.13, shape: 30.95, length: 71.03, size: 52.55 },
      color: { belly: 58.49, back: 34.98, bill: 51.31, breast: 54.25, crown: 55.3, eye: 84.59, forehead: 53.32, leg: 44.01, nape: 39.24, throat: 52.77, under_tail: 34.69, underparts: 56.2, upper_tail: 37.3, upperparts: 28.75, wing: 30.16, primary: 43.05 },
      pattern: { back: 40.94, tail: 41.64, belly: 68.13, wing: 49.04, breast: 65.12, head: 35.92 },
      shape: { bill: 37.61, shape: 52.37, tail: 10.42, wing: 23.39 } },
    { id: 2, model: "Gemini-2.0-flash", badge: "LVLM",
      overview: { color: 47.22, pattern: 56.14, shape: 48.75, length: 71.82, size: 52.72 },
      color: { belly: 36.51, back: 62.09, bill: 52.31, breast: 56.01, crown: 59.57, eye: 56.44, forehead: 53.55, leg: 40.66, nape: 60.23, throat: 40.4, under_tail: 40.6, underparts: 59.65, upper_tail: 39.99, upperparts: 29.66, wing: 29.21, primary: 38.69 },
      pattern: { back: 56.26, tail: 52.33, belly: 70.51, wing: 51.26, breast: 66.89, head: 39.56 },
      shape: { bill: 61.62, shape: 68.2, tail: 32.13, wing: 33.04 } },
    { id: 3, model: "LLaVA-1.5-7B", badge: "LVLM",
      overview: { color: 44.34, pattern: 23.69, shape: 14.05, length: 15.71, size: 49.47 },
      color: { belly: 54.79, back: 41.44, bill: 41.9, breast: 49.56, crown: 48.71, eye: 47.03, forehead: 69.27, leg: 35.37, nape: 40.51, throat: 35.4, under_tail: 38.88, underparts: 54.81, upper_tail: 41.41, upperparts: 34.0, wing: 34.6, primary: 41.77 },
      pattern: { back: 27.27, tail: 23.19, belly: 26.41, wing: 29.67, breast: 24.24, head: 11.35 },
      shape: { bill: 1.39, shape: 18.59, tail: 9.89, wing: 26.34 } },
    { id: 4, model: "Qwen2.5-VL", badge: "LVLM",
      overview: { color: 40.39, pattern: 45.12, shape: 29.3, length: 63.2, size: 52.56 },
      color: { belly: 51.11, back: 32.89, bill: 44.84, breast: 37.79, crown: 46.54, eye: 46.5, forehead: 44.57, leg: 36.49, nape: 40.74, throat: 34.6, under_tail: 27.2, underparts: 50.2, upper_tail: 34.92, upperparts: 26.03, wing: 36.96, primary: 20.9 },
      pattern: { back: 42.66, tail: 45.04, belly: 64.58, wing: 44.11, breast: 59.79, head: 14.57 },
      shape: { bill: 15.3, shape: 58.17, tail: 5.63, wing: 38.1 } },
    { id: 5, model: "BLIP-2", badge: "LVLM",
      overview: { color: 37.94, pattern: 11.34, shape: 25.05, length: 30.11, size: 27.62 },
      color: { belly: 51.15, back: 39.64, bill: 23.42, breast: 50.17, crown: 42.59, eye: 43.18, forehead: 23.59, leg: 18.77, nape: 41.55, throat: 53.81, under_tail: 37.98, underparts: 41.6, upper_tail: 37.52, upperparts: 33.01, wing: 31.25, primary: 33.48 },
      pattern: { back: 14.66, tail: 14.21, belly: 9.48, wing: 7.82, breast: 19.73, head: 2.14 },
      shape: { bill: 8.84, shape: 34.69, tail: 13.51, wing: 43.19 } },
    { id: 6, model: "GPT-4o", badge: "LVLM",
      overview: { color: 44.95, pattern: 52.24, shape: 45.64, length: 74.38, size: 50.73 },
      color: { belly: 60.22, back: 38.16, bill: 51.47, breast: 55.97, crown: 55.23, eye: 30.94, forehead: 53.12, leg: 40.46, nape: 41.5, throat: 57.71, under_tail: 35.97, underparts: 60.51, upper_tail: 37.97, upperparts: 30.0, wing: 30.67, primary: 39.22 },
      pattern: { back: 48.16, tail: 42.56, belly: 68.78, wing: 50.14, breast: 65.45, head: 38.35 },
      shape: { bill: 48.23, shape: 65.55, tail: 28.66, wing: 40.13 } },
    { id: 7, model: "Qwen-VL-Chat", badge: "LVLM",
      overview: { color: 30.28, pattern: 49.29, shape: 17.09, length: 12.23, size: 1.23 },
      color: { belly: 34.2, back: 33.51, bill: 26.92, breast: 31.3, crown: 42.03, eye: 15.76, forehead: 38.82, leg: 26.02, nape: 33.82, throat: 26.64, under_tail: 27.27, underparts: 28.74, upper_tail: 32.7, upperparts: 26.26, wing: 25.64, primary: 34.78 },
      pattern: { back: 52.01, tail: 51.06, belly: 70.14, wing: 45.27, breast: 64.82, head: 12.42 },
      shape: { bill: 0.76, shape: 36.02, tail: 1.37, wing: 30.2 } }
  ],

  hierarchical: {
    overview: [
      { model: "InternVL3-7B", badge: "LVLM", aircrafts: { choice: 85.48, judgment: 86.92 }, clothes: { choice: 89.08, judgment: 87.68 }, flowers: { choice: 88.24, judgment: 88.75 }, food101: { choice: 97.69, judgment: 96.14 }, dogs: { choice: 93.11, judgment: 92.02 }, vegfru: { choice: 93.07, judgment: 90.14 }, cub: { choice: 61.18, judgment: 62.48 }, inat2021: { choice: 42.37, judgment: 55.52 } },
      { model: "InternVL", badge: "LVLM", aircrafts: { choice: 75.73, judgment: 68.86 }, clothes: { choice: 88.88, judgment: 80.33 }, flowers: { choice: 82.84, judgment: 80.19 }, food101: { choice: 97.47, judgment: 85.54 }, dogs: { choice: 81.2, judgment: 83.73 }, vegfru: { choice: 88.2, judgment: 75.27 }, cub: { choice: 50.64, judgment: 61.06 }, inat2021: { choice: 28.84, judgment: 51.26 } },
      { model: "LLaVA-1.5-7B", badge: "LVLM", aircrafts: { choice: 58.75, judgment: 77.62 }, clothes: { choice: 86.05, judgment: 82.25 }, flowers: { choice: 66.81, judgment: 76.53 }, food101: { choice: 94.56, judgment: 93.58 }, dogs: { choice: 68.81, judgment: 77.45 }, vegfru: { choice: 80.94, judgment: 83.57 }, cub: { choice: 44.55, judgment: 58.84 }, inat2021: { choice: 27.81, judgment: 51.17 } },
      { model: "Qwen2.5-VL", badge: "LVLM", aircrafts: { choice: 94.84, judgment: 89.56 }, clothes: { choice: 89.35, judgment: 81.53 }, flowers: { choice: 95.69, judgment: 93.32 }, food101: { choice: 98.4, judgment: 92.1 }, dogs: { choice: 96.74, judgment: 94.5 }, vegfru: { choice: 95.72, judgment: 83.04 }, cub: { choice: 74.04, judgment: 71.49 }, inat2021: { choice: 44.54, judgment: 56.97 } },
      { model: "Qwen-VL-Chat", badge: "LVLM", aircrafts: { choice: 81.49, judgment: 86.14 }, clothes: { choice: 88.65, judgment: 83.23 }, flowers: { choice: 89.51, judgment: 87.18 }, food101: { choice: 96.94, judgment: 96.76 }, dogs: { choice: 86.66, judgment: 92.75 }, vegfru: { choice: 88.72, judgment: 87.5 }, cub: { choice: 57.68, judgment: 62.6 }, inat2021: { choice: 26.45, judgment: 50.37 } },
      { model: "BLIP-2", badge: "LVLM", aircrafts: { choice: 42.21, judgment: 54.73 }, clothes: { choice: 86.35, judgment: 76.78 }, flowers: { choice: 70.61, judgment: 74.45 }, food101: { choice: 95.03, judgment: 74.02 }, dogs: { choice: 67.72, judgment: 68.57 }, vegfru: { choice: 76.55, judgment: 63.9 }, cub: { choice: 38.78, judgment: 53.92 }, inat2021: { choice: 25.71, judgment: 50.83 } }
    ],
    cub_details: [
      { model: "InternVL3-7B", badge: "LVLM", scores: { Class: { choice: 99.76, judgment: 97.77 }, Genus: { choice: 90.75, judgment: 87.59 }, Species: { choice: 61.18, judgment: 62.48 } } },
      { model: "InternVL", badge: "LVLM", scores: { Class: { choice: 99.97, judgment: 98.0 }, Genus: { choice: 87.12, judgment: 77.8 }, Species: { choice: 50.64, judgment: 61.06 } } },
      { model: "LLaVA-1.5-7B", badge: "LVLM", scores: { Class: { choice: 99.79, judgment: 97.96 }, Genus: { choice: 71.56, judgment: 78.93 }, Species: { choice: 44.55, judgment: 58.84 } } },
      { model: "Qwen2.5-VL", badge: "LVLM", scores: { Class: { choice: 99.98, judgment: 99.71 }, Genus: { choice: 97.07, judgment: 95.39 }, Species: { choice: 74.04, judgment: 71.49 } } },
      { model: "Qwen-VL-Chat", badge: "LVLM", scores: { Class: { choice: 99.95, judgment: 87.85 }, Genus: { choice: 88.75, judgment: 86.73 }, Species: { choice: 57.68, judgment: 62.6 } } },
      { model: "BLIP-2", badge: "LVLM", scores: { Class: { choice: 99.95, judgment: 86.61 }, Genus: { choice: 66.86, judgment: 70.8 }, Species: { choice: 38.78, judgment: 53.92 } } }
    ],
    inat_details: [
      { model: "InternVL3-7B", badge: "LVLM", scores: { Kingdom: { choice: 96.19, judgment: 91.43 }, Phylum: { choice: 77.31, judgment: 81.15 }, Class: { choice: 70.87, judgment: 74.45 }, Order: { choice: 63.69, judgment: 69.35 }, Family: { choice: 56.57, judgment: 65.01 }, Genus: { choice: 50.91, judgment: 62.29 }, Species: { choice: 42.37, judgment: 55.52 } } },
      { model: "InternVL", badge: "LVLM", scores: { Kingdom: { choice: 96.19, judgment: 89.52 }, Phylum: { choice: 63.85, judgment: 71.15 }, Class: { choice: 58.15, judgment: 64.97 }, Order: { choice: 47.71, judgment: 56.98 }, Family: { choice: 40.94, judgment: 56.22 }, Genus: { choice: 32.78, judgment: 52.99 }, Species: { choice: 28.84, judgment: 51.26 } } },
      { model: "LLaVA-1.5-7B", badge: "LVLM", scores: { Kingdom: { choice: 87.62, judgment: 85.71 }, Phylum: { choice: 56.92, judgment: 67.31 }, Class: { choice: 41.62, judgment: 62.08 }, Order: { choice: 40.75, judgment: 57.27 }, Family: { choice: 35.89, judgment: 54.46 }, Genus: { choice: 31.33, judgment: 53.41 }, Species: { choice: 27.81, judgment: 51.17 } } },
      { model: "Qwen2.5-VL", badge: "LVLM", scores: { Kingdom: { choice: 99.05, judgment: 91.43 }, Phylum: { choice: 83.85, judgment: 83.46 }, Class: { choice: 78.15, judgment: 78.61 }, Order: { choice: 70.69, judgment: 73.33 }, Family: { choice: 62.92, judgment: 69.19 }, Genus: { choice: 53.38, judgment: 63.31 }, Species: { choice: 44.54, judgment: 56.97 } } },
      { model: "Qwen-VL-Chat", badge: "LVLM", scores: { Kingdom: { choice: 93.33, judgment: 81.9 }, Phylum: { choice: 63.85, judgment: 59.62 }, Class: { choice: 52.6, judgment: 60.46 }, Order: { choice: 44.99, judgment: 55.05 }, Family: { choice: 39.33, judgment: 53.65 }, Genus: { choice: 33.18, judgment: 52.44 }, Species: { choice: 26.45, judgment: 50.37 } } },
      { model: "BLIP-2", badge: "LVLM", scores: { Kingdom: { choice: 92.38, judgment: 86.67 }, Phylum: { choice: 35.0, judgment: 53.85 }, Class: { choice: 35.49, judgment: 57.69 }, Order: { choice: 29.6, judgment: 52.79 }, Family: { choice: 27.62, judgment: 51.99 }, Genus: { choice: 26.94, judgment: 50.58 }, Species: { choice: 25.71, judgment: 50.83 } } }
    ]
  },

  findingsChapters: {
    chapters: [
      {
        id: "assess", numeral: "I", stage: "Assess",
        question: "How well do current LVLMs recognize fine-grained categories?",
        title: "LVLMs Remain Inadequate Fine-Grained Recognizers",
        accent: "blue",
        summary: "Across taxonomy granularity, specialist comparison, and attribute perception, a consistent recognition gap emerges: general-purpose LVLMs are not yet reliable fine-grained recognizers.",
        findings: [
          { id: "f1", n: 1, title: "Accuracy collapses as categories grow finer", summary: "LVLMs struggle to distinguish excessively fine-grained categories.", detail: "Taking InternVL3 as a representative example on CUB-200-2011, accuracy stays near-perfect at the class level (99.76% multiple-choice / 99.77% true-false), drops to 90.75% at the genus level, and falls to 61.18% / 62.48% at the species level. The model handles coarse semantic distinctions well but becomes far less reliable when separating closely related subordinate categories — a degradation observed consistently across other LVLMs." },
          { id: "f2", n: 2, title: "Still behind fine-grained specialists", summary: "LVLMs do not outperform models tailored for fine-grained recognition.", detail: "Under both short-answer evaluation and linear probing, LVLMs trail dedicated fine-grained models. On FGVC Aircraft, LVLMs reach 66.19% (short-answer) and 78.88% (linear probe), while a tailored model attains 95.40%; similar gaps appear on Stanford Dogs and Stanford Cars. The gap reflects different optimization goals — specialists explicitly model local, part-level, and hierarchical cues (e.g., CAP's context-aware attentional pooling), whereas the standard ViT+MLP+LLM stack does not." },
          { id: "f3", n: 3, title: "Uneven and often weak attribute perception", summary: "LVLMs leave significant room for improvement in recognizing fine-grained attributes.", detail: "Performance is highly uneven across attribute types. InternVL3 and Qwen2.5-VL reach 50.13% and 45.12% average accuracy for pattern recognition, but only 30.95% and 29.30% for shape. A few attributes score high, yet most remain unreliable and some part-level attributes (e.g., tail shape) drop to ~10%. Because correct categories often hinge on subtle combinations of color, shape, pattern, and part-level cues, these attribute weaknesses directly limit category-level reasoning." }
        ]
      },
      {
        id: "diagnose", numeral: "II", stage: "Diagnose",
        question: "Where do these fine-grained failures actually originate?",
        title: "Bottlenecks Behind the Failures",
        accent: "amber",
        summary: "By jointly probing feature-level discriminability and dialogue-level recognition, failures trace to four intertwined bottlenecks: visual representation, semantic grounding, modality alignment, and category-level knowledge.",
        findings: [
          { id: "f4", n: 4, title: "In specialized domains, semantics is the bottleneck", summary: "Semantic understanding, rather than visual discrimination, limits LVLMs in specialized domains.", detail: "On common datasets (FGVC Aircraft, Stanford Dogs), weak visual discriminability is the main limiter — e.g., Qwen2.5-VL reaches 94.84% multiple-choice but only 62.07% linear-probe accuracy. In specialized domains (remote sensing MTARSI, dermatology SkinCon) the pattern flips: features stay highly discriminable under linear probing (LLaVA 94.79% on MTARSI) yet dialogue accuracy collapses (60.32% / 71.60%). The model can separate the categories visually but cannot map those cues to the right concepts, owing to scarce domain concepts in pre-training." },
          { id: "f5", n: 5, title: "Discriminability does not imply grounding", summary: "Fine-grained visual representations do not imply fine-grained semantic grounding.", detail: "Using unified understanding-generation models as a testbed, linear probing on original images shows strong discriminability, but probing on the models' own category-conditioned generations drops sharply (e.g., BLIP3-o falls from 89.92% to 73.65% on CUB-200-2011 and from 79.05% to 55.87% on FGVC Aircraft). The generated images frequently miss the defining visual traits of the target category — evidence that a model can tell fine-grained categories apart without truly grounding their names into visual concepts." },
          { id: "f6", n: 6, title: "Alignment can erode fine-grained features", summary: "The visual-to-textual alignment strategy may impair fine-grained discriminability.", detail: "LLaVA's original visual features outperform their aligned counterparts by 3.39% on average for fine-grained classification — alignment to coarse-grained captions distorts the feature space. Crucially, alignment data should be task-aware: re-aligning on richer recaptioned text improves general understanding (+1.66 on POPE), whereas category-level fine-grained text strengthens fine-grained tasks (+2.55% on Stanford Dogs, +1.73% on Stanford Cars) by pulling visual features closer to their category embeddings." },
          { id: "f7", n: 7, title: "Knowledge bias rooted in data and the LLM base", summary: "Inconsistent per-category accuracy stems from training-data coverage and the underlying LLM.", detail: "LLaVA's true-false accuracy ranks reveal a clear long-tail: ~90% for some fine-grained categories, ~30% for others. Fine-tuning on an occurrence-balanced set restores consistently strong recognition, showing the bias comes from uneven knowledge coverage, not intrinsic category difficulty. Tracing occurrence frequency further shows these categories are almost absent from training data — the imbalance is largely inherited from the language-side priors of the underlying LLM." }
        ]
      },
      {
        id: "improve", numeral: "III", stage: "Improve",
        question: "Which training designs actually strengthen fine-grained ability?",
        title: "Training Designs That Help",
        accent: "emerald",
        summary: "Improving fine-grained LVLMs takes more than raw scale: the training objective, data quality, and a balanced SFT composition jointly determine whether fine-grained ability is gained without sacrificing general competence.",
        findings: [
          { id: "f8", n: 8, title: "Contrastive training builds better features", summary: "The contrastive paradigm enhances fine-grained discriminability more than generative or reconstruction-based training.", detail: "Vision encoders trained contrastively (EVA-CLIP, InternVL, DINOv2) yield more discriminative fine-grained features than reconstruction-based (BEiT3) or generative (Qwen) ones, on both classification and retrieval across twelve datasets. Under multi-meta-category classification, EVA-CLIP degrades by only 1.96% versus the single-category setting, whereas Qwen and BEiT3 drop 4.16% and 7.41% — a gap echoed in their global feature distributions and patch-level correspondences." },
          { id: "f9", n: 9, title: "Scale alone is not enough", summary: "Scaling vision encoders or web data alone brings limited fine-grained gains.", detail: "Scaling DINOv2 from B to L improves average classification accuracy by only 0.6%, and L to G by a further 0.3%; InternVL-6B features do not surpass DINOv2-L. On the data side, EVA-CLIP (2B+ samples) does not beat DINOv2 (142M carefully curated samples) on fine-grained tasks. Without attention to objective design and data quality, enlarging the encoder or crawled web data offers little fine-grained benefit." },
          { id: "f10", n: 10, title: "Mix general and fine-grained data during SFT", summary: "Joint SFT gains fine-grained ability while preserving general capabilities.", detail: "Post-hoc fine-tuning on fine-grained data alone improves recognition but causes severe forgetting — AI2D drops 65.31 to 48.67, DocVQA 42.43 to 20.36. Mixing general and fine-grained data at a 1:1 ratio during SFT keeps general performance close to baseline (AI2D 65.02, POPE 87.6) while matching, or slightly exceeding, the fine-grained accuracy of the fine-grained-only model. Fine-grained supervision helps, but its placement and composition in SFT are decisive." }
        ]
      },
      {
        id: "stress", numeral: "IV", stage: "Stress-test",
        question: "Is fine-grained recognition robust under perturbation?",
        title: "Robustness Under Visual & Linguistic Perturbations",
        accent: "violet",
        summary: "Fine-grained recognition is fragile from both sides — degraded visual evidence and, more severely, misleading language priors that bias the model's final semantic decision.",
        findings: [
          { id: "f11", n: 11, title: "Fine-grained features are especially fragile", summary: "Visual features are more susceptible to perturbation in fine-grained than in generic tasks.", detail: "Under white-box (PGD) image perturbation, EVA-CLIP classification accuracy on the fine-grained CUB-200-2011 collapses from 88.95% to 24.94%, while on the generic CIFAR-100 it declines more modestly from 93.05% to 50.76%; CoCa and DINOv2 show the same trend. Because fine-grained categories differ only by subtle cues, small representation shifts make them hard to separate. A ViT trained on curated ImageNet with cross-entropy stays far more robust — pointing to data quality and objective design as remedies." },
          { id: "f12", n: 12, title: "Language priors can override vision", summary: "Language-side perturbations override visual evidence more effectively than feature-side ones.", detail: "Visual corruptions (salt-and-pepper, Gaussian blur, background removal, color shift) degrade both features and answers, but misleading linguistic cues hurt far more. Appending a wrong hint (e.g., \"the bird seems to be a black-footed albatross\") drops Qwen2.5-VL on CUB from 74.04%/71.49% to 63.01%/28.69% — a 42.80% true-false drop; InternVL3 falls 20.94%. Since the output space is linguistic, language priors bias the decision rule directly rather than merely weakening evidence — and the effect is strongest on true-false questions, where there is no candidate set to fall back on." }
        ]
      }
    ]
  }
};
