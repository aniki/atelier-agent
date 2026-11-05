export interface Item {
  name: string;
  price: number; // prix HT en euros
  quantity: number;
}

/** Total HT du panier. */
export function subtotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Total TTC du panier. `rate` est un taux, par exemple 0.2 pour 20 %. */
export function totalWithTax(items: Item[], rate: number): number {
  // BUG volontaire pour l'atelier : le taux n'est jamais appliqué.
  return subtotal(items);
}
