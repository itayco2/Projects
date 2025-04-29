import { Component, inject, OnInit } from '@angular/core';
import { workshopModel } from '../../../models/workshop.model';
import { AuthService } from '../../../services/auth.service';
import { UserStore } from '../../../storage/user-store';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { WorkshopService } from '../../../services/workshop.service';
import { NotifyService } from '../../../services/notify.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { PaymentService } from '../../../services/payment.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  public quantity: number = 1;
  public totalPrice: number = 0;
  public workshop: workshopModel | null = null;
  public workshopId: string = '';
  public paymentForm: FormGroup;
  public isSubmitting: boolean = false;
  public showPaymentForm: boolean = false;

  public imageBaseUrl = 'http://localhost:5022/assets/images/';

  public authService = inject(AuthService); 
  private userStore = inject(UserStore); 
  private sanitizer = inject(DomSanitizer);

  constructor(
    private workshopService: WorkshopService,
    private notifyService: NotifyService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {}

  public async ngOnInit() {
    try {
      this.workshopId = this.route.snapshot.params['id'] || '';
      
      if (this.workshopId) {
        this.workshop = await this.workshopService.getOneWorkshop(this.workshopId);
        this.updateTotalPrice();
      }
      
      this.initializeForm();

    } catch (err: any) {
      this.notifyService.error(err?.message || 'Failed to load workshop');
    }
  }

  initializeForm(): void {
    this.paymentForm = this.fb.group({
      // Personal Information
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^05\d-?\d{7}$/)]],
      
      // Payment Method
      paymentMethod: ['creditCard', Validators.required],
      
      // Credit Card Information
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['', [Validators.required]],
      
      // Terms
      termsAccepted: [false, Validators.requiredTrue]
    });
    
    // Update validators when payment method changes
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(() => {
      this.updateValidators();
    });
  }
  
  updateValidators(): void {
    const isUsingCreditCard = this.paymentForm.get('paymentMethod')?.value === 'creditCard';
    const cardFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
    
    cardFields.forEach(field => {
      const control = this.paymentForm.get(field);
      if (isUsingCreditCard) {
        control?.setValidators([Validators.required]);
      } else {
        control?.clearValidators();
      }
      control?.updateValueAndValidity();
    });
  }

  getBackgroundStyle(workshop: workshopModel | null): SafeStyle {
    const imageName = workshop?.imageName || 'default.jpg';
    const imageUrl = `${this.imageBaseUrl}${imageName}`;
    return this.sanitizer.bypassSecurityTrustStyle(`url(${imageUrl})`);
  }
  
  handleImageError(workshop: workshopModel): void {
    console.error('Image failed to load:', this.imageBaseUrl + workshop.imageName);
  }
  
  updateTotalPrice(): void {
    if (this.workshop) {
      this.totalPrice = this.quantity * this.workshop.workshopPrice;
    }
  }
  
  increaseQuantity(): void {
    if (this.workshop && this.quantity < this.workshop.workshopPlacesLeft) {
      this.quantity++;
      this.updateTotalPrice();
    }
  }
  
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateTotalPrice();
    }
  }
  
  proceedToCheckout(): void {
    this.showPaymentForm = true;
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.paymentForm.controls).forEach(key => {
        const control = this.paymentForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    const paymentData = {
      workshopId: this.workshopId,
      quantity: this.quantity,
      totalAmount: this.totalPrice,
      customerInfo: {
        name: this.paymentForm.get('fullName')?.value,
        email: this.paymentForm.get('email')?.value,
        phone: this.paymentForm.get('phone')?.value
      },
      paymentMethod: this.paymentForm.get('paymentMethod')?.value,
      paymentDetails: this.paymentForm.get('paymentMethod')?.value === 'creditCard' ? {
        cardNumber: this.paymentForm.get('cardNumber')?.value,
        expiryDate: this.paymentForm.get('expiryDate')?.value,
        cvv: this.paymentForm.get('cvv')?.value,
        cardholderName: this.paymentForm.get('cardholderName')?.value
      } : {}
    };
    
    // Process payment based on selected method
    if (this.paymentForm.get('paymentMethod')?.value === 'creditCard') {
      this.processCardPayment(paymentData);
    } else if (this.paymentForm.get('paymentMethod')?.value === 'paypal') {
      this.processPayPalPayment(paymentData);
    }
  }
  
  processCardPayment(paymentData: any): void {
    this.paymentService.processCardPayment(paymentData)
      .subscribe({
        next: (response) => {
          this.handlePaymentSuccess(response);
        },
        error: (error) => {
          this.handlePaymentError(error);
        }
      });
  }
  
  processPayPalPayment(paymentData: any): void {
    this.paymentService.getPayPalRedirectUrl(paymentData)
      .subscribe({
        next: (response) => {
          // Redirect to PayPal
          window.location.href = response.redirectUrl;
        },
        error: (error) => {
          this.handlePaymentError(error);
        }
      });
  }
  
  handlePaymentSuccess(response: any): void {
    this.isSubmitting = false;
    // Store transaction ID or reference
    localStorage.setItem('transactionId', response.transactionId);
    // Navigate to confirmation page
    this.router.navigate(['/payment-success']);
    this.notifyService.success('התשלום בוצע בהצלחה!');
  }
  
  handlePaymentError(error: any): void {
    this.isSubmitting = false;
    console.error('Payment error:', error);
    // Show error message to user
    this.notifyService.error('שגיאה בתהליך התשלום. אנא נסו שנית מאוחר יותר.');
  }
}