import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { editChannel, removeChannel } from '../../store/channels';
import Modal from '../Modal/Modal';
import { Settings } from 'lucide-react';

export default function EditChannelModal({ channel, isOwner, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [channelName, setChannelName] = useState(channel.name);
  const dispatch = useDispatch();

  useEffect(() => {
    setChannelName(channel.name);
  }, [channel.name]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (/[^a-zA-Z0-9]/.test(value)) {
      alert("Only letters and numbers are allowed.");
      return;
    }
    setChannelName(value);
  };

  const handleOpenModal = () => {
    if (!isOwner) {
      alert("You do not have permission to edit a channel because you do not own the server.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setChannelName(channel.name);
  };

  const handleSaveChanges = () => {
    if (channelName.trim()) {
      const lowerCaseChannelName = channelName.toLowerCase();
      dispatch(editChannel(channel.id, lowerCaseChannelName));
      handleCloseModal();
    }
  };

  const handleDeleteChannel = () => {
    dispatch(removeChannel(channel.id));
    handleCloseModal();
    // Delay onDelete callback to ensure the store has updated
    setTimeout(() => {
      if (onDelete) onDelete();
    }, 0);
  };

  return (
    <>
      <button 
        onClick={handleOpenModal} 
        className="channel-settings-button"
      >
        <Settings size={16} color="white" />
      </button>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="edit-channel-modal">
          <h2>Overview</h2>
          <div className="channel-name-section">
            <h3>Channel Name</h3>
            <input 
              type="text" 
              value={channelName}
              onChange={handleNameChange}
              className="channel-name-input"
            />
          </div>
          <div className="modal-actions">
            <button 
              onClick={handleSaveChanges} 
              className="save-changes-button"
            >
              Save Changes
            </button>
            <button 
              onClick={handleDeleteChannel} 
              className="delete-channel-button"
            >
              Delete Channel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
