  // ...existing code...
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pcr-reader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pcr-reader.html',
  styleUrl: './pcr-reader.scss'
})
export class PcrReaderComponent {
  selectedDataSource: string = 'nifty50';
  private dataSourceUrls: { [key: string]: string } = {
    nifty50: 'https://docs.google.com/spreadsheets/d/1tOakXg31gqP05xD9k4ePaIMdUhWN74KhnwxqvdzfLr8/export?format=csv',
    crudeoil: 'https://docs.google.com/spreadsheets/d/1yp_6gyY69xqYO-bCZozUOw7pPGoB-vbfB2lxLJ5T-wQ/export?format=csv',
    banknifty: 'https://docs.google.com/spreadsheets/d/1vnU8YIWfwFmuSQza2ftHCbsEFXPpeOseFjCIDt8GAxA/export?format=csv', 
    sensex: 'https://docs.google.com/spreadsheets/d/132J1JY55pwteQL2ednuUdcr0zhWgbKwEjJeYSaDPOZ0/export?format=csv' 
  };

  csvData: any[] = [];
  error: string = '';

  constructor() {
    this.fetchData();
  }

  onDataSourceChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedDataSource = target.value;
    this.fetchData();
  }

  async fetchData() {
    const url = this.dataSourceUrls[this.selectedDataSource];
    if (!url) {
      this.error = `Data source for ${this.selectedDataSource} is not configured.`;
      this.csvData = [];
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network error');
      const csvText = await response.text();
      const Papa = await import('papaparse');
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result: any) => {
          this.csvData = result.data;
          this.error = '';
          this.processMajorResistance();
        },
        error: (err: any) => {
          this.error = 'Error parsing CSV from URL.';
        }
      });
    } catch {
      this.error = 'Failed to fetch CSV from URL.';
    }
  }
  majorResistance: { strike: string, oiCe: number }[] = [];
  majorSupport: { strike: string, oiPe: number }[] = [];
  pcrValue: number | null = null;
  pcrChngOiValue: number | null = null;
  totalOiPe: number = 0;
  totalOiCe: number = 0;
  oiCePercent: number = 0;
  oiPePercent: number = 0;
  totalChngOiCe: number = 0;
  totalChngOiPe: number = 0;
  chngOiCePercent: number = 0;
  chngOiPePercent: number = 0;
  totalChngCe: number = 0;
  totalChngPe: number = 0;
  middleRowIndex: number = 0;

  getKeys(row: any): string[] {
    return Object.keys(row);
  }

  // ...existing code...

  processMajorResistance() {
    if (!this.csvData.length) {
      this.majorResistance = [];
      this.majorSupport = [];
      return;
    }
    this.middleRowIndex = Math.floor(this.csvData.length / 2);
    // Extract OI CE, OI PE and Strike columns, filter out invalid rows
    const resistanceList = this.csvData
      .map((row: any) => {
        const strike = row['Strike'];
        let oiCeRaw = row['OI CE'];
        let oiPeRaw = row['OI PE'];
        if (typeof oiCeRaw === 'string') {
          oiCeRaw = oiCeRaw.replace(/,/g, '').trim();
        }
        if (typeof oiPeRaw === 'string') {
          oiPeRaw = oiPeRaw.replace(/,/g, '').trim();
        }
        const oiCe = Number(oiCeRaw);
        const oiPe = Number(oiPeRaw);
        return { strike, oiCe, oiPe };
      })
      .filter((item: any) => item.strike !== undefined && !isNaN(item.oiCe) && !isNaN(item.oiPe));

    // Calculate PCR value
  this.totalOiPe = resistanceList.reduce((sum: number, item: any) => sum + item.oiPe, 0);
  this.totalOiCe = resistanceList.reduce((sum: number, item: any) => sum + item.oiCe, 0);
  const totalOi = this.totalOiCe + this.totalOiPe;
  this.oiCePercent = totalOi > 0 ? +(this.totalOiCe / totalOi * 100).toFixed(2) : 0;
  this.oiPePercent = totalOi > 0 ? +(this.totalOiPe / totalOi * 100).toFixed(2) : 0;
    // Calculate sum of Chng in OI CE and Chng in OI PE
    this.totalChngOiCe = this.csvData.reduce((sum: number, row: any) => {
      let val = row['Chng in OI CE'];
      if (typeof val === 'string') val = val.replace(/,/g, '').trim();
      return sum + (isNaN(Number(val)) ? 0 : Number(val));
    }, 0);
    this.totalChngOiPe = this.csvData.reduce((sum: number, row: any) => {
      let val = row['Chng in OI PE'];
      if (typeof val === 'string') val = val.replace(/,/g, '').trim();
      return sum + (isNaN(Number(val)) ? 0 : Number(val));
    }, 0);
    const totalChng = this.totalChngOiCe + this.totalChngOiPe;
    this.chngOiCePercent = totalChng > 0 ? +(this.totalChngOiCe / totalChng * 100).toFixed(2) : 0;
    this.chngOiPePercent = totalChng > 0 ? +(this.totalChngOiPe / totalChng * 100).toFixed(2) : 0;
    this.pcrValue = this.totalOiCe > 0 ? +(this.totalOiPe / this.totalOiCe).toFixed(2) : null;
    this.pcrChngOiValue = this.totalChngOiCe > 0 ? +(this.totalChngOiPe / this.totalChngOiCe).toFixed(2) : null;

    // Calculate sum of Chng CE and Chng PE
    this.totalChngCe = +(this.csvData.reduce((sum: number, row: any) => {
      let val = row['Chng CE'];
      if (typeof val === 'string') val = val.replace(/,/g, '').trim();
      return sum + (isNaN(Number(val)) ? 0 : Number(val));
    }, 0)).toFixed(2);
    this.totalChngPe = +(this.csvData.reduce((sum: number, row: any) => {
      let val = row['Chng PE'];
      if (typeof val === 'string') val = val.replace(/,/g, '').trim();
      return sum + (isNaN(Number(val)) ? 0 : Number(val));
    }, 0)).toFixed(2);

    // Sort by OI CE descending for resistance
    const resistanceSorted = [...resistanceList].sort((a: any, b: any) => b.oiCe - a.oiCe);
    this.majorResistance = resistanceSorted.map(({ strike, oiCe }) => ({ strike, oiCe }));

    // Sort by OI PE descending for support
    const supportSorted = [...resistanceList].sort((a: any, b: any) => b.oiPe - a.oiPe);
    this.majorSupport = supportSorted.map(({ strike, oiPe }) => ({ strike, oiPe }));
  }

}
