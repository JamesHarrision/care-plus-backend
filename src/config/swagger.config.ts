import swaggerUI from 'swagger-ui-express';
import type { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
const port = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Care Plus Backend API',
      version: '1.0.0',
      description: 'API documentation for Care Plus Backend',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          required: ['status', 'message'],
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
            },
          },
        },
        MessageResponse: {
          type: 'object',
          required: ['status', 'data'],
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'object',
              required: ['message'],
              properties: {
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
        TokenPair: {
          type: 'object',
          required: ['accessToken', 'refreshToken'],
          properties: {
            accessToken: {
              type: 'string',
            },
            refreshToken: {
              type: 'string',
            },
          },
        },
        AuthUserSummary: {
          type: 'object',
          required: ['id', 'full_name', 'system_role'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            full_name: {
              type: 'string',
            },
            system_role: {
              type: 'string',
              enum: ['ADMIN', 'USER'],
            },
          },
        },
        AuthenticatedUserProfile: {
          type: 'object',
          required: ['id', 'role', 'full_name', 'system_role', 'is_active', 'created_at', 'updated_at'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'USER'],
            },
            full_name: {
              type: 'string',
            },
            phone: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
              nullable: true,
            },
            system_role: {
              type: 'string',
              enum: ['ADMIN', 'USER'],
            },
            is_active: {
              type: 'boolean',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Family: {
          type: 'object',
          required: ['id', 'name', 'created_at', 'updated_at'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            address: {
              type: 'string',
              nullable: true,
            },
            invite_code: {
              type: 'string',
              nullable: true,
              maxLength: 6,
            },
            invite_code_exp: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        PendingFamilyMember: {
          type: 'object',
          required: ['id', 'join_status'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            full_name: {
              type: 'string',
              nullable: true,
            },
            email: {
              type: 'string',
              format: 'email',
              nullable: true,
            },
            phone: {
              type: 'string',
              nullable: true,
            },
            join_status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
            },
          },
        },
        InviteCodeResponse: {
          type: 'object',
          required: ['inviteCode', 'expiresIn'],
          properties: {
            inviteCode: {
              type: 'string',
            },
            expiresIn: {
              type: 'integer',
              format: 'int32',
            },
          },
        },
        ResetPasswordResponse: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['src/**/*.ts', 'dist/**/*.js'],
};
const swaggerSpecs = swaggerJSDoc(options);

function startSwagger(app: Express) {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
}

export default startSwagger;
