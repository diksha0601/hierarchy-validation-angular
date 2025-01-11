import { Component } from '@angular/core';
import { CsvHandlerService } from './services/csv-handler.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isDragOver = false;
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';
  csvData: any[] = [];
  csvHeaders: string[] = [];
  files:any;
  constructor(private csvHandlerService: CsvHandlerService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    this.files = event.dataTransfer?.files;
    if (this.files && this.files.length > 0) {
      this.handleFile(this.files[0]);
    }
  }

  onFileSelected(event: any): void {
    this.files = event.target.files[0];
    if (this.files) {
      this.handleFile(this.files);
    }
  }

  handleFile(file: File): void {
    const { isValid, errorMessage } = this.csvHandlerService.validateFile(file);

    if (!isValid) {
      this.errorMessage = errorMessage;
      return;
    }
    this.errorMessage = '';
    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    this.uploadProgress = 0;
  }

  resetAll(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    this.uploadProgress = 0;
    this.csvData = [];
    this.csvHeaders = [];
    this.isUploading = false;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    const interval = setInterval(() => {
      this.uploadProgress += 10;

      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;
        this.processUploadedFile(this.selectedFile!);
        this.previewFile()
      }
    }, 200);
  }

  processUploadedFile(file: File): void {
    this.errorMessage = ''; // Display success message or handle further actions
  }

  previewFile(): void {
    this.csvHandlerService.previewCSV(this.files).then(
      (result) => {
        this.csvHeaders = result.headers;
        this.csvData = result.data;
        console.log('CSV Data: ', result);
      },
      (error) => {
        this.errorMessage = error;
      }
    );
  }
}
