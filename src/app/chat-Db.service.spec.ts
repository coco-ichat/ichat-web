/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChatDbService } from './chat-Db.service';

describe('Service: ChatDb', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatDbService]
    });
  });

  it('should ...', inject([ChatDbService], (service: ChatDbService) => {
    expect(service).toBeTruthy();
  }));
});
