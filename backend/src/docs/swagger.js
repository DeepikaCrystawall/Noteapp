import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NoteApp API',
      version: '1.0.0',
      description: 'Real-Time Team Collaboration Notes Platform API',
    },
    servers: [{ url: `http://localhost:${config.port}/api`, description: 'Development' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            avatar_url: { type: 'string', nullable: true },
          },
        },
        Note: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            content: { type: 'string' },
            owner_id: { type: 'string', format: 'uuid' },
            is_archived: { type: 'boolean' },
            is_pinned: { type: 'boolean' },
            is_favorite: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }, { cookieAuth: [] }],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { name: 'John Doe', email: 'john@example.com', password: 'Password123!' },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully' },
            409: { description: 'Email already exists' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { email: 'john@example.com', password: 'Password123!' },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/notes': {
        get: {
          tags: ['Notes'],
          summary: 'List notes with search and filters',
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' } },
            { name: 'archived', in: 'query', schema: { type: 'boolean' } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['latest', 'oldest', 'title', 'updated'] } },
          ],
          responses: { 200: { description: 'Notes list' } },
        },
        post: {
          tags: ['Notes'],
          summary: 'Create a note',
          responses: { 201: { description: 'Note created' } },
        },
      },
      '/teams': {
        get: { tags: ['Teams'], summary: 'List user teams', responses: { 200: { description: 'Teams list' } } },
        post: { tags: ['Teams'], summary: 'Create a team', responses: { 201: { description: 'Team created' } } },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication' },
      { name: 'Notes', description: 'Notes management' },
      { name: 'Teams', description: 'Team management' },
      { name: 'Notifications', description: 'Notifications' },
    ],
    'x-websocket-events': {
      client: ['join:team', 'join:note', 'leave:note', 'note:update', 'typing:start', 'typing:stop', 'cursor:update'],
      server: ['note:create', 'note:update', 'note:delete', 'note:archive', 'note:restore', 'user:joined', 'user:left', 'typing:start', 'typing:stop', 'cursor:update', 'notification:new'],
    },
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
