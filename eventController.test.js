const eventController = require('./eventController');
const Event = require('../models/Event');

// Mock the Event model
jest.mock('../models/Event');

describe('Event Controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create a new event', async () => {
    // Test case for creating an event
  });

  it('should get all events', async () => {
    // Test case for getting all events
  });
  

  // Add more test cases for other controller methods
});