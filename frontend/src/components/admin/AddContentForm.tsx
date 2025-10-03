import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { X } from 'lucide-react';

interface AddContentModalProps {
  onClose: () => void;
}

const AddContentModal: React.FC<AddContentModalProps> = ({ onClose }) => {
  const { addContent } = useContent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [climaxTimestamp, setClimaxTimestamp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !thumbnail || !videoUrl || !climaxTimestamp) {
      alert('Please fill in all fields');
      return;
    }

    const contentData = {
      title,
      description,
      thumbnail,
      videoUrl,
      climaxTimestamp: parseInt(climaxTimestamp),
    };

    await addContent(contentData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X />
        </button>
        <h2 className="text-xl font-semibold mb-4">Add New Content</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Thumbnail URL"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Climax Timestamp (in seconds)"
            value={climaxTimestamp}
            onChange={(e) => setClimaxTimestamp(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddContentModal;
