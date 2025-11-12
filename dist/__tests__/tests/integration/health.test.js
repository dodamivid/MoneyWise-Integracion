"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../../src/app"));
describe('Health Check API', () => {
    describe('GET /health', () => {
        it('should return health status with 200', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/health')
                .expect(200);
            expect(response.body).toHaveProperty('status', 'ok');
        });
    });
    describe('GET /', () => {
        it('should return MoneyWise API message', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/')
                .expect(200);
            expect(response.body).toEqual({ message: "MoneyWise API" });
        });
    });
});
