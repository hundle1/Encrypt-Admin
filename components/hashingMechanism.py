import sys
import hashlib
import os
import requests
import zipfile
import json
from dotenv import load_dotenv

load_dotenv()

def hash_folder(folder_path):
    BUF_SIZE = 65536
    folder_hash = hashlib.sha256()
    
    for root, _, files in os.walk(folder_path):
        for filename in files:
            file_path = os.path.join(root, filename)
            if os.path.isfile(file_path):
                with open(file_path, 'rb') as file:
                    while chunk := file.read(BUF_SIZE):
                        folder_hash.update(chunk)

    return folder_hash.hexdigest()

def zip_folder(folder_path):
    zip_filename = f"{folder_path}.zip"
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, folder_path)
                zipf.write(file_path, arcname=arcname)
    return zip_filename

def upload_to_pinata(zip_path, jwt_token):
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {'Authorization': f"Bearer {jwt_token}"}

    with open(zip_path, 'rb') as zip_file:
        files = {'file': (os.path.basename(zip_path), zip_file)}
        response = requests.post(url, files=files, headers=headers)
        return response.json()

if __name__ == "__main__":
    folder_path = sys.argv[1]  # Nhận tham số từ Next.js API

    folder_hash = hash_folder(folder_path)
    output_filename = os.path.join(folder_path, f"{folder_hash}.txt")
    
    with open(output_filename, 'w') as file:
        file.write(folder_hash)

    zip_path = zip_folder(folder_path)
    PINATA_JWT_TOKEN = os.getenv('PINATA_JWT_TOKEN')
    response = upload_to_pinata(zip_path, PINATA_JWT_TOKEN)

    # Trả về JSON để Next.js xử lý
    print(json.dumps({"hashID": folder_hash, "folderUrl": response.get("IpfsHash")}))
