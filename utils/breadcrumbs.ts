// utils/breadcrumbs.ts
import { ParsedUrlQuery } from 'querystring';

export interface MQBreadcrumbItem {
  label: string;
  href: string;
}

// Function to capitalize the first letter of a string and remove # characters
const capitalizeAndClean = (s: string): string => {
  let cleanedString = s.replace(/#/g, '');
  if (!cleanedString) return cleanedString;
  return cleanedString.charAt(0).toUpperCase() + cleanedString.slice(1);
};

export const generateBreadcrumbs = (path: string, query: ParsedUrlQuery): MQBreadcrumbItem[] => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: MQBreadcrumbItem[] = [];

  segments.reduce((acc: string, curr: string) => {
    const href = `${acc}/${curr}`;
    // Ensure label is a string. If it's an array, take the first value
    const label = capitalizeAndClean(
      //@ts-expect-error
      Array.isArray(query[curr]) ? query[curr][0] : query[curr] || curr
    );
    if (label) {
      breadcrumbs.push({ label, href });
    }
    return href;
  }, '');

  // Optionally, prepend a home breadcrumb
  breadcrumbs.unshift({ label: 'Home', href: '/' });

  return breadcrumbs;
};
