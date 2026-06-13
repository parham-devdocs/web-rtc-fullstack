"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chalk_1 = __importDefault(require("chalk"));
const app = (0, express_1.default)();
// Middleware to parse JSON bodies
app.use(express_1.default.json());
// POST route to echo the received message
app.post('/', (req, res) => {
    const message = req.body;
    res.send(message);
});
// Start the Express server
app.listen(5000, () => {
    console.log(chalk_1.default.redBright.bold(`Listening on port ${chalk_1.default.yellow(5000)}`));
});
