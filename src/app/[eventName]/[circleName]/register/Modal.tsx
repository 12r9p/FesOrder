import React from 'react';

interface Topping {
    id: number;
    name: string;
}

interface Item {
    image: string;
    name: string;
    price: number;
    toppings?: Topping[];
}

interface TempItem {
    selectedToppings: number[];
}

interface ModalProps {
    selectedItem: Item | null;
    tempItem: TempItem | null;
    setTempItem: React.Dispatch<React.SetStateAction<TempItem | null>>;
}

const Modal: React.FC<ModalProps> = ({ selectedItem, tempItem, setTempItem }) => {
    if (!selectedItem || !tempItem) return null;

    return (
        <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50">
            <div className="bg-white w-full md:w-1/2 lg:w-1/3 p-4 rounded-t-lg shadow-lg">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-40 object-cover rounded-lg" />
                    <h2 className="text-2xl font-bold text-black">{selectedItem.name}</h2>
                    <p className="text-xl text-black">¥{selectedItem.price}</p>

                    {selectedItem.toppings && (
                        <div>
                            <h3 className="font-semibold mb-2 text-black">Toppings</h3>
                            {selectedItem.toppings.map(topping => (
                                <label key={topping.id} className="flex items-center space-x-2 text-black">
                                    <input
                                        type="checkbox"
                                        checked={tempItem.selectedToppings.includes(topping.id)}
                                        onChange={() => {
                                            setTempItem(prev => {
                                                if (!prev) return null;
                                                // Handle topping selection logic here
                                            });
                                        }}
                                    />
                                    <span>{topping.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;