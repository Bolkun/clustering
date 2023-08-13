import { Component, OnInit } from '@angular/core';
// https://fontawesome.com/v4/icons
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';

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
  activeTab: null | string = 'tab1';  // Default active tab
  isContentFlex: boolean = false;
  selectedOfflineButtonIndex: number | null = null;
  selectedOnlineButtonIndex: number | null = null;
  form: FormGroup;

  faGlobe = faGlobe;
  faOffline = faTimes;
  faOnline = faCheck;
  faSidebarVisible = faEye;
  faSidebarUnvisible = faEyeSlash;

  options: GridsterConfig;
  dashboard: GridsterItem[];
  
  constructor(private fb: FormBuilder) {
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
      draggable: { enabled: true },
      resizable: { enabled: true },
      swap: true,
      displayGrid: 'none',
      pushItems: false
    };

    this.dashboard = [
      {cols: 2, rows: 2, y: 0, x: 0, content: "Item 1"},
      {cols: 2, rows: 1, y: 0, x: 2, content: "Item 2"},
      {cols: 2, rows: 1, y: 1, x: 2, content: "Item 3"},
      {cols: 1, rows: 1, y: 2, x: 0, content: "Item 4"},
      {cols: 1, rows: 1, y: 2, x: 1, content: "Item 5"},
      {cols: 2, rows: 1, y: 2, x: 2, content: "Item 6"}
    ];
  }

  ngOnInit(): void {}

  get isContentVisible(): boolean {
    return this.activeTab === 'tab1' || this.activeTab === 'tab2';
  }

  toggleContentDisplay(): void {
    this.isContentFlex = !this.isContentFlex;
  }

  setSelectedButton(index: number): void {
    // Clear buttons off Online test
    this.selectedOnlineButtonIndex = null;
    this.selectedOfflineButtonIndex = index;
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
