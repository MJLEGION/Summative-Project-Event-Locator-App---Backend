const eventController = require('./eventController');
const Event = require('../models/Event');

jest.mock('../models/Event');

describe('Event Controller', () => {
  it('should create a new event', async () => {
    const req = {
      body: { name: 'Test Event', description: 'Test description', date: '2023-12-01' },
      user: { id: 'user-id' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const savedEvent = { _id: 'event-id', ...req.body, creator: req.user.id };
    Event.mockReturnValue({ save: jest.fn().mockResolvedValue(savedEvent) });

    await eventController.createEvent(req, res);

    expect(Event).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.any(String),
      event: savedEvent
    });
  });
});