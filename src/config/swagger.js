import swaggerJsDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Balaji Tiffin API', version: '1.0.0', description: 'Backend with Orders' },
    servers: [{ url: 'http://localhost:5000' }, { url: 'https://balaji-tiffin-server.onrender.com' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js'],
};

export default swaggerJsDoc(options);
