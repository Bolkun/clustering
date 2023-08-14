import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MappingService {

  private FUNDKATEGORIE_MAPPING = {
    '1': 'Einzel-, Streufund',
    '2': 'Siedlungsbefund',
    '3': 'Grabbefund',
    '4': 'Negativbefund',
    '5': 'Fossilfund'
  };

  private BEZ_MAPPING: { [key: string]: string } = {
    '1': 'Innere Stadt',
    '2': 'Leopoldstadt',
    '3': 'Landstraße',
    '4': 'Wieden',
    '5': 'Margareten',
    '6': 'Mariahilf',
    '7': 'Neubau',
    '8': 'Josefstadt',
    '9': 'Alsergrund',
    '10': 'Favoriten',
    '11': 'Simmering',
    '12': 'Meidling',
    '13': 'Hietzing',
    '14': 'Penzing',
    '15': 'Rudolfsheim-Fünfhaus',
    '16': 'Ottakring',
    '17': 'Hernals',
    '18': 'Währing',
    '19': 'Döbling',
    '20': 'Brigittenau',
    '21': 'Floridsdorf',
    '22': 'Donaustadt',
    '23': 'Liesing'
  };

  private DATIERUNG_MAPPING = {
    '1': 'Bronzezeit/Mittelalter/Neuzeit',
    '2': 'Eiszeit/Mittelalter',
    '3': 'Frühmittelalter',
    '4': 'Frühmittelalter/Neuzeit/Römerzeit',
    '5': 'Frühmittelalter/Römerzeit',
    '6': 'Frühmittelalter/Spätbronzezeit/Späteisenzeit',
    '7': 'Jungpaläolithikum/Urgeschichte',
    '8': 'Latènezeit',
    '9': 'Mittelalter',
    '10': 'Mittelalter/Neolithikum/Späteisenzeit',
    '11': 'Mittelalter/Neuzeit',
    '12': 'Mittelalter/Neuzeit/Römerzeit',
    '13': 'Mittelalter/Neuzeit/Römerzeit/Urgeschichte',
    '14': 'Mittelalter/Neuzeit/Urgeschichte',
    '15': 'Mittelalter/Römerzeit',
    '16': 'Mittelalter/Römerzeit/Urgeschichte',
    '17': 'Mittelalter/Urgeschichte',
    '18': 'Mittelneolithikum/Urgeschichte',
    '19': 'Neolithikum',
    '20': 'Neolithikum/Urgeschichte',
    '21': 'Neuzeit',
    '22': 'Neuzeit/Römerzeit',
    '23': 'Neuzeit/Römerzeit/Urgeschichte',
    '24': 'Neuzeit/Spätmittelalter/Urgeschichte',
    '25': 'Neuzeit/Urgeschichte',
    '26': 'Paläolithikum/Urgeschichte',
    '27': 'Römerzeit',
    '28': 'Römerzeit/Urgeschichte',
    '29': 'Spätbronzezeit',
    '30': 'Spätlatènezeit',
    '31': 'Spätneolithikum',
    '32': 'Urgeschichte',
    '33': 'unbekannt'
  };

  mapFundKategorie(data: string[][]): string[][] {
    return this.mapColumnValues(data, 'FUNDKATEGORIE', this.FUNDKATEGORIE_MAPPING);
  }

  mapBez(data: string[][]): string[][] {
    return this.mapColumnValues(data, 'BEZ', this.BEZ_MAPPING);
  }

  mapBezString(value: string): string {
    return this.BEZ_MAPPING[value] || value;
  }

  mapDatierung(data: string[][]): string[][] {
    return this.mapColumnValues(data, 'DATIERUNG', this.DATIERUNG_MAPPING);
  }

  mapColumnValues(data: string[][], columnName: string, valueMapping: {[key: string]: string}): string[][] {
    const columnIndex = data[0].indexOf(columnName);

    if (columnIndex === -1) {
        return data;
    }

    return data.map(row => {
        row[columnIndex] = valueMapping[row[columnIndex]] || row[columnIndex];
        return row;
    });
  }

}
