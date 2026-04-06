import { unstable_noStore as noStore } from "next/cache";

export function getEnvVariable(name: string) {
  noStore();

  const variable = process.env[name];
  if (!variable) {
    throw new Error("Missing environment variable for " + name);
  }

  return variable;
}

export function getOptionalEnvVariable(name: string) {
  noStore();
  return process.env[name];
}