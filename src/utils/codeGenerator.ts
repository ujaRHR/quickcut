import { Counter } from "../models/counter.model.ts";

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const base = 62;
const codeLength = 7;
const totalCodes = base ** codeLength;
const scrambleMultiplier = 1_605_632_347;
const counterName = "sequence_counter";

function encodeBase62(num: number): string {
  if (num === 0) return chars[0];
  let result = "";
  while (num > 0) {
    const remainder = num % base;
    result = chars[remainder] + result;
    num = Math.floor(num / base);
  }
  return result;
}

async function getNextSequence(name: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
  return counter?.seq ?? 1;
}

export async function generateShortCode(): Promise<string> {
  const sequenceValue = await getNextSequence(counterName);
  const scrambledValue = (sequenceValue * scrambleMultiplier) % totalCodes;

  return encodeBase62(scrambledValue).padStart(codeLength, chars[0]);
}
