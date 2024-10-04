/**
 * Round To Two
 * @param num number
 * @returns rounded to 2 decimals
 */
export default function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}