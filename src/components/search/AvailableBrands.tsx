export default function AvailableBrands({ brands, onClick }: { brands: string[], onClick: (brand: string) => void }) {
    return (
        <div className="p-2">
            Explore brands in the category:
            {brands && brands.map((brand, idx) => (
                <span key={idx}
                    className="text-xs rounded-xl mr-2 p-2 bg-slate-100 shadow"
                    onClick={() => onClick(brand)}>{brand}</span>
            ))}
        </div>
    )
}