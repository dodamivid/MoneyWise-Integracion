"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
(0, globals_1.beforeAll)(() => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001';
});
(0, globals_1.afterAll)(() => {
});
