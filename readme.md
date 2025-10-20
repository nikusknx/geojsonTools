# GeoJSON Converter

Un petit utilitaire Node.js/TypeScript qui convertit un fichier **JSON** ou  **CSV** en **GeoJSON valide**.  

Il supporte un format de géométrie dans les données source :
- Deux champs séparés :

  ```json
    "longitude": 6.0009,
    "latitude": 45.8735
## 🚀 Installation
Prérequis
Node.js (version LTS recommandée)

npm (installé avec Node.js)

## Étapes

  ```bash
    # Cloner ou créer le projet
    mkdir geojson-converter
    cd geojson-converter

    # Initialiser le projet
    npm init -y

    # Installer TypeScript et dépendances
    npm install --save-dev typescript ts-node @types/node

    # Créer la config TypeScript
    npx tsc --init
    Edite ensuite ton fichier src/convert.ts avec le code du script.
  ```

## ⚙️ Compilation
Compiler le projet avec :

  ```bash
      npx tsc
  ```
Cela génère les fichiers JavaScript dans le dossier dist/.

## ▶️ Utilisation
Depuis les fichiers compilés
  ```bash
    node dist/convertJsonTogeojson.js input.json output.geojson
  ```
Directement avec ts-node (sans compilation)
  ```bash
    npx ts-node src/convertJsonTogeojson.ts input.json output.geojson
  ```