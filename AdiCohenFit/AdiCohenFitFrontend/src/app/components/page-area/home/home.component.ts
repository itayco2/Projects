import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { WorkshopListComponent } from "../../workshop-area/workshop-list/workshop-list.component";

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule, WorkshopListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
    @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;
    
    isLoggedIn: boolean = !!localStorage.getItem("token");
    
    ngOnInit(): void {
      // Initial checks can remain here
    }
    
    ngAfterViewInit(): void {
      // Get video element from the DOM
      const video = document.querySelector('.background-video') as HTMLVideoElement;
      if (video) {
        // Force mute the video
        video.muted = true;
        
        // Make sure autoplay works
        video.play().catch(error => {
          console.log('Autoplay failed:', error);
        });
        
        // Add event listener to ensure it stays muted
        video.addEventListener('volumechange', () => {
          if (!video.muted) {
            video.muted = true;
          }
        });
      }
    }
    
    public scrollToWorkshops() {
      const element = document.getElementById('workshops');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }