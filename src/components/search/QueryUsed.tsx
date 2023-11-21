import type { ProductQuery } from ".";

export default function QueryUsed(query: ProductQuery) {
    return (
        <div className="p-2">
            Searching products for:
            <span className="text-xs rounded-xl mr-2 p-2 bg-slate-100 shadow">Category: {query.product_category}</span>
            {query.brand && <span className="text-xs rounded-xl mr-2 p-2 bg-slate-100 shadow">Brand: {query.brand}</span>}
        </div>
    )
}