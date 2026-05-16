import { productCategories, products } from '../data/dashboardMockData.js'

export async function getProducts() {
  return products
}

export async function getProductCategories() {
  return productCategories
}

export async function createProduct(product) {
  return { id: Date.now(), ...product }
}
