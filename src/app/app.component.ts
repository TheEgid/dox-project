import { Component } from '@angular/core';

export interface Card {
  title: string;
  text: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {
  // title = 'helloapp';
  toggle = true;

  cards: Card[] = [
    {title: 'First title', text: 'First text Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales varius aliquet. Donec iaculis, nunc commodo malesuada ullamcorper, justo lacus eleifend nibh, id maximus neque ligula sed odio.'},
    {title: 'Second title', text: 'Second text Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales varius aliquet. Donec iaculis, nunc commodo malesuada ullamcorper, justo lacus eleifend nibh, id maximus neque ligula sed odio.'},
    {title: 'Third title', text: 'Third text Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales varius aliquet. Donec iaculis, nunc commodo malesuada ullamcorper, justo lacus eleifend nibh, id maximus neque ligula sed odio.'},
  ];

  toggleCards(): boolean{
    return this.toggle = !this.toggle;
  }
}
