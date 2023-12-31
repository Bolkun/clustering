import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { faLaptop } from '@fortawesome/free-solid-svg-icons';
import { faClone } from '@fortawesome/free-solid-svg-icons';
import { faPencilSquare } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { HttpClient } from '@angular/common/http';
import { MappingService } from 'src/app/services/mapping.service';
import kmeans from 'kmeans-ts';
import * as clustering from 'density-clustering';
import * as hclust from 'ml-hclust';

export function atLeastTwoCheckedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormGroup)) {
      return null;
    }

    const selectedCheckboxes = ['FUNDE', 'BEZ', 'DATIERUNG', 'FUNDKATEGORIE']
      .map((key) => control.get(key).value)
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
    return isWholeNumber ? null : { notWholeNumber: true };
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

    return decimalPlacesOfValue > decimalPlaces ? { tooManyDecimals: true } : null;
  };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  // Sidebar
  activeTab: null | string = 'tab2';
  isContentFlex: boolean = true;
  isTableEditMode: boolean = false;
  selectedOfflineButtonIndex: number | null = null;
  selectedOnlineButtonIndex: number | null = null;
  selectedWorkButtonIndex: number | null = null;
  online_form: FormGroup;
  workSidebar_form: FormGroup;
  workTable_form: FormGroup;
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
  faLaptop = faLaptop;
  faEdit = faPencilSquare;
  faEditSingle = faClone;
  faDelete = faTrash;
  faAdd = faPlusSquare;
  // Grid
  options: GridsterConfig;
  dashboard: GridsterItem[];
  // CSV
  csvData: string[][];
  exportCsvData: string[][];
  export2_CsvData: string[][];
  workCsvData: string[][];
  // Files
  fileNames: string[] = ['kmeans_funde_2503.csv', 'dbscan_funde_2503.csv', 'agnes_funde_2503.csv'];
  // Online
  boxCount: any;
  o_x_title: any;
  o_y_title: any;
  o_z_title: any;
  o_d_title: any;
  o_x_column: any;
  o_y_column: any;
  o_z_column: any;
  o_d_column: any;
  kMeans_points: string[] = [];
  DBSCAN_points: string[] = [];
  AGNES_points: string[] = [];
  // Button
  isLoading0 = false;
  isLoading1 = false;
  isLoading2 = false;
  isLoading3 = false;
  isLoading4 = false;
  isLoading5 = false;
  isLoadingOnline = false;
  // Work
  sortedFundkategorieMapping: any[];
  sortedBezMapping: any[];
  sortedDatierungMapping: any[];
  importCsvData: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public mappingService: MappingService,
    private cdRef: ChangeDetectorRef
  ) {
    this.online_form = this.fb.group(
      {
        FUNDE: [false],
        DATIERUNG: [true],
        BEZ: [true],
        FUNDKATEGORIE: [false],
        n_kMeans: [3, [Validators.required, Validators.min(2), Validators.max(10), WholeNumberValidator()]],
        eps_dbscan: [3, [Validators.required, Validators.min(0.01), Validators.max(20), MaxDecimalPlacesValidator(4)]],
        minPts_dbscan: [20, [Validators.required, Validators.min(2), Validators.max(2503), WholeNumberValidator()]],
        n_agnes: [4, [Validators.required, Validators.min(2), Validators.max(10), WholeNumberValidator()]],
      },
      { validators: atLeastTwoCheckedValidator() }
    );
    this.workSidebar_form = this.fb.group({
      selectedDatasetControl: [this.fileNames[0]],
    });
    this.options = {
      draggable: { enabled: true, ignoreContentClass: 'no-drag' },
      resizable: { enabled: true },
      swap: true,
      displayGrid: 'none',
      pushItems: false,
    };
    this.dashboard = [
      { cols: 2, rows: 4, y: 0, x: 0, content: 'Item 4' }, // Map of Points
      { cols: 1, rows: 4, y: 0, x: 2, content: 'Item 5' }, // Map of Bezirke
      { cols: 1, rows: 4, y: 0, x: 3, content: 'Item Help' }, // Help
      { cols: 4, rows: 4, y: 4, x: 0, content: 'Item 6' }, // CSV Data
    ];
  }

  ngOnInit(): void {
    this.toggleSidebar();
    // Load Data
    this.loadCsvData();
    this.loadExportCsvData();
    this.load2_ExportCsvData();
    this.loadWorkCsvData(this.fileNames[0]);
    // Work
    this.sortedFundkategorieMapping = this.mappingService.sortMapping(this.mappingService.FUNDKATEGORIE_MAPPING);
    this.sortedBezMapping = this.mappingService.sortMapping(this.mappingService.BEZ_MAPPING);
    this.sortedDatierungMapping = this.mappingService.sortMapping(this.mappingService.DATIERUNG_MAPPING);
    // Test
    //this.toggleWorkMenu();
    //this.workSubmit(0);
    //this.loadAndLogData('kmeans_funde_2503.csv', 'k-means(FUNDE)'); // Mismatch Percentage: 29.56%
    //this.loadAndLogData('dbscan_funde_2503.csv', 'dbscan(FUNDE)');  // Mismatch Percentage: 28.69%
    //this.loadAndLogData('agnes_funde_2503.csv', 'agnes(FUNDE)');    // Mismatch Percentage: 26.09%
    //this.loadAndLogData2('kmeans_funde_2503.csv', 'k-means(FUNDE)');// Mismatch Percentage: 31.28%
    //this.loadAndLogData2('dbscan_funde_2503.csv', 'dbscan(FUNDE)'); // Mismatch Percentage: 53.94%
    //this.loadAndLogData2('agnes_funde_2503.csv', 'agnes(FUNDE)');   // Mismatch Percentage: 26.09%
  }

  // Index page
  startViewDisplay() {
    this.selectedOfflineButtonIndex = null;
    this.selectedOnlineButtonIndex = null;
    this.selectedWorkButtonIndex = null;
    this.dashboard = [
      { cols: 2, rows: 4, y: 0, x: 0, content: 'Item 4' }, // Map of Points
      { cols: 1, rows: 4, y: 0, x: 2, content: 'Item 5' }, // Map of Bezirke
      { cols: 1, rows: 4, y: 0, x: 3, content: 'Item Help' }, // Help
      { cols: 4, rows: 4, y: 4, x: 0, content: 'Item 6' }, // CSV Data
    ];
  }

  // Sidebar
  toggleSidebar(): void {
    this.isContentFlex = !this.isContentFlex;
    this.activeTab = null;
  }

  toggleOfflineMenu(): void {
    if (this.isContentFlex === true) {
      this.activeTab = 'tab1';
    } else {
      this.activeTab = 'tab1';
      this.isContentFlex = true;
    }
  }

  toggleOnlineMenu(): void {
    if (this.isContentFlex === true) {
      this.activeTab = 'tab2';
    } else {
      this.activeTab = 'tab2';
      this.isContentFlex = true;
    }
  }

  toggleWorkMenu(): void {
    if (this.isContentFlex === true) {
      this.activeTab = 'tab3';
    } else {
      this.activeTab = 'tab3';
      this.isContentFlex = true;
    }
  }

  // Load data
  loadCsvData() {
    this.http
      .get('assets/csv/data_preparation/cleaned_archaelogical_sites_of_wien.csv', { responseType: 'text' })
      .subscribe((data) => {
        const rawData = this.csvTo2DArray(data, ',', [0, 1, 2, 4, 5, 6, 7, 9, 10]);
        const fundKategorieMappedData = this.mappingService.mapFundKategorie(rawData);
        this.csvData = this.mappingService.mapDatierung(fundKategorieMappedData);
      });
  }

  loadExportCsvData() {
    this.http
      .get('assets/csv/export/export_archaelogical_sites_of_wien.csv', {
        responseType: 'text',
      })
      .subscribe((data) => {
        const columnsToKeep = Array.from({ length: 33 }, (_, i) => i); // 33 columns
        const rawData = this.csvTo2DArray(data, ',', columnsToKeep);
        this.exportCsvData = rawData;
      });
  }

  load2_ExportCsvData() {
    this.http
      .get('assets/csv/export/2_export_archaelogical_sites_of_wien.csv', {
        responseType: 'text',
      })
      .subscribe((data) => {
        const columnsToKeep = Array.from({ length: 22 }, (_, i) => i); // 22 columns
        const rawData = this.csvTo2DArray(data, ',', columnsToKeep);
        this.export2_CsvData = rawData;
      });
  }

  loadWorkCsvData(fileName: string) {
    this.http
      .get('assets/csv/work/' + fileName, {
        responseType: 'text',
      })
      .subscribe((data) => {
        this.processCsvData(data);
      });
  }

  loadAndLogData(file: string, cluster_column: string) {
    this.test_loadWorkCsvData(file)
      .then((data) => {
        console.log('Original Data:', this.workCsvData);

        // Create a deep copy of the original data
        let original_data = JSON.parse(JSON.stringify(this.workCsvData));

        // Assuming the first row contains column names
        const headers = this.workCsvData[0];
        const kmeansIndex = headers.indexOf(cluster_column);
        const fundeIndex = headers.indexOf('FUNDE');
        const objectidIndex = headers.indexOf('OBJECTID'); // Adjust the column name as needed

        // Loop through each row starting from the second
        for (let i = 1; i < this.workCsvData.length; i++) {
          const fundeValue = this.workCsvData[i][fundeIndex];
          const newClusterValue = this.algoWordCombinationMajorityVoteWithinClusters(fundeValue);
          this.workCsvData[i][kmeansIndex] = newClusterValue;
        }

        console.log('Updated Data:', this.workCsvData);

        let mismatches = 0;

        // Comparing original_data and this.workCsvData
        for (let i = 1; i < this.workCsvData.length; i++) {
          if (original_data[i][kmeansIndex] !== this.workCsvData[i][kmeansIndex]) {
            console.log(
              `Row ${i} (objectid = ${this.workCsvData[i][objectidIndex]}): Original Cluster = ${original_data[i][kmeansIndex]}, New Cluster = ${this.workCsvData[i][kmeansIndex]}`
            );
            mismatches++;
          }
        }

        const mismatchPercentage = (mismatches / (this.workCsvData.length - 1)) * 100;
        console.log(`Mismatch Percentage: ${mismatchPercentage.toFixed(2)}%`);
      })
      .catch((error) => {
        console.error('Error loading CSV data:', error);
      });
  }

  loadAndLogData2(file: string, cluster_column: string) {
    this.test_loadWorkCsvData(file)
      .then((data) => {
        console.log('Original Data:', this.workCsvData);

        // Create a deep copy of the original data
        let original_data = JSON.parse(JSON.stringify(this.workCsvData));

        // Assuming the first row contains column names
        const headers = this.workCsvData[0];
        const kmeansIndex = headers.indexOf(cluster_column);
        const fundeIndex = headers.indexOf('FUNDE');
        const objectidIndex = headers.indexOf('OBJECTID'); // Adjust the column name as needed

        // Loop through each row starting from the second
        for (let i = 1; i < this.workCsvData.length; i++) {
          const fundeValue = this.workCsvData[i][fundeIndex];
          const newClusterValue = this.algoLabelClusterMajority();
          this.workCsvData[i][kmeansIndex] = newClusterValue;
        }

        console.log('Updated Data:', this.workCsvData);

        let mismatches = 0;

        // Comparing original_data and this.workCsvData
        for (let i = 1; i < this.workCsvData.length; i++) {
          if (original_data[i][kmeansIndex] !== this.workCsvData[i][kmeansIndex]) {
            console.log(
              `Row ${i} (objectid = ${this.workCsvData[i][objectidIndex]}): Original Cluster = ${original_data[i][kmeansIndex]}, New Cluster = ${this.workCsvData[i][kmeansIndex]}`
            );
            mismatches++;
          }
        }

        const mismatchPercentage = (mismatches / (this.workCsvData.length - 1)) * 100;
        console.log(`Mismatch Percentage: ${mismatchPercentage.toFixed(2)}%`);
      })
      .catch((error) => {
        console.error('Error loading CSV data:', error);
      });
  }

  test_loadWorkCsvData(fileName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.http.get('assets/csv/work/' + fileName, { responseType: 'text' }).subscribe(
        (data) => {
          let columnsToKeep = Array.from({ length: 10 }, (_, i) => i);
          const rawData = this.csvTo2DArray(data, ',', columnsToKeep);
          this.workCsvData = rawData;
          resolve(rawData);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  processCsvData(data: string) {
    let columnsToKeep = Array.from({ length: 10 }, (_, i) => i);
    const rawData = this.csvTo2DArray(data, ',', columnsToKeep);
    this.workCsvData = rawData;

    this.workTable_form = this.fb.group({
      addObjectId: [this.getHighestObjectId() + 1, [Validators.required, WholeNumberValidator()]],
      addLon: ['16.389117526274642', [Validators.required]], // 4548694
      addLat: ['48.31638035732793', [Validators.required]],
      selectedBez: ['21', [Validators.required]],
      addStrasse: ['Stammersdorf'],
      addNummer: [''],
      addExtra: [''],
      selectedFundkategorie: ['3', [Validators.required]],
      addFunde: ['münze keramik', [Validators.required]],
      selectedDatierung: ['32', [Validators.required]],
      selectedAlgo: ['algoWordCombinationMajorityVoteWithinClusters', [Validators.required]],
    });
  }

  csvTo2DArray(csv: string, delimiter: string = ',', columnsToKeep: number[] = []): string[][] {
    let rows = [];
    let row = [];
    let cell = '';
    let insideQuotes = false;

    // Skip delimeter by cell styrting with double quates as its from type text
    for (let char of csv) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === delimiter && !insideQuotes) {
        row.push(cell);
        cell = '';
      } else if (char === '\n' && !insideQuotes) {
        row.push(cell);
        if (row.some((cell) => cell.trim() !== '')) {
          rows.push(row.filter((_, index) => columnsToKeep.includes(index)));
        }
        cell = '';
        row = [];
      } else {
        cell += char;
      }
    }

    // handle the last row if there was no newline at the end of the csv
    if (cell.trim() !== '' || row.length > 0) {
      row.push(cell);
      rows.push(row.filter((_, index) => columnsToKeep.includes(index)));
    }

    return rows;
  }

  // Offline
  setSelectedButton(index: number): void {
    // Clear buttons off Online test
    this.selectedOnlineButtonIndex = null;
    this.selectedWorkButtonIndex = null;

    this.selectedOfflineButtonIndex = index;
    switch (index) {
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
    this.isLoading0 = true;
    this.spinnerAsync().then(() => {
      this.dashboard = [
        // First row
        { cols: 2, rows: 2, y: 0, x: 0, content: 'PCA_kMeans' },
        { cols: 2, rows: 2, y: 0, x: 2, content: 'PCA_DBSCAN' },
        { cols: 2, rows: 2, y: 0, x: 4, content: 'PCA_AGNES' },
        // Second row
        { cols: 2, rows: 2, y: 2, x: 0, content: 'UMAP_kMeans' },
        { cols: 2, rows: 2, y: 2, x: 2, content: 'UMAP_DBSCAN' },
        { cols: 2, rows: 2, y: 2, x: 4, content: 'UMAP_AGNES' },
      ];
      this.isLoading0 = false; // Reset the loading state after the task is done
    });
  }

  handleBezNDatierungN(): void {
    this.isLoading1 = true;
    this.spinnerAsync().then(() => {
      this.dashboard = [
        // First row
        { cols: 6, rows: 2, y: 0, x: 0, content: 'BezDatierung_kMeans' },
        // Second row
        { cols: 6, rows: 2, y: 2, x: 0, content: 'BezDatierung_DBSCAN' },
        // Third row
        { cols: 6, rows: 2, y: 4, x: 0, content: 'BezDatierung_AGNES' },
      ];
      this.isLoading1 = false; // Reset the loading state after the task is done
    });
  }

  handleBezNFundeN(): void {
    this.isLoading2 = true;
    this.spinnerAsync().then(() => {
      this.dashboard = [
        // First row
        { cols: 6, rows: 2, y: 0, x: 0, content: 'BezFunde_kMeans' },
        // Second row
        { cols: 6, rows: 2, y: 2, x: 0, content: 'BezFunde_DBSCAN' },
        // Third row
        { cols: 6, rows: 2, y: 4, x: 0, content: 'BezFunde_AGNES' },
      ];
      this.isLoading2 = false; // Reset the loading state after the task is done
    });
  }

  handleBezNFundkategorieN(): void {
    this.isLoading3 = true;
    this.spinnerAsync().then(() => {
      this.dashboard = [
        // First row
        { cols: 6, rows: 2, y: 0, x: 0, content: 'BezFundkategorie_kMeans' },
        // Second row
        { cols: 6, rows: 2, y: 2, x: 0, content: 'BezFundkategorie_DBSCAN' },
        // Third row
        { cols: 6, rows: 2, y: 4, x: 0, content: 'BezFundkategorie_AGNES' },
      ];
      this.isLoading3 = false; // Reset the loading state after the task is done
    });
  }

  handleBezNFundeNDatierungN(): void {
    this.isLoading4 = true;
    this.spinnerAsync().then(() => {
      this.dashboard = [
        // First row
        { cols: 2, rows: 6, y: 0, x: 0, content: 'BezFundeDatierung_kMeans' },
        // Second row
        { cols: 2, rows: 6, y: 0, x: 2, content: 'BezFundeDatierung_DBSCAN' },
        // Third row
        { cols: 2, rows: 6, y: 0, x: 4, content: 'BezFundeDatierung_AGNES' },
      ];
      this.isLoading4 = false; // Reset the loading state after the task is done
    });
  }

  handleBezNFundeNDatierungNFundkategorieN(): void {
    this.isLoading5 = true;
    this.spinnerAsync().then(() => {
      this.dashboard = [
        // First row
        {
          cols: 2,
          rows: 6,
          y: 0,
          x: 0,
          content: 'BezFundeDatierungFundkategorie_kMeans',
        },
        // Second row
        {
          cols: 2,
          rows: 6,
          y: 0,
          x: 2,
          content: 'BezFundeDatierungFundkategorie_DBSCAN',
        },
        // Third row
        {
          cols: 2,
          rows: 6,
          y: 0,
          x: 4,
          content: 'BezFundeDatierungFundkategorie_AGNES',
        },
      ];
      this.isLoading5 = false; // Reset the loading state after the task is done
    });
  }

  // Online
  onlineSubmit(index: number) {
    this.isLoadingOnline = true;
    this.spinnerAsync().then(() => {
      if (this.online_form.valid) {
        // Clear buttons off Offline test
        this.selectedOfflineButtonIndex = null;
        this.selectedWorkButtonIndex = null;
        this.selectedOnlineButtonIndex = index;
        // Process the form data
        this.boxCount = Object.values(this.online_form.value).filter((value) => value === true).length; // Number of Objects set to true
        const checkedBoxes = Object.entries(this.online_form.value)
          .filter(([key, value]) => value === true)
          .map(([key]) => key); // Checkboxes names set to true
        this.o_x_title = checkedBoxes[0];
        this.o_y_title = checkedBoxes[1];
        this.o_z_title = checkedBoxes[2];
        this.o_d_title = checkedBoxes[3];
        this.setCorrectAxis(this.online_form.value, this.boxCount); // Based on offline graphs
        this.o_x_column = this.mapCsvColumns(this.o_x_title, this.export2_CsvData);
        this.o_y_column = this.mapCsvColumns(this.o_y_title, this.export2_CsvData);
        this.o_z_column = this.mapCsvColumns(this.o_z_title, this.export2_CsvData);
        this.o_d_column = this.mapCsvColumns(this.o_d_title, this.export2_CsvData);
        if (this.boxCount === 2) {
          this.dashboard = [
            { cols: 6, rows: 2, y: 0, x: 0, content: '2D_Online_kMeans' },
            { cols: 6, rows: 2, y: 2, x: 0, content: '2D_Online_DBSCAN' },
            { cols: 6, rows: 2, y: 4, x: 0, content: '2D_Online_AGNES' },
          ];
        } else {
          this.dashboard = [
            { cols: 2, rows: 6, y: 0, x: 0, content: '3D4D_Online_kMeans' },
            { cols: 2, rows: 6, y: 0, x: 2, content: '3D4D_Online_DBSCAN' },
            { cols: 2, rows: 6, y: 0, x: 4, content: '3D4D_Online_AGNES' },
          ];
        }

        const indices = [this.o_x_column, this.o_y_column, this.o_z_column, this.o_d_column].filter(
          (index) => index !== null
        );

        const points = this.export2_CsvData.slice(1).map((row) => indices.map((index) => parseFloat(row[index]))); // Extract data from the selected columns

        // kMeans
        const output = kmeans(points, this.online_form.value.n_kMeans, undefined, 300);
        this.kMeans_points = output.indexes.map(String); // 6689
        this.kMeans_points = this.export2_CsvData
          .filter((_, index) => index < 800) // (index < 800) Skip the first row and give 799 data
          .map((row, rowIndex) => {
            return output.indexes.map(String)[rowIndex];
          });

        // DBSCAN
        let data = points.slice(0, 800);
        const dbscan = new clustering.DBSCAN();
        const dbscanClusters = dbscan.run(
          data,
          this.online_form.value.eps_dbscan,
          this.online_form.value.minPts_dbscan
        ); // dataset, eps, minPts
        let output2 = new Array(data.length).fill(-1); // Initialize the array with -1
        for (let i = 0; i < dbscanClusters.length; i++) {
          for (let j = 0; j < dbscanClusters[i].length; j++) {
            output2[dbscanClusters[i][j]] = i;
          }
        }
        this.DBSCAN_points = this.export2_CsvData
          .filter((_, index) => index !== 0) // Skip the first row
          .map((_, rowIndex) => String(output2[rowIndex]));

        // AGNES
        const a_cluster = hclust.agnes(data, { method: 'average' });
        const cutHeight = this.findHeightForClusters(a_cluster, this.online_form.value.n_agnes);
        const clusters = a_cluster.cut(cutHeight);
        let clusterIndicesArray = clusters.map((cluster) => this.getLeafIndices(cluster));
        let AGNES_points = new Array(data.length).fill(-1);
        for (let clusterId = 0; clusterId < clusterIndicesArray.length; clusterId++) {
          for (let index of clusterIndicesArray[clusterId]) {
            AGNES_points[index] = clusterId;
          }
        }
        this.AGNES_points = AGNES_points.map(String);
      } else {
        // Display a general message or loop through controls to show individual error messages
        this.selectedOnlineButtonIndex = null;
        console.warn('Form is invalid');
      }
      this.isLoadingOnline = false;
    });
  }

  // Work
  import(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input?.files?.[0]) {
      return;
    }
    const file: File = input.files[0];
    if (file) {
      // Add as first element
      this.fileNames.unshift(file.name);
      // Refresh form
      this.workSidebar_form = this.fb.group({
        selectedDatasetControl: [this.fileNames[0]],
      });
      this.isLoadingOnline = false;
    }
    const reader: FileReader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      const csv = reader.result as string;
      // Save loaded csv file in array of files
      this.importCsvData = csv;
    };
  }

  export() {
    const exportArrayToCsv = (data: string[][]): string => {
      return data.map((row) => row.join(',')).join('\n');
    };

    const csvContent = exportArrayToCsv(this.workCsvData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    const currentDatetime = this.getCurrentDatetime();
    anchor.href = url;
    anchor.download = `${currentDatetime}_data.csv`;
    anchor.click();

    window.URL.revokeObjectURL(url);
  }

  workSubmit(index: number) {
    this.isLoadingOnline = true;
    this.spinnerAsync().then(() => {
      if (this.workSidebar_form.valid) {
        // Clear buttons off Offline test
        this.selectedOfflineButtonIndex = null;
        this.selectedWorkButtonIndex = null;
        this.selectedOnlineButtonIndex = index;
        // Process the form data
        if (this.workSidebar_form.get('selectedDatasetControl').value === 'kmeans_funde_2503.csv') {
          this.loadWorkCsvData(this.workSidebar_form.get('selectedDatasetControl').value);
        } else if (this.workSidebar_form.get('selectedDatasetControl').value === 'dbscan_funde_2503.csv') {
          this.loadWorkCsvData(this.workSidebar_form.get('selectedDatasetControl').value);
        } else if (this.workSidebar_form.get('selectedDatasetControl').value === 'agnes_funde_2503.csv') {
          this.loadWorkCsvData(this.workSidebar_form.get('selectedDatasetControl').value);
        } else {
          // Import
          this.processCsvData(this.importCsvData);
        }
        this.dashboard = [
          { cols: 6, rows: 2, y: 0, x: 0, content: 'Map_Edit' },
          { cols: 6, rows: 2, y: 2, x: 0, content: 'CSV_Edit' },
        ];

        this.isLoadingOnline = false;
      }
    });
  }

  csvDisplayMenu(): void {
    this.isTableEditMode = !this.isTableEditMode;
  }

  algoWordCombinationMajorityVoteWithinClusters(newFindings: string): string {
    // Split form value
    const searchWords = newFindings.split(' ');

    // Save unique cluster number in an array
    const uniqueClusterValues = [...new Set(this.workCsvData.slice(1).map((row) => row[9]))].sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    // Save in var for each unique cluster word and its count number
    const findingsCountByCluster: any = {};
    uniqueClusterValues.forEach((cluster) => {
      const rowsOfThisCluster = this.workCsvData.filter((row) => row[9] === cluster);
      const wordsCount: any = {};
      rowsOfThisCluster.forEach((row) => {
        const words = row[7].split(' ');
        // Filter searchwords from clusters
        words.forEach((word) => {
          if (searchWords.includes(word)) {
            // Check if word is part of the searchWords
            if (!wordsCount[word]) {
              wordsCount[word] = 0;
            }
            wordsCount[word]++;
          }
        });
      });
      findingsCountByCluster[cluster] = wordsCount;
    });

    // If word not exist in one of the clusters, than add to -1 cluster
    const allClustersEmpty = Object.values(findingsCountByCluster).every(
      (wordCounts: any) => Object.keys(wordCounts).length === 0
    );
    if (allClustersEmpty) {
      return '-1';
    }

    // Filter cluster with the highest length of wordsCount
    let maxLength = Math.max(
      ...Object.values(findingsCountByCluster).map((wordCount: any) => Object.keys(wordCount).length)
    );
    const filteredFindingsCountByCluster: any = {};
    for (let cluster in findingsCountByCluster) {
      if (Object.keys(findingsCountByCluster[cluster]).length === maxLength) {
        filteredFindingsCountByCluster[cluster] = findingsCountByCluster[cluster];
      }
    }

    // Sum all counts within each cluster and return highest cluster number
    const clusterTotals: any = {};
    for (let cluster in filteredFindingsCountByCluster) {
      clusterTotals[cluster] = Object.values<number>(filteredFindingsCountByCluster[cluster]).reduce(
        (acc, curr) => acc + curr,
        0
      );
    }

    // Find the cluster with the maximum total count
    const maxCluster = Object.keys(clusterTotals).reduce((a, b) => (clusterTotals[a] > clusterTotals[b] ? a : b));

    return maxCluster.toString();
  }

  algoLabelClusterMajority(): string {
    // Save unique cluster number in an array
    const uniqueClusterValues = [...new Set(this.workCsvData.slice(1).map((row) => row[9]))].sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    // Save in var for each unique cluster number of rows
    const clusterRowCount: { [cluster: string]: number } = {};
    uniqueClusterValues.forEach((cluster) => {
      const rowsOfThisCluster = this.workCsvData.filter((row) => row[9] === cluster);
      clusterRowCount[cluster] = rowsOfThisCluster.length;
    });

    // Return the highest cluster number
    const maxCluster = Object.keys(clusterRowCount).reduce((a, b) => (clusterRowCount[a] > clusterRowCount[b] ? a : b));

    return maxCluster.toString();
  }

  csvAddRow() {
    if (this.workTable_form.valid) {
      let calcClusterNumber: string;
      const formValues = this.workTable_form.value;
      if (formValues.selectedAlgo === 'algoWordCombinationMajorityVoteWithinClusters') {
        calcClusterNumber = this.algoWordCombinationMajorityVoteWithinClusters(formValues.addFunde);
      } else if (formValues.selectedAlgo === 'algoLabelClusterMajority') {
        calcClusterNumber = this.algoLabelClusterMajority();
      }
      const newRow = [
        formValues.addObjectId.toString(),
        'POINT (' + formValues.addLon + ' ' + formValues.addLat + ')',
        formValues.selectedBez,
        formValues.addStrasse,
        formValues.addNummer,
        formValues.addExtra,
        formValues.selectedFundkategorie,
        formValues.addFunde,
        formValues.selectedDatierung,
        calcClusterNumber,
      ];
      this.workCsvData = [...this.workCsvData, newRow];
      this.workTable_form.patchValue({
        addObjectId: this.getHighestObjectId() + 1,
      });
      this.cdRef.detectChanges();
    } else {
      console.warn('Form is invalid');
    }
  }

  csvDeleteRow(objectIdToRemove: string): void {
    const userConfirmed = window.confirm(`Are you sure you want to delete OBJECTID=${objectIdToRemove}?`);
    if (userConfirmed) {
      this.workCsvData = this.workCsvData.filter(
        (row) => row[this.workCsvData[0].indexOf('OBJECTID')] !== objectIdToRemove
      );
    }
  }

  csvCopyRow(objectIdToEdit: string): void {
    const rowToEdit = this.workCsvData.find((row) => row[this.workCsvData[0].indexOf('OBJECTID')] == objectIdToEdit);
    if (rowToEdit) {
      const lonLatMatches = rowToEdit[this.workCsvData[0].indexOf('SHAPE')].match(/POINT \((\d+\.\d+) (\d+\.\d+)\)/);
      this.workTable_form.setValue({
        addObjectId: rowToEdit[this.workCsvData[0].indexOf('OBJECTID')],
        addLon: lonLatMatches ? lonLatMatches[1] : '',
        addLat: lonLatMatches ? lonLatMatches[2] : '',
        selectedBez: rowToEdit[this.workCsvData[0].indexOf('BEZ')],
        addStrasse: rowToEdit[this.workCsvData[0].indexOf('STRNAM')],
        addNummer: rowToEdit[this.workCsvData[0].indexOf('HNR')],
        addExtra: rowToEdit[this.workCsvData[0].indexOf('HNR_BIS')],
        selectedFundkategorie: rowToEdit[this.workCsvData[0].indexOf('FUNDKATEGORIE')],
        selectedFunde: rowToEdit[this.workCsvData[0].indexOf('FUNDE')],
        selectedDatierung: rowToEdit[this.workCsvData[0].indexOf('DATIERUNG')],
      });
    } else {
      console.error('Row with OBJECTID', objectIdToEdit, 'not found');
    }
  }

  // HELPERS
  getLastRowNumber() {
    return this.workCsvData.length - 1;
  }

  getHighestObjectId(): number {
    const objectIdIndex = this.workCsvData[0].indexOf('OBJECTID');
    const objectIds = this.workCsvData.slice(1).map((row) => parseInt(row[objectIdIndex], 10));
    return Math.max(...objectIds);
  }

  getColumnIndex(columnName: string, csvData: any): number {
    return csvData[0].indexOf(columnName);
  }

  mapCsvColumns(name: string, csvData: any) {
    if (name === 'FUNDE') return this.getColumnIndex('FUNDE', csvData);
    if (name === 'BEZ') return this.getColumnIndex('BEZ', csvData);
    if (name === 'DATIERUNG') return this.getColumnIndex('DATIERUNG', csvData);
    if (name === 'FUNDKATEGORIE') return this.getColumnIndex('FUNDKATEGORIE', csvData);
    return null;
  }

  setCorrectAxis(form: any, boxCount: any) {
    if (boxCount == 2) {
      if (form['BEZ'] && form['DATIERUNG']) {
        // x=BEZ, y=DATIERUNG
        this.o_x_title = 'BEZ';
        this.o_y_title = 'DATIERUNG';
      } else if (form['BEZ'] && form['FUNDE']) {
        // x=BEZ, y=FUNDE
        this.o_x_title = 'BEZ';
        this.o_y_title = 'FUNDE';
      } else if (form['BEZ'] && form['FUNDKATEGORIE']) {
        // x=BEZ, y=FUNDKATEGORIE
        this.o_x_title = 'BEZ';
        this.o_y_title = 'FUNDKATEGORIE';
      }
    }
  }

  getLeafIndices(cluster: { isLeaf: any; index: any; children: any }) {
    let indices: any[] = [];
    if (cluster.isLeaf) {
      indices.push(cluster.index);
    } else {
      for (let child of cluster.children) {
        indices = indices.concat(this.getLeafIndices(child));
      }
    }
    return indices;
  }

  findHeightForClusters(cluster: { height: any; cut: (arg0: any) => any }, numClusters: any) {
    const max = cluster.height;
    const min = 0;
    const step = 0.01;
    for (let height = max; height >= min; height -= step) {
      const clustersAtHeight = cluster.cut(height);
      if (clustersAtHeight.length === numClusters) {
        return height;
      }
    }
    return max; // Default to max if not found
  }

  capitalizeEachWord(value: string): string {
    if (!value) {
      return '';
    }
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getCurrentDatetime(): string {
    const now = new Date();
    return (
      now.getFullYear() +
      ('0' + (now.getMonth() + 1)).slice(-2) +
      ('0' + now.getDate()).slice(-2) +
      '_' +
      ('0' + now.getHours()).slice(-2) +
      ('0' + now.getMinutes()).slice(-2) +
      ('0' + now.getSeconds()).slice(-2)
    );
  }

  removeWindow(item: GridsterItem) {
    const index = this.dashboard.indexOf(item);
    if (index > -1) {
      this.dashboard.splice(index, 1);
    }
  }

  spinnerAsync(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000); // For demonstration purposes, a delay of 2 seconds
    });
  }
}
