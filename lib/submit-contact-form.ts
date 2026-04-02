export type ContactFormPayload = {
  name: string;
  phone: string;
  comment?: string;
};

/** Заглушка: сюда позже подключить API / почту / CRM */
export async function submitContactForm(
  data: ContactFormPayload
): Promise<{ ok: boolean; error?: string }> {
  await new Promise((r) => setTimeout(r, 400));
  console.info('[submitContactForm]', data);
  return { ok: true };
}
