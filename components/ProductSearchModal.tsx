
import React, { useState } from 'react';
import { searchProducts, ProductSearchResult, toMaterialItem } from '../services/productSearchService';
import { MaterialItem } from '../types';
import { GoldButton } from './GoldButton';

interface ProductSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddProduct: (item: MaterialItem) => void;
    initialQuery?: string;
}

export const ProductSearchModal: React.FC<ProductSearchModalProps> = ({
    isOpen,
    onClose,
    onAddProduct,
    initialQuery = ''
}) => {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<ProductSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const searchResults = await searchProducts(query);
            setResults(searchResults);
            // Initialize quantities to 1 for each result
            const initialQuantities: { [key: number]: number } = {};
            searchResults.forEach((_, index) => {
                initialQuantities[index] = 1;
            });
            setQuantities(initialQuantities);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = (product: ProductSearchResult, index: number) => {
        const quantity = quantities[index] || 1;
        const materialItem = toMaterialItem(product, quantity);
        onAddProduct(materialItem);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8962F] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h2 className="text-xl font-black uppercase tracking-wider text-black">Product Search</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-black hover:text-gray-800 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search for products... e.g., 'Axis P3265-V dome camera' or 'Cat6A plenum cable'"
                            className="flex-1 bg-black border border-gray-700 text-white px-4 py-3 focus:border-[#D4AF37] outline-none transition-all text-lg placeholder-gray-600"
                        />
                        <GoldButton
                            onClick={handleSearch}
                            loading={loading}
                            className="px-8"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </GoldButton>
                    </div>
                    <p className="text-gray-500 text-xs mt-2 uppercase tracking-wider">
                        Powered by Google AI • Real-time pricing from manufacturer & distributor sources
                    </p>
                </div>

                {/* Results */}
                <div className="overflow-y-auto max-h-[60vh] p-6">
                    {error && (
                        <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-gray-400 uppercase tracking-widest text-sm">Searching products...</p>
                        </div>
                    )}

                    {!loading && results.length === 0 && query && !error && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-500">No products found. Try a different search term.</p>
                        </div>
                    )}

                    {!loading && results.length === 0 && !query && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-gray-500">Enter a product name, model number, or description to search.</p>
                            <div className="mt-4 text-xs text-gray-600 space-y-1">
                                <p>Try searching for:</p>
                                <p className="text-[#D4AF37]">"Axis P3265-V" • "Leviton Cat6A jack" • "Panduit patch panel 24-port"</p>
                            </div>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-4">
                                Found {results.length} product{results.length !== 1 ? 's' : ''}
                            </p>

                            {results.map((product, index) => (
                                <div
                                    key={index}
                                    className="bg-black/50 border border-gray-800 hover:border-[#D4AF37]/50 transition-all p-4 group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${product.category === 'Equipment'
                                                        ? 'bg-[#008a8a]/20 text-[#00b3b3]'
                                                        : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                                                    }`}>
                                                    {product.category}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${product.confidence === 'high'
                                                        ? 'bg-green-900/30 text-green-400'
                                                        : product.confidence === 'medium'
                                                            ? 'bg-yellow-900/30 text-yellow-400'
                                                            : 'bg-red-900/30 text-red-400'
                                                    }`}>
                                                    {product.confidence} confidence
                                                </span>
                                            </div>

                                            <h3 className="text-white font-bold text-lg group-hover:text-[#D4AF37] transition-colors">
                                                {product.manufacturer} {product.model}
                                            </h3>

                                            <p className="text-gray-400 text-sm mt-1">
                                                {product.description}
                                            </p>

                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span className="font-mono">Part #: {product.partNumber}</span>
                                                <span>Unit: {product.unitOfMeasure}</span>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <div className="text-2xl font-black text-[#D4AF37] font-mono">
                                                ${product.msrp.toFixed(2)}
                                                {product.unitOfMeasure === 'ft' && <span className="text-sm text-gray-500">/ft</span>}
                                            </div>

                                            <div className="flex items-center gap-2 mt-3">
                                                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Qty:</label>
                                                <input
                                                    type="number"
                                                    value={quantities[index] || 1}
                                                    onChange={(e) => setQuantities({
                                                        ...quantities,
                                                        [index]: Math.max(1, parseInt(e.target.value) || 1)
                                                    })}
                                                    className="w-16 bg-black border border-gray-700 text-white text-center px-2 py-1 focus:border-[#D4AF37] outline-none"
                                                    min="1"
                                                />
                                                {product.unitOfMeasure === 'ft' && <span className="text-gray-500 text-xs">ft</span>}
                                            </div>

                                            <button
                                                onClick={() => handleAddProduct(product, index)}
                                                className="mt-3 bg-[#D4AF37] hover:bg-[#FFD700] text-black font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add to Order
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-800 px-6 py-4 bg-black/50 flex justify-between items-center">
                    <p className="text-gray-600 text-xs">
                        💡 Tip: Include manufacturer names and model numbers for best results
                    </p>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-sm uppercase tracking-wider transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
