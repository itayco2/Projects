import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { workshopModel } from '../../../models/workshop.model';
import { WorkshopService } from '../../../services/workshop.service';
import { NotifyService } from '../../../services/notify.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-workshop-new',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './workshop-new.component.html',
  styleUrl: './workshop-new.component.css'
})
export class WorkshopNewComponent implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    private workshopModel = new workshopModel();
    public workshopFormGroup!: FormGroup;
    
    // Added these properties for file handling
    public selectedImageFile: File | null = null;
    public selectedFileName: string | null = null;

    constructor(
        private workshopService: WorkshopService,
        private notifyService: NotifyService,
        private router: Router,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute 
    ) {}

    ngOnInit(): void {
       this.workshopFormGroup = this.formBuilder.group({
        nameControl: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50)
        ]),
        descriptionControl: new FormControl('', [
            Validators.required,
            Validators.minLength(20),
            Validators.maxLength(1000)
        ]),
        placesControl: new FormControl('', [
            Validators.required,
        ]),
        priceControl: new FormControl('', [
            Validators.required,
        ]),
        dateControl: new FormControl('', [
            Validators.required,
        ]),
        paymentControl: new FormControl('', [
            Validators.required,
        ]),
        imageControl: new FormControl('', [
            Validators.required,
        ])
       });
    }

    onFileSelected(): void {
        const files = this.fileInput.nativeElement.files;
        if (files && files.length > 0) {
          this.selectedImageFile = files[0];
          this.selectedFileName = files[0].name;
          // Update form control value
          this.workshopFormGroup.get('imageControl')?.setValue(this.selectedFileName);
        } else {
          this.selectedImageFile = null;
          this.selectedFileName = null;
          this.workshopFormGroup.get('imageControl')?.setValue(null);
        }
    }

    public async send() {
        if (this.workshopFormGroup.invalid || !this.selectedImageFile) {
            this.notifyService.error("יש למלא את כל השדות ולהוסיף תמונה.");
            return;
        }

        try {
            this.workshopModel.workshopName = this.workshopFormGroup.get('nameControl')?.value;
            this.workshopModel.workshopDescription = this.workshopFormGroup.get('descriptionControl')?.value;
            this.workshopModel.workshopPlacesLeft = this.workshopFormGroup.get('placesControl')?.value;
            this.workshopModel.workshopPrice = this.workshopFormGroup.get('priceControl')?.value;
            this.workshopModel.workshopDate = this.workshopFormGroup.get('dateControl')?.value;
            this.workshopModel.paymentLink = this.workshopFormGroup.get('paymentControl')?.value;
            this.workshopModel.imageName = this.selectedFileName;
            this.workshopModel.image = this.selectedImageFile; // Store the actual file

            // Create FormData using the static method
            const formData = workshopModel.toFormData(this.workshopModel);
            
            // Add the image file since toFormData doesn't handle it
            formData.append('image', this.selectedImageFile, this.selectedFileName);
            
            // You'll need to create this method in your service
            await this.workshopService.addWorkshopWithFormData(formData);
            
            
            this.notifyService.success('סדנא נוצרה בהצלחה');
            this.router.navigateByUrl('/workshops');
        }
        catch(err) {
            this.notifyService.error('אירעה שגיאה ביצירת סדנא');
        }
    }

    public isCanceled = false;

    // Method to handle dialog cancel action
    public dialogCanceled() {
      this.isCanceled = true;
    }
}