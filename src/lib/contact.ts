/**
 * Contact des professeurs. Le formulaire de contribution a été retiré : on
 * passe par un simple e-mail, qui marche aussi sur téléphone et sans compte
 * GitHub.
 */
export const CONTACT_EMAIL = 'vianneyhoueho@gmail.com';

/** Lien `mailto:` avec un objet prérempli, pour que l'équipe retrouve vite le sujet. */
export function mailto(subject = 'Wamon'): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
