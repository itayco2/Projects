import { Component } from '@angular/core';
import { LogoComponent } from "../logo/logo.component";
import { UserMenuComponent } from "../../user-area/user-menu/user-menu.component";
import { MenuComponent } from "../menu/menu.component";

@Component({
  selector: 'app-header',
  imports: [UserMenuComponent, MenuComponent, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
