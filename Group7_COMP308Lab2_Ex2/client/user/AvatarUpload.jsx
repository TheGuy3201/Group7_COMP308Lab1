import React, { useState } from 'react';

const AvatarUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const response = await fetch('http://localhost:4000/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Call parent component with the avatar URL
        if (onUploadSuccess) {
          onUploadSuccess(data.avatarURL);
        }
        alert('Avatar uploaded successfully!');
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Error uploading file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>Upload Avatar</h3>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      {preview && (
        <div style={{ margin: '10px 0' }}>
          <img 
            src={preview} 
            alt="Preview" 
            style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>
      )}
      
      <button 
        onClick={handleUpload} 
        disabled={!selectedFile || uploading}
        style={{ marginTop: '10px' }}
      >
        {uploading ? 'Uploading...' : 'Upload Avatar'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AvatarUpload;
