import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface MultiFileDropzoneProps {
    value: any;
    onChange: (files: any[]) => void;
    disabled?: boolean;
}

const MultiFileDropzone: React.FC<MultiFileDropzoneProps> = ({ value, onChange, disabled }) => {
    const [uploading, setUploading] = useState(false);
    const [pinataHash, setPinataHash] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (disabled || uploading) return;

        setUploading(true);
        setSelectedFiles(acceptedFiles);

        try {
            const formData = new FormData();
            acceptedFiles.forEach((file) => formData.append('file', file));

            // Gửi yêu cầu lên Pinata
            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    'Authorization': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3NGRkZWU0OS0wZGRiLTQxMzEtOWU1Mi0wYmM1NjI0MTVhNGYiLCJlbWFpbCI6InRyZXhiYWlyb25nQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxNDI5YzVlZGNlMGUwODQyOWRmOCIsInNjb3BlZEtleVNlY3JldCI6IjVmNjIyYjNlNmYxZDE4ZWY4YmQyNzkyYTcyNzJiMjY3MTg5ODRkNzk3NWM1YThjZmQ1YTFjZjBiOTY4MzA3YzMiLCJleHAiOjE3NTgzNzU4NjR9.gONoK50bCrR79fz0UYmNE5w_x6C1B2SjXsKw8tn2WpY`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data && response.data.IpfsHash) {
                setPinataHash(response.data.IpfsHash);
                if (onChange) {
                    onChange(response.data.IpfsHash);
                }
            } else {
                console.error('Failed to upload to Pinata');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setUploading(false);
        }
    }, [disabled, uploading, onChange]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: true,
    });

    return (
        <div {...getRootProps()} className={`border-dashed border-2 p-4 rounded ${disabled ? 'opacity-50' : ''}`}>
            <input {...getInputProps()} disabled={disabled || uploading} />
            <p>{uploading ? 'Uploading...' : 'Drag & drop a folder here, or click to select files'}</p>

            {selectedFiles.length > 0 && (
                <div>
                    <h4>Selected Files:</h4>
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {pinataHash && <p>Uploaded to Pinata, hash: {pinataHash}</p>}
        </div>
    );
};

export default MultiFileDropzone;
