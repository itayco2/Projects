import { Component } from '@angular/core';
import { MenuComponent } from "../menu/menu.component";
import { UserMenuComponent } from "../../user-area/user-menu/user-menu.component";
import { SuggestionComponent } from "../../page-area/suggestion/suggestion.component";
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, UserMenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(private router: Router) {}

  scrollToAboutMe() {
    // First, check if we're already on the home page
    if (this.router.url !== '/home' && this.router.url !== '/') {
      // Navigate to home page first, then scroll after navigation is complete
      this.router.navigate(['/home']).then(() => {
        // Use setTimeout to ensure the component is loaded
        setTimeout(() => {
          const element = document.getElementById('AboutMe');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      });
    } else {
      // Already on home page, just scroll
      const element = document.getElementById('AboutMe');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }


  scrollToWorkshops() {
    if (this.router.url !== '/home' && this.router.url !== '/') {
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => {
          const element = document.getElementById('workshops');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      });
    } else {
      const element = document.getElementById('workshops');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  
}