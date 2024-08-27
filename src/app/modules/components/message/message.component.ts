import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent implements OnInit {
  @Input() messageError: [{}] = [{}];
  messages: any ;

  ngOnInit() {
    this.messages = this.messageError;
  }
}
