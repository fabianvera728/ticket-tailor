/**
 * @fileOverview Lógica local para el procesamiento de tickets sin IA.
 */

/**
 * Extrae variables encerradas en llaves dobles {{VARIABLE}}.
 */
export const extractVariablesLocal = (template: string): string[] => {
  const variableRegex = /{{(.*?)}}/g;
  const matches = [...template.matchAll(variableRegex)];
  // Usamos un Set para evitar duplicados
  return Array.from(new Set(matches.map(match => match[1].trim())));
};

/**
 * Reemplaza las variables en el template con los valores proporcionados.
 */
export const generateTicketLocal = (template: string, values: Record<string, string>): string => {
  let result = template;
  const variables = extractVariablesLocal(template);

  for (const variable of variables) {
    const value = values[variable] || `{{${variable}}}`;
    // Reemplazo global de la variable
    const escapedVar = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`{{${escapedVar}}}`, 'g'), value);
  }

  return result;
};
