/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ConversationService } from './conversation.service';

describe('Service: Conversation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConversationService]
    });
  });

  it('should ...', inject([ConversationService], (service: ConversationService) => {
    expect(service).toBeTruthy();
  }));
});
