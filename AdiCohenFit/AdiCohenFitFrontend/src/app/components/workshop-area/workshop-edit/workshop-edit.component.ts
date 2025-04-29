import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { workshopModel } from '../../../models/workshop.model';
import { WorkshopService } from '../../../services/workshop.service';
import { NotifyService } from '../../../services/notify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-workshop-edit',
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './workshop-edit.component.html',
  styleUrl: './workshop-edit.component.css'
})
export class WorkshopEditComponent implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

        // Added these properties for file handling
        public selectedImageFile: File | null = null;
        public selectedFileName: string | null = null;

    private workshopModel = new workshopModel();
    
    public workshopFormGroup: FormGroup;

    public workshopId: string = '';

    constructor(
        private workshopService: WorkshopService,
        private notifyService: NotifyService,
        private router: Router,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
    ){}




    ngOnInit(): void {
        this.workshopId = this.route.snapshot.params['id'] || '';

        if(this.workshopId) this.loadWorkshop(this.workshopId);

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
            imageControl: new FormControl('')
           });
        
    }

    private loadWorkshop(workshopId: string): void {
        this.workshopService.getOneWorkshop(workshopId).then(
          (workshop) => {
            this.workshopModel = workshop; // Preload lesson data into the model
            this.workshopFormGroup.patchValue({
                nameControl: this.workshopModel.workshopName,
                descriptionControl: this.workshopModel.workshopDescription,
                placesControl: this.workshopModel.workshopPlacesLeft,
                priceControl: this.workshopModel.workshopPrice,
                dateControl: this.workshopModel.workshopDate,
                imageControl: this.workshopModel.imageName,
                paymentControl: this.workshopModel.paymentLink
            });
            
          }
        ).catch(
          (error) => {
            this.notifyService.error('Failed to load workshop data');
          }
        );
    }

    public async send() {
        if (this.workshopFormGroup.invalid) {
            this.notifyService.error("יש למלא את כל השדות הנדרשים.");
            return;
        }
    
        try {
            this.workshopModel.workshopName = this.workshopFormGroup.get('nameControl')?.value;
            this.workshopModel.workshopDescription = this.workshopFormGroup.get('descriptionControl')?.value;
            this.workshopModel.workshopPlacesLeft = this.workshopFormGroup.get('placesControl')?.value;
            this.workshopModel.workshopPrice = this.workshopFormGroup.get('priceControl')?.value;
            this.workshopModel.workshopDate = this.workshopFormGroup.get('dateControl')?.value;
            this.workshopModel.paymentLink = this.workshopFormGroup.get('paymentControl')?.value;
            this.workshopModel.id = this.workshopId;
    
            const formData = new FormData();
            formData.append('id', this.workshopModel.id);
            formData.append('workshopName', this.workshopModel.workshopName);
            formData.append('workshopDescription', this.workshopModel.workshopDescription);
            formData.append('workshopPlacesLeft', this.workshopModel.workshopPlacesLeft.toString());
            formData.append('workshopPrice', this.workshopModel.workshopPrice.toString());
            formData.append('workshopDate', this.workshopModel.workshopDate.toString());
            formData.append('paymentLink', this.workshopModel.paymentLink);

    
            // Optional image handling
            if (this.selectedImageFile && this.selectedFileName) {
                formData.append('imageName', this.selectedFileName);
                formData.append('image', this.selectedImageFile, this.selectedFileName);
            } else {
                formData.append('imageName', this.workshopModel.imageName ?? '');
            }
    
            await this.workshopService.updateWorkshop(formData, this.workshopModel.id);
    
            this.notifyService.success('סדנא עודכנה');
            this.router.navigateByUrl('/workshops');
        } catch (err) {
            console.log(err);
            this.notifyService.error('אירעה שגיאה בעריכת הסדנא');
        }
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
    
    public isCanceled = false;

    // Method to handle dialog cancel action
    public dialogCanceled() {
      this.isCanceled = true;
    }

    public BackToWorkshops(){
        this.router.navigateByUrl("workshops")
    }
    
}