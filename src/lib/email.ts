import { Resend } from "resend";

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
}

export const FROM_EMAIL = process.env.FROM_EMAIL ?? "enquiries@munirahmedtuition.com";
export const TUTOR_EMAIL = process.env.TUTOR_EMAIL ?? "";
