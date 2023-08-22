# Clustering
A web app designed to conduct both offline and online clustering experiments using a dataset of archaeological sites in Vienna.

**Offline:**
- FUNDE_N (PCA, UMAP)
- BEZ_N, DATIERUNG_N
- BEZ_N, FUNDE_N
- BEZ_N, FUNDKATEGORIE_N
- BEZ_N, FUNDE_N, DATIERUNG_N
- BEZ_N, FUNDE_N, DATIERUNG_N, FUNDKATEGORIE_N

**Online:**
- k-Means 
- DBSCAN
- AGNES

Clustering is based on a combination of the columns: BEZ, FUNDE, DATIERUNG and FUNDKATEGORIE.

## System

- **Node.js**: 18.17.0
- **Angular CLI**: 16.1.8
- **Package Manager**: npm 9.8.1
- **OS**: win32 x64

## CSV Data Cleaning

After processing the data with Python, all CSV files were cleaned using [CSVCleaner](https://open-innovations.github.io/CSVCleaner/). Here are the key points from the cleaning process:

- **Damaged Rows**: Some rows were corrupted when displayed in the graph.
- **Row Removal**: The cleaner removed one trailing row.
- **SHAPE Column Type**: The SHAPE column is suspected to be of the datetime type instead of a string, type must be changed.
- **Header Cleanup**: Commas in the CSV headers were removed, because the website uses them as delimiters.

## Installed libraries

**General:**
- npm install --save @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons
- npm install @fortawesome/fontawesome-svg-core
- npm install @fortawesome/free-solid-svg-icons
- npm install @fortawesome/angular-fontawesome
- npm install angular-gridster2
- npm install topojson-client --save
- npm install @types/topojson-client --save-dev

**Graphs:**
- ng add igniteui-angular
- npm install --save igniteui-angular-core
- npm install --save igniteui-angular-charts
- npm install --save igniteui-angular-maps
- npm install highcharts --save
- npm install highcharts-angular --save

**Clustering:**
- npm i kmeans-ts // [K-Means-TS GitHub Repository](https://github.com/GoldinGuy/K-Means-TS)
- npm install density-clustering
- npm i --save-dev @types/density-clustering
- npm install ml-hclust

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
