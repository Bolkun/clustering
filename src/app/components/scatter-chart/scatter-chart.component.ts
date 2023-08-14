import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { IgxDataChartComponent, IgxScatterSeriesComponent, IgxNumericXAxisComponent, IgxNumericYAxisComponent } from 'igniteui-angular-charts';
import { TitleCasePipe } from '@angular/common';
import { MappingService } from 'src/app/services/mapping.service';
import { IgxLegendComponent } from 'igniteui-angular-charts';

@Component({
  selector: 'app-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.css'],
  providers: [TitleCasePipe]
})
export class ScatterChartComponent implements OnInit {
  @Input() csvData: string[][];
  @Input() x: number;
  @Input() y: number;
  @Input() points: number;

  @ViewChild("chart", { static: true }) public chart: IgxDataChartComponent;
  @ViewChild('tooltipTemplate', { static: true }) public tooltipTemplate: TemplateRef<any>;
  @ViewChild("legend", { static: true }) public legend: IgxLegendComponent;


  scatterData: { x: number, y: number, point: string }[] = [];

  constructor(public titlecasePipe: TitleCasePipe, private mappingService: MappingService) {}

  ngOnInit(): void {
    this.prepareScatterData();
    this.drawScatterChart();
  }

  prepareScatterData(): void {
    const objectIdIndex = 0;  // OBJECTID Column
    const shapeIndex = 1;     // SHAPE Column
    const bezIndex = 2;
    const strNameIndex = 4;
    const hnrIndex = 5;
    const hnrBisIndex = 6;
    const fundkategorieIndex = 7;
    const fundeIndex = 9;
    const datierungindex = 10;

    this.scatterData = this.csvData
      .filter((_, index) => index !== 0)  // Skip the first row
      .map(row => {
        return {
          objectid: row[objectIdIndex],
          x: parseFloat(row[this.x]),
          y: parseFloat(row[this.y]),
          point: row[this.points],
          shape: row[shapeIndex],
          bez: row[bezIndex],
          bez_names: this.mappingService.mapBezString(row[bezIndex]),
          strName: row[strNameIndex],
          hnr: row[hnrIndex],
          hnrBis: row[hnrBisIndex],
          fundkategorie: row[fundkategorieIndex],
          funde: row[fundeIndex],
          datierung: row[datierungindex],
        };
      });
  }

  drawScatterChart(): void {
    const xAxis = new IgxNumericXAxisComponent();
    xAxis.title = "Principal Component 1";

    const yAxis = new IgxNumericYAxisComponent();
    yAxis.title = "Principal Component 2";

    const colors: { [key: string]: string } = {
      '-1': '#808080', // Grey
      '0': '#0000FF',  // Blue
      '1': '#FF7F00',  // Orange
      '2': '#00FF00',  // Green
      '3': '#FF0000',  // Red
      '4': '#FF00FF',  // Magenta
      '5': '#00FFFF',  // Cyan
      '6': '#FFFF00',  // Yellow
      '7': '#8B4513',  // Brown (Saddle Brown)
      '8': '#EE82EE',  // Violet (Violet color name)
      '9': '#FFC0CB',  // Pink
      '10': '#000000'  // Black
    };
  
    this.chart.axes.clear();
    this.chart.series.clear();
    this.chart.axes.add(xAxis);
    this.chart.axes.add(yAxis);

    for (let pointValue of Object.keys(colors)) {
      // Check if there is data for this pointValue before creating a series
      const filteredData = this.scatterData.filter(data => data.point === pointValue);
      if (filteredData.length > 0) {
        const series = new IgxScatterSeriesComponent();
        series.name = `scatterSeries${pointValue}`;
        series.title = `Cluster: ${pointValue}`;
        series.xAxis = xAxis;
        series.yAxis = yAxis;
        series.xMemberPath = "x";
        series.yMemberPath = "y";
        series.dataSource = filteredData;
        series.markerBrush = colors[pointValue];
        series.markerOutline = colors[pointValue];
        series.tooltipTemplate = this.tooltipTemplate;
        this.chart.legend = this.legend;
        this.chart.series.add(series);
      }
    }
  }

}
