import { Component } from '@angular/core';
import { WebsocketService } from './services/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mapbox';


  constructor( private wsSocket: WebsocketService){   // Añadido en video 87 min 4:20 para conectarnos al servidor, se recomienda hacerlo aqui aunque dependera de la palicacion

  }

}
