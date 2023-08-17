# Clustering


## System

Node.js: 18.17.0
Angular CLI: 16.1.8
Package Manager: npm 9.8.1
OS: win32 x64

## CSV

After python all CSV files were cleaned in https://open-innovations.github.io/CSVCleaner/ , beacause some rows were damaged by viewing in graph (only 1), it also removes 1 row at end, I think SHAPE column was datetime of type and not string, which must be changed! And fix header of csv (delete commas) 

## Libraries

npm install --save @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons
npm install @fortawesome/fontawesome-svg-core
npm install @fortawesome/free-solid-svg-icons
npm install @fortawesome/angular-fontawesome
npm install angular-gridster2
npm install d3 --save
npm install @types/d3 --save-dev
npm install topojson-client --save
npm install @types/topojson-client --save-dev

ng add igniteui-angular
npm install --save igniteui-angular-core
npm install --save igniteui-angular-charts
npm install --save igniteui-angular-maps

npm install highcharts --save
npm install highcharts-angular --save


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
