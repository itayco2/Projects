import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { QnaModel } from '../../../models/qna.model';
import { SpinnerComponent } from "../../shared-area/spinner/spinner.component";

@Component({
  selector: 'app-output',
  imports: [MatExpansionModule, SpinnerComponent, CommonModule],
  templateUrl: './output.component.html',
  styleUrl: './output.component.css'
})
export class OutputComponent {

    @Input()
    public qnas: QnaModel[] = null;

}
