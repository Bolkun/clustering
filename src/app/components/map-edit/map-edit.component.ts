import { AfterViewInit, Component, ViewChild, TemplateRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IgxGeographicMapComponent, IgxGeographicProportionalSymbolSeriesComponent } from 'igniteui-angular-maps';
import { MarkerType } from 'igniteui-angular-charts';
import { IgxSizeScaleComponent } from 'igniteui-angular-charts';
import { TitleCasePipe } from '@angular/common';
import { MappingService } from 'src/app/services/mapping.service';

@Component({
  selector: 'app-map-edit',
  templateUrl: './map-edit.component.html',
  styleUrls: ['./map-edit.component.css'],
  providers: [TitleCasePipe],
})
export class MapEditComponent implements AfterViewInit, OnChanges {
  @Input() csvData: string[][];
  @ViewChild('map') public map: IgxGeographicMapComponent;
  @ViewChild('tooltipTemplate', { static: true }) tooltipTemplate: TemplateRef<any>;
  clusterColumn: number;
  currentTooltipItem: any = null;

  constructor(public titlecasePipe: TitleCasePipe, private mappingService: MappingService) {
    this.clusterColumn = 9;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['csvData'] && !changes['csvData'].firstChange) {
      this.updateSeriesDataSource();
    }
  }

  public ngAfterViewInit(): void {
    this.map.windowRect = {
      left: 0.5442,
      top: 0.34621,
      width: 0.001,
      height: 0.001,
    }; // Position to Vienna center

    this.updateSeriesDataSource();
  }

  private updateSeriesDataSource() {
    this.map.series.clear();

    const sizeScale = new IgxSizeScaleComponent();
    sizeScale.minimumValue = 3;
    sizeScale.maximumValue = 60;

    const uniqueClusterValues = [...new Set(this.csvData.map((row) => row[this.clusterColumn]))];

    uniqueClusterValues.forEach((clusterValue) => {
      const filteredData = this.csvData.slice(1).filter((row) => row[this.clusterColumn] === clusterValue);
      const processedData = this.processFilteredData(filteredData);

      // Create a new series for each cluster value
      const series = new IgxGeographicProportionalSymbolSeriesComponent();
      series.dataSource = processedData;
      series.latitudeMemberPath = 'latitude';
      series.longitudeMemberPath = 'longitude';
      series.markerType = MarkerType.Circle;
      series.markerBrush = this.getMarkerColor(clusterValue); // Color of the circle
      series.markerOutline = this.getMarkerColor(clusterValue); // important!
      series.radiusScale = sizeScale;
      series.tooltipTemplate = this.tooltipTemplate;

      this.map.series.add(series);
    });
  }

  private processFilteredData(data: string[][]) {
    const objectIdIndex = this.getColumnIndex('OBJECTID');
    const shapeIndex = this.getColumnIndex('SHAPE');
    const bezIndex = this.getColumnIndex('BEZ');
    const strNameIndex = this.getColumnIndex('STRNAM');
    const hnrIndex = this.getColumnIndex('HNR');
    const hnrBisIndex = this.getColumnIndex('HNR_BIS');
    const fundkategorieIndex = this.getColumnIndex('FUNDKATEGORIE');
    const fundeIndex = this.getColumnIndex('FUNDE');
    const datierungIndex = this.getColumnIndex('DATIERUNG');

    return data.map((row) => {
      const shapeString = row[shapeIndex];
      const coords = this.extractCoordinates(shapeString);

      return {
        objectid: row[objectIdIndex],
        latitude: coords.latitude,
        longitude: coords.longitude,
        bez: row[bezIndex],
        bez_names: this.mappingService.mapBezString(row[bezIndex]),
        strName: row[strNameIndex],
        hnr: row[hnrIndex],
        hnrBis: row[hnrBisIndex],
        fundkategorie: row[fundkategorieIndex],
        funde: row[fundeIndex],
        datierung: row[datierungIndex],
        cluster: row[this.clusterColumn],
      };
    });
  }

  // HELPERS
  private extractCoordinates(shapeString: string): { latitude: number; longitude: number } {
    const matches = shapeString.match(/POINT \((\d+\.\d+) (\d+\.\d+)\)/);
    return {
      longitude: parseFloat(matches[1]),
      latitude: parseFloat(matches[2]),
    };
  }

  private getMarkerColor(clusterValue: string): string {
    switch (clusterValue) {
      case '0':
        return 'orange';
      case '1':
        return 'blue';
      case '2':
        return 'green';
      case '3':
        return 'red';
      case '-1':
        return 'grey';
      default:
        return '#212529';
    }
  }

  getColumnIndex(columnName: string): number {
    return this.csvData[0].indexOf(columnName);
  }
}
