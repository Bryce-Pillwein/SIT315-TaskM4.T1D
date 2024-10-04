"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const athlete_1 = __importDefault(require("./athlete"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const athleteCount = 4; // Number of athletes to simulate
        const athletes = [];
        for (let i = 0; i < athleteCount; i++) {
            const athlete = new athlete_1.default();
            athletes.push(athlete);
            yield athlete.start();
        }
        process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
            for (const athlete of athletes) {
                yield athlete.shutdown();
            }
            process.exit();
        }));
    });
}
main().catch((error) => {
    console.error('Error in main execution:', error);
});
