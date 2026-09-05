const PRODUCT_FRAGMENT = `
  id
  handle
  title
  descriptionHtml
  tags
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } }
  options { name values }
  specsMetafield: metafield(namespace: "custom", key: "specs") { value }
  capacidadMetafield: metafield(namespace: "custom", key: "capacidad_kg") { value }
  images(first: 20) { nodes { url altText } }
  variants(first: 10) {
    nodes {
      id
      title
      availableForSale
      price { amount currencyCode }
      selectedOptions { name value }
      image { url altText }
    }
  }
`;

export const PRODUCTS_QUERY = `
  query TiendaProducts($query: String) {
    products(first: 24, query: $query, sortKey: TITLE) {
      nodes { ${PRODUCT_FRAGMENT} }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query TiendaProduct($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FRAGMENT} }
  }
`;

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost { totalAmount { amount currencyCode } }
  lines(first: 50) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          price { amount currencyCode }
          image { url altText }
          product { title handle }
          selectedOptions { name value }
        }
      }
    }
  }
`;

export const CART_QUERY = `
  query TiendaCart($id: ID!) {
    cart(id: $id) { ${CART_FRAGMENT} }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FRAGMENT} }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FRAGMENT} }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FRAGMENT} }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FRAGMENT} }
      userErrors { field message }
    }
  }
`;
