/*
  Copyright 2018 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { loadModules } from 'esri-loader';
import esri = __esri;

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})

export class EsriMapComponent implements OnInit {

  // Private vars with default values
  private _zoom = 10;
  private _center = [0.1278, 51.5074];
  private _basemap = 'streets';

  @Input()
  set zoom(zoom: number) {
    this._zoom = zoom;
  }

  get zoom(): number {
    return this._zoom;
  }

  @Input()
  set center(center: any[]) {
    this._center = center;
  }

  get center(): any[] {
    return this._center;
  }

  @Input()
  set basemap(basemap: string) {
    this._basemap = basemap;
  }

  get basemap(): string {
    return this._basemap;
  }

  @Output() mapLoaded = new EventEmitter<boolean>();

  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  constructor() { }

  public ngOnInit() {
    let map = new Map<string, string>();
    loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/geometry/Point',
      'esri/Graphic',
      'esri/geometry/Polyline',
      'esri/layers/FeatureLayer',
      'esri/symbols/SimpleLineSymbol',
    ])
      .then(([EsriMap, EsriMapView, EsriPoint, EsriGraphic, EsriPolyline, EsriFeatureLayer, ErsiSimpleLineSymbol]) => {

        // Set type for Map constructor properties
        const mapProperties: esri.MapProperties = {
          basemap: this._basemap
        };

        let map: esri.Map = new EsriMap(mapProperties);
        // Set type for MapView constructor properties
        const mapViewProperties: esri.MapViewProperties = {
          container: this.mapViewEl.nativeElement,
          center: this._center,
          zoom: this._zoom,
          map: map
        };

        let mapView: esri.MapView = new EsriMapView(mapViewProperties);
        var longitude: number[] = [-122.4194, -122.4214];
        var latitude: number[] = [37.7749, 37.7959];
        var point: esri.Point[] = [];
        for (var i = 0; i < longitude.length; i++) {
          var p: esri.Point = new EsriPoint({
            longitude: longitude[i],
            latitude: latitude[i],
            spatialReference: { wkid: 4326 }
          });
          point[i] = p;
          var g = new EsriGraphic({
            geometry: p,
            symbol: {
              type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
              style: "square",
              color: "blue",
              size: "6px", // pixels
              outline: { // autocasts as new SimpleLineSymbol()
                color: [255, 255, 0],
                width: 6 // points
              }
            }
          });
          mapView.graphics.add(g);
        }
        var line: esri.Polyline = new EsriPolyline(mapView.spatialReference);
        line.addPath([point[0], point[1]]);
        var lineSymbol:esri.SimpleLineSymbol = new ErsiSimpleLineSymbol();
        lineSymbol.width = 3;
        lineSymbol.style = "short-dot";
        lineSymbol.color.setColor("yellow");
        mapView.graphics.add(new EsriGraphic(line, lineSymbol));

        mapView.when(() => {
          // All the resources in the MapView and the map have loaded. Now execute additional processes
          this.mapLoaded.emit(true);
        }, err => {
          console.error(err);
        });
      })
      .catch(err => {
        console.error(err);
      });
  } // ngOnInit
}
