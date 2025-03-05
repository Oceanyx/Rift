import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createChannel } from '../../store/channels';
import Modal from '../Modal/Modal';
import './CreateChannelModal.css';

export default function CreateChannelModal({ isOpen, onClose, serverId }) {
  const dispatch = useDispatch();
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('text'); // Default to text

  const handleTypeChange = (e) => {
    if (e.target.value === 'voice') {
      alert("Feature coming soon!");
      return;
    }
    setChannelType(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    
    dispatch(createChannel(serverId, channelName, channelType));
    setChannelName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Create Channel</h2>
      <form onSubmit={handleSubmit} className="create-channel-form">
        <label>
          Channel Name:
          <input 
            type="text" 
            value={channelName} 
            onChange={(e) => setChannelName(e.target.value)} 
            required 
          />
        </label>

        <div className="channel-type-options">
          <label>
            <input 
              type="radio" 
              value="text" 
              checked={channelType === 'text'} 
              onChange={handleTypeChange} 
            />
            Text Channel
          </label>

          <label>
            <input 
              type="radio" 
              value="voice" 
              onChange={handleTypeChange} 
            />
            Voice Channel
          </label>
        </div>

        <button type="submit" className="create-channel-button">Create</button>
      </form>
    </Modal>
  );
}
