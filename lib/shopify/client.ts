const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = "2024-10";

type ShopifyFetchOptions = {
  cache?: RequestCache;
  revalidate?: number;
};

/** Llama a la Storefront API de Shopify (headless) para /tienda. */
export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: ShopifyFetchOptions = {},
): Promise<T> {
  if (!DOMAIN || !TOKEN) {
    throw new Error(
      "Falta configurar SHOPIFY_STORE_DOMAIN y SHOPIFY_STOREFRONT_ACCESS_TOKEN en las variables de entorno.",
    );
  }

  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: options.cache,
    next: options.cache ? undefined : { revalidate: options.revalidate ?? 60 },
  });

  const json = await res.json();
  if (json.errors) {
    const message = Array.isArray(json.errors)
      ? json.errors.map((e: { message: string }) => e.message).join("; ")
      : String(json.errors);
    throw new Error(message);
  }
  return json.data as T;
}
