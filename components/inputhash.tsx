// components/inputhash.tsx
import React, { useState } from 'react';
import { Input } from './ui/input';

interface InputHashProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const InputHash: React.FC<InputHashProps> = ({ value, onChange, disabled }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInputValue, setModalInputValue] = useState(value);

    const handleModalSubmit = () => {
        onChange(modalInputValue);
        setModalOpen(false);
    };

    return (
        <div>
            {/* Ô input chính */}
            <input
                type="text"
                value={value}
                disabled={disabled}
                onClick={() => setModalOpen(true)}
                readOnly
                className="p-2 text-base w-full cursor-pointer" />

            {/* Modal */}
            {modalOpen && (
                <div className="fixed top-0 left-0 w-full h-full bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-4 rounded-lg w-[400px] h-[400px] text-center shadow-md">
                        <h2>Enter Hash Value</h2>
                        <input
                            type="text"
                            value={modalInputValue}
                            onChange={(e) => setModalInputValue(e.target.value)}
                            placeholder="Enter hash"
                            className="p-2 text-base w-full mb-3"
                        />
                        <button
                            onClick={handleModalSubmit}
                            className="px-4 py-2 text-base cursor-pointer mt-2 bg-blue-950">
                            Submit
                        </button>
                        <button
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 text-base cursor-pointer mt-2 ml-2 bg-gray-300">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InputHash;
