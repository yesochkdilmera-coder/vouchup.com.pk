import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function StorageUpload({ bucketName = 'avatars', folder = 'uploads' }) {
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const [url, setUrl] = useState(null)

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const uploadFile = async () => {
        if (!file) return

        setUploading(true)
        setError(null)
        setUrl(null)

        // Generate unique filename to avoid conflicts
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${folder}/${fileName}`

        try {
            // Upload file directly to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // File public URL for display
            const { publicUrl } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath).data

            setUrl(publicUrl)

        } catch (err) {
            console.error('Error uploading file: ', err.message)
            setError(err.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className='upload-component'>
            <h3>Upload Service ({bucketName})</h3>
            <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
            />
            <button
                onClick={uploadFile}
                disabled={!file || uploading}
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>

            {error && <p className="error">{error}</p>}

            {url && (
                <div className="preview">
                    <p>Uploaded Successfully!</p>
                    <img src={url} alt="Uploaded file" style={{ maxWidth: '200px' }} />
                    <a href={url} target="_blank" rel="noopener noreferrer">View Full</a>
                </div>
            )}
        </div>
    )
}
