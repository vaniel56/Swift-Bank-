import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  activeService = 'home';

  selectService(service: string) {
    this.activeService = service;
  }
}





