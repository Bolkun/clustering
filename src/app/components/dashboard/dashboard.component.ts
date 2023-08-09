import { Component, OnInit } from '@angular/core';

// https://fontawesome.com/v4/icons
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  activeTab: null | string = 'tab1';  // Default active tab
  isContentFlex: boolean = true;
  selectedButtonIndex: number | null = null;

  faGlobe = faGlobe;
  faOffline = faTimes;
  faOnline = faCheck;
  faSidebarVisible = faEye;
  faSidebarUnvisible = faEyeSlash;
  
  constructor() {}

  ngOnInit(): void {}

  get isContentVisible(): boolean {
    return this.activeTab === 'tab1' || this.activeTab === 'tab2';
  }

  toggleContentDisplay(): void {
    this.isContentFlex = !this.isContentFlex;
  }

  setSelectedButton(index: number): void {
    this.selectedButtonIndex = index;
  }
}
