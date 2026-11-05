import test from "node:test";
import assert from "node:assert/strict";
import { subtotal, totalWithTax } from "../src/cart.ts";

const items = [
  { name: "Stylo", price: 2, quantity: 5 },
  { name: "Cahier", price: 4, quantity: 2 },
];

test("subtotal additionne prix x quantité", () => {
  assert.equal(subtotal(items), 18);
});

test("totalWithTax applique le taux", () => {
  assert.equal(totalWithTax(items, 0.2), 21.6);
});
