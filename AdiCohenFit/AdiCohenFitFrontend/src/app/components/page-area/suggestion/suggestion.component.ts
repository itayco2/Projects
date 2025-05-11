import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-suggestion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suggestion.component.html',
  styleUrl: './suggestion.component.css'
})
export class SuggestionComponent {
  // Method to copy coupon code to clipboard
  copyCouponCode(code: string, event: Event): void {
    navigator.clipboard.writeText(code).then(() => {
      const element = event.target as HTMLElement;
      const originalText = element.textContent;
      
      // Change text to indicate successful copy
      element.textContent = 'הועתק!';
      element.style.backgroundColor = '#f8f8f8';
      element.style.color = '#27ae60';
      
      // Reset back to original text after 2 seconds
      setTimeout(() => {
        element.textContent = originalText;
        element.style.backgroundColor = '';
        element.style.color = '';
      }, 2000);
    });
  }
}