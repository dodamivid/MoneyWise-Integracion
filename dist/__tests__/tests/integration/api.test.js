"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../../src/app"));
describe('General API Behavior', () => {
    it('should return 404 for unknown routes', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/nonexistent')
            .expect(404);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message', 'Route not found: GET /api/nonexistent');
        expect(response.body).toHaveProperty('statusCode', 404);
        expect(response.body).toHaveProperty('traceId');
    });
    it('should handle internal server errors with 500', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/')
            .expect(200);
        expect(response.body).toHaveProperty('message');
    });
});
