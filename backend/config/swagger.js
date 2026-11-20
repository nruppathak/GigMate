export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'GigMate REST API',
    version: '2.0.0',
    description: 'GigMate: A Web-Based Freelancing Platform for Students to Connect with Clients Through Skill-Based Project Matching (GLA University, Mathura)',
    contact: {
      name: 'GigMate Engineering Team (Nrup Pathak, Nancy Singh, Naman Sharma, Kuldeep Kumar)',
      email: 'nrup.pathak@gla.ac.in'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Check API and Database Health Status',
        responses: {
          200: { description: 'API is healthy' }
        }
      }
    },
    '/api/stats': {
      get: {
        summary: 'Platform overview metrics (students, clients, earnings, gigs)',
        responses: {
          200: { description: 'Stats returned successfully' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Register new student or client user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['student', 'client'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User registered with JWT token' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate user with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Logged in successfully with JWT' }
        }
      }
    },
    '/api/projects': {
      get: {
        summary: 'List and filter client gigs with skill matching',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'studentId', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Array of projects' }
        }
      },
      post: {
        summary: 'Create a new client project',
        security: [{ BearerAuth: [] }],
        responses: {
          201: { description: 'Project created' }
        }
      }
    },
    '/api/applications': {
      post: {
        summary: 'Submit student proposal to project',
        responses: {
          201: { description: 'Application submitted' }
        }
      }
    },
    '/api/messages': {
      get: {
        summary: 'Get conversation message stream',
        parameters: [
          { name: 'userId1', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'userId2', in: 'query', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Message stream' }
        }
      },
      post: {
        summary: 'Send in-app chat message',
        responses: {
          201: { description: 'Message sent' }
        }
      }
    },
    '/api/upload': {
      post: {
        summary: 'Upload PDF resumes, images, or mockups',
        responses: {
          201: { description: 'File uploaded' }
        }
      }
    }
  }
};
