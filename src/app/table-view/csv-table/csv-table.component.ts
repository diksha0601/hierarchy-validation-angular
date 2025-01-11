import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-csv-table',
  templateUrl: './csv-table.component.html',
  styleUrls: ['./csv-table.component.scss']
})
export class CsvTableComponent {
  @Input() headers: string[] = [];
  @Input() data: any[] = [];
}
