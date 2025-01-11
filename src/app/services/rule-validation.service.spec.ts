import { TestBed } from '@angular/core/testing';

import { RuleValidationService } from './rule-validation.service';

describe('RuleValidationService', () => {
  let service: RuleValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RuleValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
