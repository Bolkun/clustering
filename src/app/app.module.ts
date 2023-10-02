import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { GridsterModule } from 'angular-gridster2';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MapComponent } from './components/map/map.component';
import { ScatterChartComponent } from './components/scatter-chart/scatter-chart.component';
import { Highcharts3dComponent } from './components/highcharts3d/highcharts3d.component';

import { IgxGeographicMapModule } from "igniteui-angular-maps";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxLegendModule, IgxDataChartCoreModule, IgxDataChartScatterModule, IgxDataChartScatterCoreModule, IgxDataChartInteractivityModule, IgxDataChartAnnotationModule, IgxItemToolTipLayerModule } from 'igniteui-angular-charts';
import { HighchartsChartModule } from 'highcharts-angular';
import { MapEditComponent } from './components/map-edit/map-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MapComponent,
    ScatterChartComponent,
    Highcharts3dComponent,
    MapEditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    GridsterModule,
    HttpClientModule,
    IgxGeographicMapModule,
    IgxDataChartInteractivityModule,
    BrowserAnimationsModule,
    IgxLegendModule,
    IgxDataChartCoreModule,
    IgxDataChartScatterModule,
    IgxDataChartScatterCoreModule,
    IgxDataChartInteractivityModule,
    IgxDataChartAnnotationModule,
    IgxItemToolTipLayerModule,
    HighchartsChartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
