import Image from "next/image";
import Link from "next/link";

export type ProductInfo = {
    id: string;
    name: string;
    category: string;
    brand: string;
    imageUrl: string;
    description: string;
    description_en: string;
    price: number;
    priceUnit: string;
    score: number;
}

export default function Product(product: ProductInfo) {
    return (
        <div className="flex border-b">
            <div className="flex-none w-48 relative">
                <Image src={product.imageUrl}
                    alt={product.name}
                    width="0"
                    height="0"
                    sizes="100vw"
                    className="inset-0 w-full h-full object-cover"></Image>
            </div>
            <div className="flex-auto p-6">
                <h1 className="text-lg font-semibold text-slate-900">{product.name}</h1>
                <div className="text-sm">Brand: {product.brand} / {product.price} {product.priceUnit}</div>
                <div className="w-full text-sm font-medium text-slate-700 mt-2" dangerouslySetInnerHTML={{__html: product.description}}></div>
                <div className="text-sm">Category: {product.category}</div>
                {product.score && <div className="text-sm">Similarity score: {product.score}</div>}
            </div>
        </div>
    );
}