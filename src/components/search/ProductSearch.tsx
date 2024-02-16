"use client";

import { BaseCallbackConfig } from "langchain/callbacks";
import { RemoteRunnable } from "langchain/runnables/remote";
import { FormEvent, useState } from "react";
import { ProductQuery } from ".";
import QueryUsed from "./QueryUsed";
import Product, { ProductInfo } from "@/components/product/Product";
import AvailableBrands from "./AvailableBrands";

type SearchResult = {
    run_id: string;
    query?: ProductQuery
    available_brands?: string[];
    products?: any[]
}


export default function ProductSearch() {
    const [products, setProducts] = useState<ProductInfo[]>([]);
    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [query, setQuery] = useState<ProductQuery>();

    async function searchProduct(query: string, brand?: string) {
        setQuery(undefined);
        setProducts([]);
        setAvailableBrands([]);

        if (query) {
            const chain = new RemoteRunnable<{ query: string, brand?: string }, SearchResult, BaseCallbackConfig>({
                url: "/api/search",
            });
            try {
                const stream = await chain.stream({ query, brand });
                for await (const chunk of stream) {
                    if (chunk.query) {
                        setQuery(chunk.query);
                    } else if (chunk.available_brands) {
                        setAvailableBrands(chunk.available_brands);
                    } else if (chunk.products) {
                        const products = chunk.products.map((item: any) => {
                            const images = item.image_link ? JSON.parse(item.image_link.replaceAll("'", "\"")) : [];
                            return {
                                id: item.product_id,
                                name: item.product_name_en,
                                category: item.product_categories,
                                brand: item.brand,
                                imageUrl: images.length > 0 ? images[0] : "",
                                description: item.short_description,
                                description_en: item.short_description_en,
                                price: item.sale_price,
                                score: item.score,
                                priceUnit: "THB"
                            }
                        });
                        setProducts(products);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
    async function onClickBrand(brand: string) {
        searchProduct(query?.product_category || "", brand);
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget);
        const input = formData.get("search")?.toString();
        if (input) {
            searchProduct(input);
        }
    }
    return (
        <div className="w-full">
            <form className="search-form" onSubmit={onSubmit}>
                <label htmlFor="search" className="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input type="search" id="search" name="search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" placeholder="Search products..." required />
                </div>
            </form>
            <section>
                {query && <QueryUsed {...query} />}
                {availableBrands.length > 0 && <AvailableBrands brands={availableBrands} onClick={onClickBrand} />}
            </section>
            <section>
                {query && products.length == 0 && <div>No products found.</div>}
                {products.map((product) => (<Product key={product.id} {...product} />))}
            </section>
        </div>
    )
}