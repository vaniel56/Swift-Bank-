/*
  Layout component: application shell with navigation menu and router outlet.
  - Tracks `activeService` and updates it from Router NavigationEnd events so
    the sidebar highlight matches the current route.
*/
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterOutlet, NgClass],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class Layout implements OnInit, OnDestroy {
  activeService = 'home';
  private sub: Subscription | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.setActiveFromUrl(this.router.url);
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => this.setActiveFromUrl(e.urlAfterRedirects || e.url));
  }

  private setActiveFromUrl(url: string) {
    if (!url) {
      this.activeService = 'home';
      return;
    }
    const parts = url.split('/').filter(Boolean);
    if (parts.length === 0) {
      this.activeService = 'home';
      return;
    }
    // last segment should be the child route (home, transfer, paybills, etc.)
    this.activeService = parts[parts.length - 1];
  }


  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}





