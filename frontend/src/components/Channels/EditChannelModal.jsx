import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { editChannel, removeChannel } from '../../store/channels';
import Modal from '../Modal/Modal';
import { Settings } from 'lucide-react';

export default function EditChannelModal({ channel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [channelName, setChannelName] = useState(channel.name);
  const dispatch = useDispatch();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset channel name to original when closing
    setChannelName(channel.name);
  };

  const handleSaveChanges = () => {
    if (channelName.trim()) {
      dispatch(editChannel(channel.id, channelName));
      handleCloseModal();
    }
  };

  const handleDeleteChannel = () => {
    dispatch(removeChannel(channel.id));
    handleCloseModal();
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
              onChange={(e) => setChannelName(e.target.value)}
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