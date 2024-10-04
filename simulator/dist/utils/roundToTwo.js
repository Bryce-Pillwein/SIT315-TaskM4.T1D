"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = roundToTwo;
/**
 * Round To Two
 * @param num number
 * @returns rounded to 2 decimals
 */
function roundToTwo(num) {
    return Math.round(num * 100) / 100;
}
