/*
  App root component.
  - Boots the application and provides the main application shell.
  Notes: simple signal for app title.
*/
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('swift-bank');
}
