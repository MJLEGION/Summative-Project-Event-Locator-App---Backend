# Event Locator App - Backend Documentation

## Project Overview

### Purpose
The Event Locator App is a multi-user platform designed to help users discover and manage events based on location, preferences, and categories.

### Key Features
- User Authentication
- Event Creation and Management
- Location-Based Event Search
- Multilingual Support
- Notification System

## Technical Stack

### Backend
- **Language**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Internationalization**: i18next

### Additional Technologies
- **Queuing**: BullMQ with Redis
- **Testing**: Jest
- **Logging**: Morgan

## Project Setup

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB
- Redis

### Installation Steps
1. Clone the repository
```bash
git clone <https://github.com/MJLEGION/Summative-Project-Event-Locator-App---Backend.gitl>
cd event-locator-app-backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the development server
```bash
npm run dev
```

## Environment Configuration

### `.env` File
- `PORT`: Server listening port
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation

## API Endpoints

### Authentication
- `POST /api/auth/signup`: User registration
- `POST /api/auth/login`: User login

### Events
- `POST /api/events`: Create an event (Authenticated)
- `GET /api/events`: List all events
- `GET /api/events/search`: Search events by location
- `GET /api/events/filter`: Filter events by category
- `GET /api/events/:id`: Get specific event
- `PUT /api/events/:id`: Update an event (Authenticated)
- `DELETE /api/events/:id`: Delete an event (Authenticated)

## Database Schema

### User Model
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password
- `location`: Geospatial coordinates
- `preferredCategories`: Array of event categories
- `preferredLanguage`: User's preferred language

### Event Model
- `name`: Event name
- `description`: Event details
- `category`: Event category
- `date`: Event date and time
- `location`: Geospatial coordinates
- `creator`: Reference to User who created the event

## Testing

### Running Tests
```bash
npm test
```

### Test Coverage
- Authentication workflows
- Event CRUD operations
- Location-based searches
- Internationalization

## Deployment Considerations
- Use environment-specific configurations
- Implement proper error logging
- Set up monitoring for background jobs
- Secure all endpoints with authentication

## Future Enhancements
- Real-time event updates
- Event ratings and reviews
- Integration with mapping services
- Advanced filtering options

## Troubleshooting
- Ensure MongoDB and Redis are running
- Check network configurations
- Verify `.env` file settings

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request



Video will be linked below 
https://www.loom.com/share/9d6ecd12b14840cca14f529ba670ea4b?sid=f2809a03-3767-4717-977b-f56685e890bb 