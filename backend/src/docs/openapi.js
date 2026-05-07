const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'OTA Registry Backend API',
        version: '1.0.0',
        description: 'API documentation for admin authentication and model registry operations.'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local development server'
        }
    ],
    tags: [
        {
            name: 'Health'
        },
        {
            name: 'Auth'
        },
        {
            name: 'Models'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            HealthResponse: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        example: 'ok'
                    }
                }
            },
            HealthDbResponse: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        example: 'ok'
                    },
                    database: {
                        type: 'string',
                        example: 'connected'
                    }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Invalid password'
                    }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                    username: {
                        type: 'string',
                        example: 'testuser'
                    },
                    password: {
                        type: 'string',
                        example: 'password123'
                    }
                }
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    token: {
                        type: 'string',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    }
                }
            },
            ModelRegistry: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        example: 1
                    },
                    version: {
                        type: 'string',
                        example: '1.0.0'
                    },
                    fileName: {
                        type: 'string',
                        example: '1710000000000-model.tflite'
                    },
                    fileUrl: {
                        type: 'string',
                        example: '/uploads/1710000000000-model.tflite'
                    },
                    sha256: {
                        type: 'string',
                        example: 'f6d8d4c8f2f7e6f0e7f7f4f4b6b8c6f6f6a6a9c4f3a2a1e8b5d6c7a8b9c0d1e2'
                    },
                    releaseNote: {
                        type: 'string',
                        nullable: true,
                        example: 'Initial OTA model release'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-05-07T06:08:04.312Z'
                    }
                }
            }
        }
    },
    paths: {
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'Check API process health',
                responses: {
                    200: {
                        description: 'API is running',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/HealthResponse'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/health/db': {
            get: {
                tags: ['Health'],
                summary: 'Check database connectivity',
                responses: {
                    200: {
                        description: 'Database is reachable',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/HealthDbResponse'
                                }
                            }
                        }
                    },
                    500: {
                        description: 'Database is unreachable',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login as admin user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/LoginRequest'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/LoginResponse'
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Missing username or password',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Invalid login credentials',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/models/latest': {
            get: {
                tags: ['Models'],
                summary: 'Get the latest uploaded model',
                responses: {
                    200: {
                        description: 'Latest model record',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ModelRegistry'
                                }
                            }
                        }
                    },
                    404: {
                        description: 'No model exists yet',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/models/upload': {
            post: {
                tags: ['Models'],
                summary: 'Upload a new model as admin',
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['model', 'version'],
                                properties: {
                                    model: {
                                        type: 'string',
                                        format: 'binary'
                                    },
                                    version: {
                                        type: 'string',
                                        example: '1.0.0'
                                    },
                                    releaseNote: {
                                        type: 'string',
                                        example: 'Improved detection accuracy'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Model uploaded successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ModelRegistry'
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Missing required fields',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Missing or invalid JWT token',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                }
                            }
                        }
                    },
                    409: {
                        description: 'Version already exists',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = openApiSpec
