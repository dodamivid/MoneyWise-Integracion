"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const port = Number(process.env.PORT ?? 3000);
app_1.default.listen(port, () => {
    console.log(`MoneyWise API running at http://localhost:${port}`);
    console.log(`Health check available at http://localhost:${port}/health`);
    console.log(`Users endpoint available at http://localhost:${port}/api/users`);
    console.log(`Egresos endpoints at http://localhost:${port}/api/v1/egresos`);
});
