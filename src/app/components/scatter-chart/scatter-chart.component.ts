import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { IgxDataChartComponent, IgxScatterSeriesComponent, IgxNumericXAxisComponent, IgxNumericYAxisComponent } from 'igniteui-angular-charts';
import { TitleCasePipe } from '@angular/common';
import { MappingService } from 'src/app/services/mapping.service';
import { IgxLegendComponent } from 'igniteui-angular-charts';

interface ColorMapping {
  [key: string]: string;
}

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
  @Input() x_title: string;
  @Input() y_title: string;
  @Input() points_arr: string[] = [];

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
    let datierungIndex = 0;
    if(this.csvData.length == 6690) {
      datierungIndex = 11;
    } else {
      datierungIndex = 10;
    }

    this.scatterData = this.csvData
      .filter((_, index) => index !== 0)  // Skip the first row
      .filter(row => { // some points has normalized data in it, csv parsing not so good!
        const xIsInt = Number.isInteger(parseFloat(row[this.x]));
        const yIsInt = Number.isInteger(parseFloat(row[this.y]));
        return (xIsInt && yIsInt) || (!xIsInt && !yIsInt);
      })
      .map((row, rowIndex) => {
        let pointValue = (this.points == -1) ? this.points_arr[rowIndex] : row[this.points];
        return {
          objectid: row[objectIdIndex],
          x: parseFloat(row[this.x]),
          y: parseFloat(row[this.y]),
          point: pointValue,
          shape: row[shapeIndex],
          bez: row[bezIndex],
          bez_names: this.mappingService.mapBezString(row[bezIndex]),
          strName: row[strNameIndex],
          hnr: row[hnrIndex],
          hnrBis: row[hnrBisIndex],
          fundkategorie: row[fundkategorieIndex],
          fundkategorie_names: this.mappingService.mapFundKategorieString(row[fundkategorieIndex]),
          // funde: row[fundeIndex],
          funde_names: this.mappingService.mapFundeString(row[fundeIndex]),
          datierung: row[datierungIndex],
          datierung_names: this.mappingService.mapDatierungString(row[datierungIndex]),
        };
      });
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  drawScatterChart(): void {
    const xAxis = new IgxNumericXAxisComponent();
    xAxis.title = this.x_title;

    const yAxis = new IgxNumericYAxisComponent();
    yAxis.title = this.y_title;

    const predefinedColors: ColorMapping = {
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

    // Extract all unique pointValues from the scatterData
    const allPointValues = [...new Set(this.scatterData.map(data => data.point))];

    // For each unique pointValue, if it's not in the predefined color dictionary, generate a random color for it
    const colors: ColorMapping = {};
    allPointValues.forEach(pointValue => {
      colors[pointValue] = predefinedColors[pointValue] || this.getRandomColor();
    });

    this.chart.axes.clear();
    this.chart.series.clear();
    this.chart.axes.add(xAxis);
    this.chart.axes.add(yAxis);

    for (let pointValue of allPointValues) {
      // If pointValue exceeds predefined colors, generate a random color
      if (!colors[pointValue]) {
        colors[pointValue] = this.getRandomColor();
      }

      if (pointValue !== 'undefined' && pointValue !== undefined) {
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

}
