const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = ['./index.js']; 


const swaggerOptions = {
  info: {
    title: 'Event API',
    version: '1.0.0',
    description: 'API documentation for EventApp',
  },
};

swaggerAutogen(outputFile, endpointsFiles, swaggerOptions);