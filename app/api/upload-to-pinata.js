import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const config = {
    api: {
        bodyParser: false,
    },
};

const runPythonScript = async (folderPath, uploadUrl) => {
    try {
        const { stdout, stderr } = await execAsync(`python3 path/to/your_python_script.py ${folderPath} ${uploadUrl}`);
        if (stderr) {
            throw new Error(stderr);
        }
        return JSON.parse(stdout);
    } catch (error) {
        throw new Error(`Error executing Python script: ${error.message}`);
    }
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const form = new formidable.IncomingForm();
        form.uploadDir = path.join(process.cwd(), 'uploads');
        form.keepExtensions = true;
        form.multiples = true;

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ error: 'Error parsing the files' });
            }

            try {
                const folderPath = form.uploadDir;

                const pinataUrl = process.env.PINATA_UPLOAD_URL || 'https://api.pinata.cloud/pinning/pinFileToIPFS';

                const response = await runPythonScript(folderPath, pinataUrl);

                res.status(200).json(response);
            } catch (error) {
                res.status(500).json({ error: error.toString() });
            } finally {
                fs.rmSync(form.uploadDir, { recursive: true, force: true });
            }
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
