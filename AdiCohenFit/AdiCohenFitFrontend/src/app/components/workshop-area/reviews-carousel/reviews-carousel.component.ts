// reviews-carousel.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

interface Review {
  id: number;
  name: string;
  image: string;
  text: string;
  rating: number;
}

@Component({
  selector: 'app-reviews-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews-carousel.component.html',
  styleUrls: ['./reviews-carousel.component.css']
})
export class ReviewsCarouselComponent implements OnInit, OnDestroy {
  reviews: Review[] = [
    {
      id: 1,
      name: "Alex Johnson",
      image: "assets/images/avatar.png",
      text: "Absolutely love this product! It exceeded all my expectations and has been such a game changer for my daily routine.",
      rating: 5
    },
    {
      id: 2,
      name: "Jamie Smith",
      image: "assets/images/avatar.png",
      text: "Great value for the price. The customer service team was also very helpful when I had questions.",
      rating: 4
    },
    {
      id: 3,
      name: "Casey Wong",
      image: "assets/images/avatar.png",
      text: "I've been using this for about a month now and can definitely see the difference. Would recommend!",
      rating: 4
    },
    {
      id: 4,
      name: "Taylor Reed",
      image: "assets/images/avatar.png",
      text: "Exactly what I was looking for. The quality is excellent and it arrived sooner than expected.",
      rating: 5
    },
    {
      id: 5,
      name: "Morgan Jones",
      image: "assets/images/avatar.png",
      text: "This has completely transformed my workflow. I can't imagine going back to the old way of doing things.",
      rating: 5
    }
  ];

  currentReviewIndex = 0;
  carouselInterval: any;

  ngOnInit(): void {
    this.startCarouselTimer();
  }

  ngOnDestroy(): void {
    this.stopCarouselTimer();
  }

  startCarouselTimer(): void {
    this.carouselInterval = setInterval(() => {
      this.nextReview();
    }, 5000); // Change review every 5 seconds
  }

  stopCarouselTimer(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  // Method to get the previous review index with circular logic
  getPreviousIndex(): number {
    return (this.currentReviewIndex - 1 + this.reviews.length) % this.reviews.length;
  }

  // Method to get the next review index with circular logic
  getNextIndex(): number {
    return (this.currentReviewIndex + 1) % this.reviews.length;
  }

  // Navigate to the previous review
  previousReview(): void {
    this.currentReviewIndex = this.getPreviousIndex();
    this.resetTimer();
  }

  // Navigate to the next review
  nextReview(): void {
    this.currentReviewIndex = this.getNextIndex();
    this.resetTimer();
  }

  // Reset the timer when manually changing reviews
  resetTimer(): void {
    this.stopCarouselTimer();
    this.startCarouselTimer();
  }

  // Create an array representing the stars (1 = filled, 0 = empty)
  getStars(rating: number): number[] {
    const stars = [];
    // Add filled stars
    for (let i = 0; i < Math.floor(rating); i++) {
      stars.push(1);
    }
    // Add empty stars
    for (let i = Math.floor(rating); i < 5; i++) {
      stars.push(0);
    }
    return stars;
  }
}