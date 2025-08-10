import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

type FlatConfig = { key: string; value: any };

function coerceValue(raw: any): any {
  if (typeof raw !== "string") return raw;
  const text = raw.trim();
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null") return null;
  if (text !== "" && !Number.isNaN(Number(text))) return Number(text);
  if (
    (text.startsWith("{") && text.endsWith("}")) ||
    (text.startsWith("[") && text.endsWith("]"))
  ) {
    try {
      return JSON.parse(text);
    } catch {}
  }
  return raw;
}

function parseSteps(keyPath: string): Array<string | number> {
  const steps: Array<string | number> = [];
  const parts = keyPath.split(".");
  const re = /(\w+)|(\[(\d+)\])/g; // name or [index]
  for (const part of parts) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(part))) {
      if (match[1]) {
        steps.push(match[1]);
      } else if (match[3]) {
        steps.push(Number(match[3]));
      }
    }
  }
  return steps;
}

function setDeep(target: any, keyPath: string, value: any) {
  const steps = parseSteps(keyPath);
  let cursor = target;
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    const isLast = i === steps.length - 1;
    const nextStep = steps[i + 1];

    if (isLast) {
      (cursor as any)[step as any] = value;
      return;
    }

    const shouldBeArray = typeof nextStep === "number";
    const existing = (cursor as any)[step as any];

    if (shouldBeArray) {
      if (!Array.isArray(existing)) {
        (cursor as any)[step as any] = [];
      }
    } else {
      if (typeof existing !== "object" || existing === null || Array.isArray(existing)) {
        (cursor as any)[step as any] = {};
      }
    }
    cursor = (cursor as any)[step as any];
  }
}

async function loadFlatConfigs(): Promise<FlatConfig[]> {
  try {
    const rows = await prisma.config.findMany({ select: { key: true, value: true } });
    if (rows && rows.length > 0) return rows as FlatConfig[];
  } catch {
    // ignore and try file fallback
  }

  // fallback: read prisma/config.json
  try {
    const filePath = path.join(process.cwd(), "prisma", "config.json");
    const content = await readFile(filePath, "utf-8");
    const json = JSON.parse(content) as FlatConfig[];
    return json;
  } catch {
    return [];
  }
}

export async function GET(_request: Request) {
  const rows = await loadFlatConfigs();
  const merged: Record<string, any> = {};
  for (const { key, value } of rows) {
    const v = coerceValue(value);
    setDeep(merged, key, v);
  }
  return NextResponse.json({ data: merged });
}


