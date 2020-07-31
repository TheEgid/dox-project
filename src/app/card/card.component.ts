import {Component, Input, OnInit} from '@angular/core';
import {Card} from '../app.component';


@Component({
  selector: 'app-card',
  templateUrl: 'card.component.html',
  styleUrls: ['card.component.scss']
})

export class CardComponent implements OnInit {

  @Input() card: Card;
  @Input() index: number;

  title = 'My Card Title';
  text = 'My Sample Text';
  name: string;
  textColor: string;

  cardDate: Date = new Date();

  ngOnInit(): void {}

  // inputHandler(value): any {
  //   this.title = value;
  // }

  getInfo(): number {
    return 777777;
  }

  changeTitle(): string {
    return this.card.title = 'change!!';
  }
}


