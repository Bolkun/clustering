import { TestBed } from '@angular/core/testing';

import { ClusteringService } from './clustering.service';

describe('ClusteringService', () => {
  let service: ClusteringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClusteringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
