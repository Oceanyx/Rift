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

  const handleChannelNameChange = (e) => {
    const value = e.target.value;
    // If the value contains any character that is not a letter or number, alert the user.
    if (/[^a-zA-Z0-9]/.test(value)) {
      alert("Only letters and numbers are allowed.");
      return;
    }
    setChannelName(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    
    // Convert channel name to lowercase before dispatching
    const lowerCaseChannelName = channelName.toLowerCase();
    
    dispatch(createChannel(serverId, lowerCaseChannelName, channelType));
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
            onChange={handleChannelNameChange} 
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
