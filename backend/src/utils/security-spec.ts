export const OPERATION_SECURITY_SPEC = [
    {
      jwt: [], // Security specification for JWT authorization
    },
  ];
  
  export const SECURITY_SCHEME_SPEC = {
    components: {
      securitySchemes: {
        jwt: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  };
  