"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../../src/app"));
const withApiKey = (req) => req.set('x-api-key', process.env.TEST_API_KEY ?? 'test-x-api-key');
describe('General API Behavior', () => {
    it('should return 404 for unknown routes', async () => {
        const response = await withApiKey((0, supertest_1.default)(app_1.default).get('/api/nonexistent')).expect(404);
        expect(response.body).toHaveProperty('ok', false);
        expect(response.body).toHaveProperty('mensaje', 'Route not found: GET /api/nonexistent');
        expect(response.body).toHaveProperty('codigo', 404);
        expect(response.body).toHaveProperty('traceId');
    });
    it('should reject calls without x-api-key header', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/nonexistent')
            .expect(401);
        expect(response.body).toHaveProperty('ok', false);
        expect(response.body).toHaveProperty('mensaje', 'Missing x-api-key header');
        expect(response.body).toHaveProperty('codigo', 401);
        expect(response.body).toHaveProperty('traceId');
    });
    it('should handle internal server errors with 500', async () => {
        const response = await withApiKey((0, supertest_1.default)(app_1.default).get('/api/v1/test/boom')).expect(500);
        expect(response.body).toHaveProperty('ok', false);
        expect(response.body).toHaveProperty('codigo', 500);
        expect(response.body).toHaveProperty('mensaje');
        expect(response.body).toHaveProperty('traceId');
    });
});
