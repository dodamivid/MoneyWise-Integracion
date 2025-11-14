"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../../src/app"));
describe('Users API Endpoints', () => {
    describe('GET /api/users', () => {
        it('should return list of users with success status', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/users')
                .expect(200);
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
    describe('POST /api/users', () => {
        it('should create a new user and return 201', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'SecurePass123',
                firstName: 'Test',
                lastName: 'User'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/users')
                .send(userData)
                .set('Accept', 'application/json')
                .expect(201);
            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.email).toBe(userData.email);
        });
        it('should return error for invalid user data', async () => {
            const invalidUserData = {
                email: 'invalid-email',
                password: 'short'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/users')
                .send(invalidUserData)
                .expect(400);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('traceId');
        });
    });
    describe('GET /api/users/:id', () => {
        it('should return error for non-existent user ID', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/api/users/${nonExistentId}`)
                .expect(404);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body).toHaveProperty('statusCode', 404);
            expect(response.body).toHaveProperty('traceId');
        });
    });
});
