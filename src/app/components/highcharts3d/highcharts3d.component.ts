import { Component, OnInit, Input } from '@angular/core'
import { TitleCasePipe } from '@angular/common'
import { MappingService } from 'src/app/services/mapping.service'
import * as Highcharts from 'highcharts'
import Highcharts3d from 'highcharts/highcharts-3d'
Highcharts3d(Highcharts)
import HighchartsBoost from 'highcharts/modules/boost'
HighchartsBoost(Highcharts)

@Component({
  selector: 'app-highcharts3d',
  templateUrl: './highcharts3d.component.html',
  styleUrls: ['./highcharts3d.component.css'],
  providers: [TitleCasePipe],
})
export class Highcharts3dComponent implements OnInit {
  @Input() csvData: string[][]
  @Input() x: number
  @Input() y: number
  @Input() z: number
  @Input() d: number
  @Input() points: number
  @Input() x_title: string
  @Input() y_title: string
  @Input() z_title: string
  @Input() d_title: string
  @Input() test: string = null
  @Input() points_arr: string[] = []

  highcharts = Highcharts
  chartOptions: Highcharts.Options

  data: any
  tooltip_data: any
  max_x: number
  max_y: number
  max_z: number

  colors: { [key: string]: string } = {
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

  constructor(
    public titlecasePipe: TitleCasePipe,
    private mappingService: MappingService,
  ) {}

  ngOnInit(): void {
    this.prepareData()
    this.setMaxValues()
    this.setChartOptions()
  }

  getColumnIndex(columnName: string): number {
    return this.csvData[0].indexOf(columnName)
  }

  prepareData(): void {
    const objectIdIndex = this.getColumnIndex('OBJECTID')
    const shapeIndex = this.getColumnIndex('SHAPE')
    const bezIndex = this.getColumnIndex('BEZ')
    const strNameIndex = this.getColumnIndex('STRNAM')
    const hnrIndex = this.getColumnIndex('HNR')
    const hnrBisIndex = this.getColumnIndex('HNR_BIS')
    const fundkategorieIndex = this.getColumnIndex('FUNDKATEGORIE')
    const fundeIndex = this.getColumnIndex('FUNDE')
    const datierungIndex = this.getColumnIndex('DATIERUNG')

    // Only for online tests
    if (this.test == null) {
      this.csvData = this.csvData.slice(0, 800)
    }

    let groupedData: { [key: string]: { data: any[]; color: string } } = {}
    this.csvData
      .filter((_, index) => index !== 0) // Ignore the first row
      .filter((row) => {
        // some points has normalized data in it, csv parsing not so good!
        const xIsInt = Number.isInteger(parseFloat(row[this.x]))
        const yIsInt = Number.isInteger(parseFloat(row[this.y]))
        const zIsInt = Number.isInteger(parseFloat(row[this.z]))
        return (xIsInt && yIsInt && zIsInt) || (!xIsInt && !yIsInt && !zIsInt)
      })
      .forEach((row, rowIndex) => {
        let pointValue =
          this.points == -1 ? this.points_arr[rowIndex] : row[this.points]

        const point = {
          x: parseFloat(row[this.x]),
          y: parseFloat(row[this.y]),
          z: parseFloat(row[this.z]),
          marker: {
            symbol: this.getMarkerSymbol(row[this.d]), // set marker shape based on FUNDKATEGORIE
          },
          color: this.colors[pointValue],
          objectid: row[objectIdIndex],
          cluster: pointValue,
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

        const clusterValue = pointValue
        if (!groupedData[clusterValue]) {
          groupedData[clusterValue] = {
            data: [],
            color: this.colors[clusterValue],
          }
        }
        groupedData[clusterValue].data.push(point)
      })

    this.data = Object.keys(groupedData).map((clusterKey) => {
      return {
        name: `Cluster: ${clusterKey}`,
        color: groupedData[clusterKey].color, // Assign the pre-defined color
        data: groupedData[clusterKey].data,
        marker: {
          symbol: 'circle',
          radius: 3,
        },
      }
    })
  }

  setMaxValues(): void {
    if (this.x_title == 'FUNDE') this.max_x = 735
    if (this.x_title == 'DATIERUNG') this.max_x = 33
    if (this.x_title == 'BEZ') this.max_x = 23
    if (this.x_title == 'FUNDKATEGORIE') this.max_x = 5

    if (this.y_title == 'FUNDE') this.max_y = 735
    if (this.y_title == 'DATIERUNG') this.max_y = 33
    if (this.y_title == 'BEZ') this.max_y = 23
    if (this.y_title == 'FUNDKATEGORIE') this.max_y = 5

    if (this.z_title == 'FUNDE') this.max_z = 735
    if (this.z_title == 'DATIERUNG') this.max_z = 33
    if (this.z_title == 'BEZ') this.max_z = 23
    if (this.z_title == 'FUNDKATEGORIE') this.max_z = 5
  }

  getMarkerSymbol(fundkategorie: string): string {
    const markers: { [key in '1' | '2' | '3' | '4' | '5']?: string } = {
      '1': 'circle',
      '2': 'square',
      '3': 'diamond',
      '4': 'triangle', // no x
      '5': 'triangle-down', // no cross
    }
    return markers[fundkategorie as '1' | '2' | '3' | '4' | '5'] || 'circle' // default to circle if not found
  }

  private setChartOptions(): void {
    const self = this
    this.chartOptions = {
      accessibility: {
        enabled: false,
      },
      boost: {
        useGPUTranslations: true,
        usePreallocated: true,
      },
      plotOptions: {
        series: {
          turboThreshold: this.csvData.length, // render more points, default 1000
          shadow: false,
          animation: false,
          states: {
            hover: {
              enabled: false,
            },
          },
        },
      },
      chart: {
        events: {
          render: function () {
            if (self.d_title) {
              const chart: any = this
              // Check if the custom label already exists, if so, destroy it to avoid duplicates
              if (chart.customLegendLabel) {
                chart.customLegendLabel.destroy()
              }
              // Placing the text below the last legend item
              const legend = chart.legend
              const legendBottom =
                legend.group.translateY + legend.lastItemY + legend.itemHeight
              // Add custom label
              chart.customLegendLabel = chart.renderer
                .text(
                  'Fundkategorie symbols: ●, ■, ♦, ▲, ▼',
                  legend.group.translateX,
                  legendBottom + 20,
                )
                .css({ fontSize: '0.8em', color: 'rgb(51, 51, 51)' })
                .add()
            }
          },
        },
        type: 'scatter',
        marginBottom: 100,
        marginRight: 5,
        options3d: {
          enabled: true,
          alpha: 10,
          beta: 30,
          depth: 250,
          viewDistance: 5,
        },
      },
      title: {
        text: '',
      },
      xAxis: {
        title: {
          text: this.x_title,
          margin: 30,
        },
        min: 0,
        max: this.max_x,
      },
      yAxis: {
        title: {
          text: this.y_title,
          margin: 30,
        },
        min: 0,
        max: this.max_y,
      },
      zAxis: {
        reversed: true,
        title: {
          text: this.z_title,
        },
        min: 0,
        max: this.max_z,
      },
      legend: {
        enabled: true,
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'top',
      },
      tooltip: {
        useHTML: true,
        formatter: function () {
          const point: any = this.point
          return `<div style='background-color: white; padding: 5px; color: #212529; font-family: "Exo", sans-serif; font-size: 14px;'>
                  <b>ObjectID: </b>${point.objectid}<br>
                  <b style="color: orange;">X: </b>${point.x}<br>
                  <b style="color: orange;">Y: </b>${point.y}<br>
                  <b style="color: orange;">Z: </b>${point.z}<br>
                  <b style="color: orange;">Cluster: </b>${point.cluster}<br>
                  <b>Shape: </b>${point.shape}<br>
                  <b>District: </b>${point.bez} ${point.bez_names}<br>
                  <b>Street: </b>${point.strName} ${point.hnr} ${
            point.hnrBis
          }<br>
                  <b>Category: </b>${point.fundkategorie} ${
            point.fundkategorie_names
          }<br>
                  <b>Findings: </b>${self.titlecasePipe.transform(
                    point.funde_names,
                  )}<br>
                  <b>Date: </b>${point.datierung} ${point.datierung_names}<br>
                  </div>`
        },
      },
      series: this.data,
    }
  }
}
