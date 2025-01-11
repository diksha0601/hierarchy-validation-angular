import { TestBed } from '@angular/core/testing';

import { CsvHandlerService } from './csv-handler.service';

describe('CsvHandlerService', () => {
  let service: CsvHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
