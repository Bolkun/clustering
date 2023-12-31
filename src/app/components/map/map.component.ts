import {
  AfterViewInit,
  Component,
  ViewChild,
  TemplateRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import {
  IgxGeographicMapComponent,
  IgxGeographicProportionalSymbolSeriesComponent,
} from 'igniteui-angular-maps'
import { MarkerType } from 'igniteui-angular-charts'
import { IgxSizeScaleComponent } from 'igniteui-angular-charts'
import { TitleCasePipe } from '@angular/common'
import { MappingService } from 'src/app/services/mapping.service'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [TitleCasePipe],
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() csvData: string[][]
  @ViewChild('map') public map: IgxGeographicMapComponent
  @ViewChild('tooltipTemplate', { static: true }) tooltipTemplate: TemplateRef<
    any
  >

  public currentTooltipItem: any = null

  constructor(
    public titlecasePipe: TitleCasePipe,
    private mappingService: MappingService,
  ) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['csvData'] && !changes['csvData'].firstChange) {
      this.updateSeriesDataSource()
    }
  }

  private updateSeriesDataSource() {
    const newDataSource = this.processCsvData()
    this.map.series.item(0).dataSource = newDataSource
  }

  public ngAfterViewInit(): void {
    this.map.windowRect = {
      left: 0.5442,
      top: 0.34621,
      width: 0.001,
      height: 0.001,
    } // Position to Vienna center

    const mapData = this.processCsvData()

    const sizeScale = new IgxSizeScaleComponent()
    sizeScale.minimumValue = 3
    sizeScale.maximumValue = 60

    const series = new IgxGeographicProportionalSymbolSeriesComponent()
    series.dataSource = mapData
    series.latitudeMemberPath = 'latitude'
    series.longitudeMemberPath = 'longitude'
    series.markerType = MarkerType.Circle
    series.markerBrush = '#212529' // Color of the circle
    series.markerOutline = '#212529' // Color of the circle outline
    series.radiusScale = sizeScale
    series.tooltipTemplate = this.tooltipTemplate

    this.map.series.add(series)
  }

  getColumnIndex(columnName: string): number {
    return this.csvData[0].indexOf(columnName)
  }

  private processCsvData() {
    const objectIdIndex = this.getColumnIndex('OBJECTID')
    const shapeIndex = this.getColumnIndex('SHAPE')
    const bezIndex = this.getColumnIndex('BEZ')
    const strNameIndex = this.getColumnIndex('STRNAM')
    const hnrIndex = this.getColumnIndex('HNR')
    const hnrBisIndex = this.getColumnIndex('HNR_BIS')
    const fundkategorieIndex = this.getColumnIndex('FUNDKATEGORIE')
    const fundeIndex = this.getColumnIndex('FUNDE')
    const datierungIndex = this.getColumnIndex('DATIERUNG')

    return this.csvData
      .filter((_, index) => index !== 0)
      .map((row) => {
        const shapeString = row[shapeIndex]
        const coords = this.extractCoordinates(shapeString)

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
        }
      })
  }

  private extractCoordinates(
    shapeString: string,
  ): { latitude: number; longitude: number } {
    const matches = shapeString.match(/POINT \((\d+\.\d+) (\d+\.\d+)\)/)
    return {
      longitude: parseFloat(matches[1]),
      latitude: parseFloat(matches[2]),
    }
  }
}
