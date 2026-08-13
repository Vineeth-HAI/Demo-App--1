export const INDIA_COUNTRY_CODE = "+91";

export type AuthMethod = "email" | "phone";
export type PhoneStep = "request" | "verify";

export function toE164Phone(nationalNumber: string): string {
  return `${INDIA_COUNTRY_CODE}${nationalNumber.trim()}`;
}
