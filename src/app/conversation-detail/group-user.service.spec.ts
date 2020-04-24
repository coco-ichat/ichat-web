/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GroupUserService } from './group-user.service';

describe('Service: GroupUser', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupUserService]
    });
  });

  it('should ...', inject([GroupUserService], (service: GroupUserService) => {
    expect(service).toBeTruthy();
  }));
});
