const ua = navigator.userAgent;

export const isIE9 = ~ua.indexOf('MSIE 9.0');
export const isEdge = ~ua.indexOf('Edge');
