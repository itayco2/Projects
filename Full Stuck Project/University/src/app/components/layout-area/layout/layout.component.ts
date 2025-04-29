import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { MenuComponent } from "../menu/menu.component";
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { UserMenuComponent } from "../../user-area/user-menu/user-menu.component";

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
