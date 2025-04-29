import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CredentialsModel } from '../../../models/credentials.model';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { NotifyService } from '../../../services/notify.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']  // Fixed typo: changed styleUrl to styleUrls
})
export class LoginComponent implements OnInit {

    // Model to hold user credentials
    private credentialsModel = new CredentialsModel();
    
    // Form group for login form
    public credentialsFormGroup: FormGroup;

    constructor(
        private userService: UserService,
        private router: Router,
        private formBuilder: FormBuilder,
        private notifyService: NotifyService
    ) { }

    ngOnInit(): void {
        // Initialize the form group with form controls and validators
        this.credentialsFormGroup = this.formBuilder.group({
            emailControl: new FormControl("", [Validators.required, Validators.email]),  // Added validators
            passwordControl: new FormControl("", Validators.required)  // Added validators
        });
    }

    // Method to handle form submission
    public async send() {
        // Check if the form is invalid
        if (this.credentialsFormGroup.invalid) {
            this.notifyService.error('Please fill in all fields correctly.');
            return;
        }

        try {
            // Assign form values to the credentials model
            this.credentialsModel.email = this.credentialsFormGroup.get("emailControl").value;
            this.credentialsModel.password = this.credentialsFormGroup.get("passwordControl").value;

            // Call service to login the user
            await this.userService.login(this.credentialsModel);  // Ensure login method is returning a Promise
            this.notifyService.success('Welcome Back!');
            
            // Navigate to the home page
            this.router.navigateByUrl("/home");
        }
        catch (err: any) {
            this.notifyService.error(err);
        }
    }
}
