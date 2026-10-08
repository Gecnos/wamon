/** Adresse à laquelle les professeurs écrivent pour proposer un exercice ou poser une question. */
export const CONTACT_EMAIL = 'vianneyhoueho@gmail.com';

export function mailto(subject = 'Wamon'): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
