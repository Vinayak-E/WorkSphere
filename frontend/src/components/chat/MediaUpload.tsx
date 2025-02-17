import React, { useState } from 'react';
import { Upload, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary } from '@/utils/cloudinary';

const MediaUpload = ({ onMediaSelect, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const handleSend = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const uploadedUrl = await uploadToCloudinary(selectedFile);
      
      onMediaSelect({
        type: selectedFile.type.startsWith('image/') ? 'image' : 'video',
        url: uploadedUrl
      });

      onClose();
    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Share Media</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative">
        {previewUrl ? (
          <div className="relative">
            {selectedFile?.type.startsWith('image/') ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full object-contain max-h-[60vh]"
              />
            ) : (
              <video 
                src={previewUrl} 
                className="w-full max-h-[60vh]" 
                controls 
              />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Uploading...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <label className="block p-12">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <div className="flex flex-col items-center gap-4 cursor-pointer">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">Click to upload</p>
                <p className="text-xs text-gray-500 mt-1">
                  Support for images and videos
                </p>
              </div>
            </div>
          </label>
        )}
      </div>

      {previewUrl && (
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full"
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isUploading}
            className="rounded-full bg-blue-500 hover:bg-blue-600"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
