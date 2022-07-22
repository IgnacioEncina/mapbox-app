import { Lugar } from './../../interfaces/interfaces';
import { Component, OnInit } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from '../../services/websocket.service';

interface RespMarcadores {
  [ key: string ]: Lugar
}

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {

  // mapa: mapboxgl.Map;
  mapa: any;  // personalmente lo deje en any ya que me daba error y no pude solucionarlo
  
  // lugares: Lugar[] = [  doble comentario en Video 88 min 5:40
  //   // {         // añadido en Video 81 - marcadores
  //   //   id: '1',
  //   //   nombre: 'Fernando',
  //   //   lng: -75.75512993582937,
  //   //   lat: 45.349977429009954,
  //   //   color: '#dd8fee'
  //   // },
  //   // {
  //   //   id: '2',
  //   //   nombre: 'Amy',
  //   //   lng: -75.75195645527508, 
  //   //   lat: 45.351584045823756,
  //   //   color: '#790af0'
  //   // },
  //   // {
  //   //   id: '3',
  //   //   nombre: 'Orlando',
  //   //   lng: -75.75900589557777, 
  //   //   lat: 45.34794635758547,
  //   //   color: '#19884b'
  //   // }
  // ];

  lugares: RespMarcadores = {};

  markersMapbox: { [id:string]: mapboxgl.Marker } = {}   // OJO: Video 90
  
  

  constructor( 
    private http: HttpClient,   // añadido Video 88 min 2:00 aprox. Se recomienda hacer estos llamados en un servicio pero al ser solo un componente en la app lo hacemos directo
    private wsService: WebsocketService
    ) { }


  ngOnInit(): void {

      this.http.get<RespMarcadores>('http://localhost:5000/mapa')     // Video 88 min 3:00
      .subscribe( lugares => {
        this.lugares = lugares;
        this.crearMapa();
      });

      this.escucharSockets();

  }


  escucharSockets() { // Video 86  -  

    // marcador nuevo
    this.wsService.listen( 'marcador-nuevo')
     .subscribe( (marcador: any) =>    // OJO: en Video 89 se crea como de tipo 'Lugar' pero aqui me da error y la unica solucion que encontre fue any
      this.agregarMarcador( marcador )
     )
     
  

    // marcador mover    (Tarea)
    this.wsService.listen( 'marcador-mover' )
    .subscribe( (marcador: any ) => {
      this.moverMarcador( marcador )
    })


    // marcador borrar
    this.wsService.listen( 'marcador-borrar' )
    .subscribe( (id: any ) => {
      this.borrarMarcador( id )
    })


  }


  crearMapa() {    // primer paso instalacion mapa     -    Video 80

      ( mapboxgl as any ).accessToken = 'pk.eyJ1IjoiaWduYWNpb2VuY2luYSIsImEiOiJja2dpeXA3aWEwMXUzMnNqd3NramJtd2plIn0.bgXoDe3O5dWe_p11hVFV3Q';  // correccion min 6:50

      this.mapa = new mapboxgl.Map ({
                      container: 'mapa', // container ID
                      style: 'mapbox://styles/mapbox/streets-v11', // style URL
                      center: [-75.75512993582937 , 45.349977429009954], // starting position [lng, lat]
                      zoom: 15.8, // starting zoom
                  });

      // for ( const marcador of (this.lugares) ) {   // Video 81  // comentariado en Video 88 8:00
      //   this.agregarMarcador( marcador );
      // }

      
      for ( const [id, marcador] of Object.entries(this.lugares) ) {   //  Video 88 8:00 Object.entries regresa un array con las propiedades de lugares
        this.agregarMarcador( marcador );
      }
  }



  agregarMarcador( marcador: Lugar ) {       //  Video 81

      // const html = `<h2>${marcador.nombre}</h2>
      //               <br>
      //               <button>Borrar</button>`;     comentariado en video 83

      // Video 83
      const h2 = document.createElement('h2');
      h2.innerText = marcador.nombre;
      const btnBorrar = document.createElement('button');
      btnBorrar.innerText = 'Borrar';
      const div = document.createElement('div');
      div.append(h2, btnBorrar);
      // fin Video 83

      const customPopup = new mapboxgl.Popup({
        offset: 25,           // para que el nombre este un poco mas arriba del marcador
        closeOnClick: false   // para que no se cierre la hacer click fuera del mapa
      }).setDOMContent( div );

      const marker = new mapboxgl.Marker({    
        draggable: true,         // hace que se pueda mover arrastrando el marcador
        color: marcador.color
      })
      .setLngLat([marcador.lng, marcador.lat])
      .setPopup( customPopup )
      .addTo( this.mapa );


      // lee las coordenadas al mover el marcador  Video 82
      marker.on('drag', () => {     // Video 82 min 4:30 aprox
        const lngLat = marker.getLngLat();

        // TODO: crear evento para emitir las coordenadas de este marcador
        const nuevoMarcador = {  // solucion tarea ( esto fue lo que me falto para lograrlo, crear un nuevo marcador)
          id: marcador.id,
          lng: lngLat.lng,
          lat: lngLat.lat
        }

        this.wsService.emit( 'marcador-mover', nuevoMarcador );

      });

      // video 83
      btnBorrar.addEventListener('click', () => {
        marker.remove();

      // TODO: Eliminar el marcador mediante sockets
      this.wsService.emit( 'marcador-borrar', marcador.id );  // Video 90 4:30
      

      });

      this.markersMapbox[ marcador.id ] = marker;  // agregado Video 90 3:00


  }


  crearMarcador() {       // Video 82

      const customMarker: Lugar = {
        id: new Date().toISOString(),   // crear id segun recomendaciones en video 82 min 2:00
        lng: -75.75512993582937,        // OJO!!  creamos un marcador nuevo pero en estas coordenadas
        lat: 45.349977429009954,
        nombre: 'Sin Nombre',
        color: '#' + Math.floor(Math.random()*16777215).toString(16)    // funcion para color hexadecimal dada por el profe

      }
      
      this.agregarMarcador( customMarker );

      // emitir marcador-nuevo
      this.wsService.emit('marcador-nuevo', customMarker );

  }


  borrarMarcador( id:string ) {        // agregado personalmente en Video 90
    this.markersMapbox[ id ].remove();
    delete this.markersMapbox[id];
  }

  moverMarcador( marcador: Lugar ) {
    
      this.markersMapbox[marcador.id].setLngLat( [marcador.lng, marcador.lat])

  }


}
