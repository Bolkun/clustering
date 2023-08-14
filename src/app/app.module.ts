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
import { IgxGeographicMapModule } from "igniteui-angular-maps";
import { ScatterChartComponent } from './components/scatter-chart/scatter-chart.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxLegendModule, IgxDataChartCoreModule, IgxDataChartScatterModule, IgxDataChartScatterCoreModule, IgxDataChartInteractivityModule, IgxDataChartAnnotationModule, IgxItemToolTipLayerModule } from 'igniteui-angular-charts';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MapComponent,
    ScatterChartComponent
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
    IgxItemToolTipLayerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
