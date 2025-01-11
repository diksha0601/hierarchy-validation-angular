import { Injectable } from '@angular/core';
import { RuleValidationService } from './rule-validation.service';

@Injectable({
  providedIn: 'root',
})
export class CsvHandlerService {

  constructor(
    private ruleValidationService: RuleValidationService,
  ) {}

  validateFile(file: File): { isValid: boolean; errorMessage: string } {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return { isValid: false, errorMessage: 'Please upload a valid CSV file' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, errorMessage: 'File size should not exceed 5MB' };
    }

    return { isValid: true, errorMessage: '' };
  }

  previewCSV(file: File): Promise<{ headers: string[]; data: any[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n');


          // Extract headers
          const headers: string[] = ['SNo'];

          headers.push(...lines[0].split(',').map((header: string) => header.trim()));

          headers.push('Validation');

          // Extract data
          const data = lines.slice(1)
            .filter((line: string) => line.trim())
            .map((line: string) => {
              const values = line.split(',');
              const row: any = {};
              headers.forEach((header: string | number, index: any) => {
                row[header] = values[index - 1]?.trim() || '';
              });

              row['Validation'] = '';

              return row;
            });

            const transformedData = this.ruleValidationService.transformExcelData(data);
            const logicResult: string[] = this.ruleValidationService.runLogic(transformedData);

            const logicResultLength = logicResult.length;
            for(let i = 0; i < data.length; i++) {
              data[i]['SNo'] = i + 1;
              data[i]['Validation'] = i < logicResultLength ?  logicResult[i] : 'Error Occured';
            }

            console.log(headers, data);

          resolve({ headers, data });
        } catch (error) {
          reject('Error parsing the CSV file.');
        }
      };

      reader.onerror = () => {
        reject('Error reading the file.');
      };

      reader.readAsText(file);
    });
  }
}
