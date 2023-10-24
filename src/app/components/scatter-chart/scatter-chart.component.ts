import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core'
import {
  IgxDataChartComponent,
  IgxScatterSeriesComponent,
  IgxNumericXAxisComponent,
  IgxNumericYAxisComponent,
} from 'igniteui-angular-charts'
import { TitleCasePipe } from '@angular/common'
import { MappingService } from 'src/app/services/mapping.service'
import { IgxLegendComponent } from 'igniteui-angular-charts'

@Component({
  selector: 'app-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.css'],
  providers: [TitleCasePipe],
})
export class ScatterChartComponent implements OnInit {
  @Input() csvData: string[][]
  @Input() x: number
  @Input() y: number
  @Input() points: number
  @Input() x_title: string
  @Input() y_title: string
  @Input() points_arr: string[] = []

  @ViewChild('chart', { static: true }) public chart: IgxDataChartComponent
  @ViewChild('tooltipTemplate', { static: true })
  public tooltipTemplate: TemplateRef<any>
  @ViewChild('legend', { static: true }) public legend: IgxLegendComponent

  scatterData: { x: number; y: number; point: string }[] = []

  constructor(
    public titlecasePipe: TitleCasePipe,
    private mappingService: MappingService,
  ) {}

  ngOnInit(): void {
    this.prepareScatterData()
    this.drawScatterChart()
  }

  getColumnIndex(columnName: string): number {
    return this.csvData[0].indexOf(columnName)
  }

  prepareScatterData(): void {
    const objectIdIndex = this.getColumnIndex('OBJECTID')
    const shapeIndex = this.getColumnIndex('SHAPE')
    const bezIndex = this.getColumnIndex('BEZ')
    const strNameIndex = this.getColumnIndex('STRNAM')
    const hnrIndex = this.getColumnIndex('HNR')
    const hnrBisIndex = this.getColumnIndex('HNR_BIS')
    const fundkategorieIndex = this.getColumnIndex('FUNDKATEGORIE')
    const fundeIndex = this.getColumnIndex('FUNDE')
    const datierungIndex = this.getColumnIndex('DATIERUNG')

    this.scatterData = this.csvData
      .filter((_, index) => index !== 0) // Skip the first row
      .filter((row) => {
        // some points has normalized data in it, csv parsing not so good!
        const xIsInt = Number.isInteger(parseFloat(row[this.x]))
        const yIsInt = Number.isInteger(parseFloat(row[this.y]))
        return (xIsInt && yIsInt) || (!xIsInt && !yIsInt)
      })
      .map((row, rowIndex) => {
        let pointValue =
          this.points == -1 ? this.points_arr[rowIndex] : row[this.points]
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
          fundkategorie_names: this.mappingService.mapFundKategorieString(
            row[fundkategorieIndex],
          ),
          funde_names: this.mappingService.mapFundeString(row[fundeIndex]),
          datierung: row[datierungIndex],
          datierung_names: this.mappingService.mapDatierungString(
            row[datierungIndex],
          ),
        }
      })
  }

  drawScatterChart(): void {
    const xAxis = new IgxNumericXAxisComponent()
    xAxis.title = this.x_title

    const yAxis = new IgxNumericYAxisComponent()
    yAxis.title = this.y_title

    const colors: { [key: string]: string } = {
      '-1': '#808080', // Grey
      '0': '#0000FF', // Blue
      '1': '#FF7F00', // Orange
      '2': '#00FF00', // Green
      '3': '#FF0000', // Red
      '4': '#FF00FF', // Magenta
      '5': '#00FFFF', // Cyan
      '6': '#FFFF00', // Yellow
      '7': '#8B4513', // Brown
      '8': '#EE82EE', // Violet
      '9': '#FFC0CB', // Pink
      '10': '#000000', // Black
    }

    this.chart.axes.clear()
    this.chart.series.clear()
    this.chart.axes.add(xAxis)
    this.chart.axes.add(yAxis)

    for (let pointValue of Object.keys(colors)) {
      // Check if there is data for this pointValue before creating a series
      const filteredData = this.scatterData.filter(
        (data) => data.point === pointValue,
      )
      if (filteredData.length > 0) {
        const series = new IgxScatterSeriesComponent()
        series.name = `scatterSeries${pointValue}`
        series.title = `Cluster: ${pointValue}`
        series.xAxis = xAxis
        series.yAxis = yAxis
        series.xMemberPath = 'x'
        series.yMemberPath = 'y'
        series.dataSource = filteredData
        series.markerBrush = colors[pointValue]
        series.markerOutline = colors[pointValue]
        series.tooltipTemplate = this.tooltipTemplate
        this.chart.legend = this.legend
        this.chart.series.add(series)
      }
    }
  }
}
