import swaggerUI from 'swagger-ui-express';
import type { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerSchemas } from './swagger.schema';
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
      schemas: swaggerSchemas,
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
