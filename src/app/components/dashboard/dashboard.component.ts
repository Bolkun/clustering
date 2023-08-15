import { Component, OnInit, ElementRef } from '@angular/core';
// https://fontawesome.com/v4/icons
import { faHome } from '@fortawesome/free-solid-svg-icons'; 
import { faSign } from '@fortawesome/free-solid-svg-icons';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { HttpClient } from '@angular/common/http';
import { MappingService } from 'src/app/services/mapping.service';

export function atLeastTwoCheckedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormGroup)) {
      return null;
    }

    const selectedCheckboxes = ['FUNDE_N', 'BEZ_N', 'DATIERUNG_N', 'FUNDKATEGORIE_N']
      .map(key => control.get(key).value)
      .filter(Boolean).length;

    return selectedCheckboxes >= 2 ? null : { atLeastTwoRequired: true };
  };
}

export function WholeNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (!control.value) {
      return null;
    }
    const isWholeNumber = Number.isInteger(control.value);
    return isWholeNumber ? null : { 'notWholeNumber': true };
  };
}

export function MaxDecimalPlacesValidator(decimalPlaces: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (!control.value) {
      return null;
    }
    const valueString = control.value.toString();
    const decimalIndex = valueString.indexOf('.');
    const decimalPlacesOfValue = decimalIndex !== -1 ? valueString.length - decimalIndex - 1 : 0;
    
    return decimalPlacesOfValue > decimalPlaces ? { 'tooManyDecimals': true } : null;
  };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Sidebar
  activeTab: null | string = 'tab1';
  isContentFlex: boolean = true;
  selectedOfflineButtonIndex: number | null = null;
  selectedOnlineButtonIndex: number | null = null;
  form: FormGroup;
  // Icons
  faHome = faHome;
  faDatabase = faDatabase;
  faDashboard = faSign;
  faHelp = faQuestion;
  faMenu = faBook;
  faMenuClosed = faCaretDown;
  faMenuOpened = faCaretUp;
  faGlobe = faGlobe;
  faOffline = faTimes;
  faOnline = faCheck;
  faSidebarVisible = faEye;
  faSidebarUnvisible = faEyeSlash;
  // Grid
  options: GridsterConfig;
  dashboard: GridsterItem[];
  // CSV
  csvData: string[][];
  exportCsvData: string[][];
  export2_CsvData: string[][];
  
  constructor(private fb: FormBuilder, private http: HttpClient, private mappingService: MappingService, private element: ElementRef) {
    this.form = this.fb.group({
      FUNDE_N: [false],
      BEZ_N: [true],
      DATIERUNG_N: [true],
      FUNDKATEGORIE_N: [false],
      n_kMeans: [3, [Validators.required, Validators.min(2), Validators.max(10), WholeNumberValidator()]],
      eps_dbscan: [0.1, [Validators.required, Validators.min(0.01), Validators.max(10), MaxDecimalPlacesValidator(4)]],
      minPts_dbscan: [10, [Validators.required, Validators.min(2), Validators.max(2503), WholeNumberValidator()]],
      n_agnes: [4, [Validators.required, Validators.min(2), Validators.max(10), WholeNumberValidator()]]
    }, { validators: atLeastTwoCheckedValidator() });

    this.options = {
      draggable: { enabled: true, ignoreContentClass: 'no-drag'},
      resizable: { enabled: true },
      swap: true,
      displayGrid: 'none',
      pushItems: false
    };
    this.dashboard = [
      {cols: 2, rows: 4, y: 0, x: 0, content: "Item 4"},  // Map of Points
      {cols: 2, rows: 4, y: 0, x: 2, content: "Item 5"},  // Map of Bezirke
      {cols: 4, rows: 4, y: 4, x: 0, content: "Item 6"}   // CSV Data
    ];
  }

  ngOnInit(): void {
    this.loadCsvData();
    this.loadExportCsvData();
    this.load2_ExportCsvData();

    this.setSelectedButton(4);
  }

  toggleOfflineMenu(): void {
    if(this.isContentFlex === true) {
      this.activeTab = 'tab1';
    } else {
      this.activeTab = 'tab1';
      this.isContentFlex = true;
    }
  }

  toggleOnlineMenu(): void {
    if(this.isContentFlex === true) {
      this.activeTab = 'tab2';
    } else {
      this.activeTab = 'tab2';
      this.isContentFlex = true;
    }
  }

  toggleContentDisplay(): void {
    this.isContentFlex = !this.isContentFlex;
    this.activeTab = null;
  }

  startViewDisplay() {
    this.selectedOfflineButtonIndex = null
    this.selectedOnlineButtonIndex = null
    this.dashboard = [
      {cols: 2, rows: 4, y: 0, x: 0, content: "Item 4"},  // Map of Points
      {cols: 2, rows: 4, y: 0, x: 2, content: "Item 5"},  // Map of Bezirke
      {cols: 4, rows: 4, y: 4, x: 0, content: "Item 6"}   // CSV Data
    ];
  }

  removeItem(item: GridsterItem) {
    const index = this.dashboard.indexOf(item);
    if (index > -1) {
      this.dashboard.splice(index, 1);
    }
  }

  setSelectedButton(index: number): void {
    // Clear buttons off Online test
    this.selectedOnlineButtonIndex = null;

    this.selectedOfflineButtonIndex = index;
    switch(index) {
      case 0:
        this.handleFunde();
        break;
      case 1:
        this.handleBezNDatierungN();
        break;
      case 2:
        this.handleBezNFundeN();
        break;
      case 3:
        this.handleBezNFundkategorieN();
        break;
      case 4:
        this.handleBezNFundeNDatierungN();
        break;
      case 5:
        this.handleBezNFundeNDatierungNFundkategorieN();
        break;
      default:
        break;
    }
  }

  handleFunde(): void {
    this.dashboard = [
      // First row
      {cols: 2, rows: 2, y: 0, x: 0, content: "PCA_kMeans"},
      {cols: 2, rows: 2, y: 0, x: 2, content: "PCA_DBSCAN"},
      {cols: 2, rows: 2, y: 0, x: 4, content: "PCA_AGNES"},
    
      // Second row
      {cols: 2, rows: 2, y: 2, x: 0, content: "UMAP_kMeans"},  
      {cols: 2, rows: 2, y: 2, x: 2, content: "UMAP_DBSCAN"},  
      {cols: 2, rows: 2, y: 2, x: 4, content: "UMAP_AGNES"}
    ];
  }

  handleBezNDatierungN(): void {
    this.dashboard = [
      // First row
      {cols: 6, rows: 2, y: 0, x: 0, content: "BezDatierung_kMeans"},
      // Second row
      {cols: 6, rows: 2, y: 2, x: 0, content: "BezDatierung_DBSCAN"},  
      // Third row
      {cols: 6, rows: 2, y: 4, x: 0, content: "BezDatierung_AGNES"}, 
    ];
  }

  handleBezNFundeN(): void {
    this.dashboard = [
      // First row
      {cols: 6, rows: 2, y: 0, x: 0, content: "BezFunde_kMeans"},
      // Second row
      {cols: 6, rows: 2, y: 2, x: 0, content: "BezFunde_DBSCAN"},  
      // Third row
      {cols: 6, rows: 2, y: 4, x: 0, content: "BezFunde_AGNES"}, 
    ];
  }

  handleBezNFundkategorieN(): void {
    this.dashboard = [
      // First row
      {cols: 6, rows: 2, y: 0, x: 0, content: "BezFundkategorie_kMeans"},
      // Second row
      {cols: 6, rows: 2, y: 2, x: 0, content: "BezFundkategorie_DBSCAN"},  
      // Third row
      {cols: 6, rows: 2, y: 4, x: 0, content: "BezFundkategorie_AGNES"}, 
    ];
  }

  handleBezNFundeNDatierungN(): void {
    this.dashboard = [
      // First row
      {cols: 6, rows: 2, y: 0, x: 0, content: "BezFundeDatierung_kMeans"},
      // Second row
      {cols: 6, rows: 2, y: 2, x: 0, content: "BezFundeDatierung_DBSCAN"},  
      // Third row
      {cols: 6, rows: 2, y: 4, x: 0, content: "BezFundeDatierung_AGNES"}, 
    ];
  }

  handleBezNFundeNDatierungNFundkategorieN(): void {
    this.dashboard = [
      // First row
      {cols: 6, rows: 2, y: 0, x: 0, content: "BezFundeDatierungFundkategorie_kMeans"},
      // Second row
      {cols: 6, rows: 2, y: 2, x: 0, content: "BezFundeDatierungFundkategorie_DBSCAN"},  
      // Third row
      {cols: 6, rows: 2, y: 4, x: 0, content: "BezFundeDatierungFundkategorie_AGNES"}, 
    ];
  }

  loadCsvData() {
    this.http.get('assets/csv/data_preparation/cleaned_archaelogical_sites_of_wien.csv', { responseType: 'text' })
    .subscribe(data => {
      const rawData = this.csvTo2DArray(data, ",", [0, 1, 2, 4, 5, 6, 7, 9, 10]);
      const fundKategorieMappedData = this.mappingService.mapFundKategorie(rawData);
      this.csvData = this.mappingService.mapDatierung(fundKategorieMappedData);
      // const bezMappedData = this.mappingService.mapBez(fundKategorieMappedData);
      // this.csvData = this.mappingService.mapDatierung(bezMappedData);
    });
  }

  loadExportCsvData() {
    this.http.get('assets/csv/export/export_archaelogical_sites_of_wien.csv', { responseType: 'text' })
    .subscribe(data => {
      const columnsToKeep = Array.from({length: 33}, (_, i) => i); // 33 columns
      const rawData = this.csvTo2DArray(data, ",", columnsToKeep);
      // const fundKategorieMappedData = this.mappingService.mapFundKategorie(rawData);
      // const bezMappedData = this.mappingService.mapBez(fundKategorieMappedData);
      // this.exportCsvData = this.mappingService.mapDatierung(bezMappedData);
      this.exportCsvData = rawData
    });
  }

  load2_ExportCsvData() {
    this.http.get('assets/csv/export/2_export_archaelogical_sites_of_wien.csv', { responseType: 'text' })
    .subscribe(data => {
      const columnsToKeep = Array.from({length: 22}, (_, i) => i); // 22 columns
      const rawData = this.csvTo2DArray(data, ",", columnsToKeep);
      this.export2_CsvData = rawData;
    });
  }
  
  private csvTo2DArray(csv: string, delimiter: string = ",", columnsToKeep: number[] = []): string[][] {
    let lines = csv.split("\n");
    // Filter out any empty lines or lines with only delimiters
    lines = lines.filter(line => line.trim() !== "" && line.split(delimiter).some(cell => cell.trim() !== ""));
    // Convert the filtered lines to a 2D array and add row numeration
    return lines.map(line => 
      line.split(delimiter).filter((_, index) => columnsToKeep.includes(index))
    );
  }

  capitalizeEachWord(value: string): string {
    if (!value) {
      return '';
    }
    return value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }
  
  eventExportCsvData() {
    const csvContent = this.arrayToCsv(this.csvData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'exported_data.csv';
    anchor.click();

    window.URL.revokeObjectURL(url);
  }

  private arrayToCsv(data: string[][]): string {
      return data.map(row => row.join(",")).join("\n");
  }

  submit(index: number) {
    if (this.form.valid) {
      // Clear buttons off Offline test
      this.selectedOfflineButtonIndex = null;
      this.selectedOnlineButtonIndex = index;
      // Process the form data
      console.log(this.form.value);
    } else {
      // Display a general message or loop through controls to show individual error messages
      this.selectedOnlineButtonIndex = null;
      console.warn('Form is invalid');
    }
  }
  
}
