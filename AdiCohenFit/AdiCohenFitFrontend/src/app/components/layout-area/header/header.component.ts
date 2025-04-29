import { Component } from '@angular/core';
import { LogoComponent } from "../logo/logo.component";
import { MenuComponent } from "../menu/menu.component";
import { UserMenuComponent } from "../../user-area/user-menu/user-menu.component";
import { SuggestionComponent } from "../../page-area/suggestion/suggestion.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, UserMenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
