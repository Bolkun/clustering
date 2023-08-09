import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// https://fontawesome.com/v4/icons
import { faHome } from '@fortawesome/free-solid-svg-icons'; 
import { faSign } from '@fortawesome/free-solid-svg-icons';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  faHome = faHome;
  faDashboard = faSign;
  faHelp = faQuestion;

  faMenu = faBook;
  faMenuClosed = faCaretDown;
  faMenuOpened = faCaretUp;

  constructor(private router: Router) {}

  ngOnInit() { }

  isDashboardActive(): boolean {
    return this.router.url === '/dashboard';
  }

}
