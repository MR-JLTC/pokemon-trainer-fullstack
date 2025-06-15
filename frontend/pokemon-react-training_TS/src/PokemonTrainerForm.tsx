import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Ensure you have this CSS file

// Define the base URL for your NestJS backend
const API_BASE_URL = 'http://localhost:3000/trainers'; // Make sure this matches your NestJS main.ts port and controller prefix

type Trainer = {
  id: number;
  firstName: string;
  lastName: string;
  birthday: string;
  mobileNumber: string;
  email: string;
  favoriteColor: string;
};

export default function PokemonTrainerForm() {
  const [currentTrainerId, setCurrentTrainerId] = useState<number | null>(null); // To store ID for editing
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [favoriteColor, setFavoriteColor] = useState('');
  const [allTrainers, setAllTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // For user feedback

  // Function to convert hex color to a common color name (for display only if you used color input)
  // Re-added if you plan to use color picker for input, otherwise you can remove
  const getColorName = (hexColor: string) => {
    switch (hexColor.toLowerCase()) {
      case '#0000ff': return 'Blue';
      case '#008000': return 'Green';
      case '#ffff00': return 'Yellow';
      case '#ff0000': return 'Red';
      case '#ffffff': return 'White';
      case '#000000': return 'Black';
      case '#800080': return 'Purple';
      case '#ffa500': return 'Orange';
      case '#ffc0cb': return 'Pink';
      case '#808080': return 'Gray';
      case '#a52a2a': return 'Brown';
      case '#00ffff': return 'Cyan';
      case '#ff00ff': return 'Magenta';
      case '#00ff00': return 'Lime';
      case '#000080': return 'Navy';
      case '#008080': return 'Teal';
      case '#c0c0c0': return 'Silver';
      case '#ffd700': return 'Gold';
      default: return hexColor; // Return the hex if no common name is found
    }
  };

  // Helper function for UI messages
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showUserMessage = (msg: string, _type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    // Optionally clear message after a few seconds
    setTimeout(() => setMessage(''), 3000);
  };

  // Function to fetch all trainers from the backend
  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Trainer[]>(API_BASE_URL);
      setAllTrainers(response.data);
      showUserMessage('Trainers loaded successfully!');
    } catch (error) {
      console.error('Error fetching trainers:', error);
      showUserMessage('Failed to load trainers. Please check backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch trainers on component mount
  useEffect(() => {
    fetchTrainers();
  }, []); // Empty dependency array means this runs once on mount

  // Handles form submission (Create or Update)
  async function handleSubmit() {
    // Basic frontend validation
    if (!firstName || !lastName || !birthday || !mobileNumber || !email) {
      showUserMessage('Please fill all required fields!', 'error');
      return;
    }
    if (!/^\d+$/.test(mobileNumber)) {
      showUserMessage('Mobile number should contain only numbers!', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showUserMessage('Please enter a valid email address!', 'error');
      return;
    }

    setLoading(true);
    try {
      const trainerData = {
        firstName,
        lastName,
        birthday,
        mobileNumber,
        email,
        favoriteColor
      };

      let response;
      if (currentTrainerId) {
        // Update existing trainer
        response = await axios.patch<Trainer>(`${API_BASE_URL}/${currentTrainerId}`, trainerData);
        showUserMessage('Trainer updated successfully!');
      } else {
        // Create new trainer
        response = await axios.post<Trainer>(API_BASE_URL, trainerData);
        showUserMessage('Trainer registered successfully!');
      }

      console.log('API Response:', response.data);
      handleReset(); // Clear form after success
      fetchTrainers(); // Refresh the list of trainers
    } catch (error: unknown) {
      console.error('Error during transaction:', error);

      // Define a type for Axios error response
      type AxiosErrorResponse = {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const axiosError = error as AxiosErrorResponse;

      if (
        typeof error === 'object' &&
        error !== null &&
        axiosError.response &&
        typeof axiosError.response === 'object' &&
        axiosError.response.data &&
        typeof axiosError.response.data === 'object' &&
        'message' in axiosError.response.data
      ) {
        showUserMessage(`Error: ${axiosError.response.data.message}`, 'error');
      } else {
        showUserMessage('An unexpected error occurred. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  // Populates the form with data for editing
  const handleEdit = (trainer: Trainer) => {
    setCurrentTrainerId(trainer.id);
    setFirstName(trainer.firstName);
    setLastName(trainer.lastName);
    setBirthday(trainer.birthday.split('T')[0]); // Format date for input type="date"
    setMobileNumber(trainer.mobileNumber);
    setEmail(trainer.email);
    setFavoriteColor(trainer.favoriteColor || '');
    showUserMessage(`Editing Trainer ID: ${trainer.id}`);
  };

  // Deletes a trainer
  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete trainer with ID ${id}?`)) {
      return; // User cancelled
    }
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      showUserMessage('Trainer deleted successfully!');
      fetchTrainers(); // Refresh the list
    } catch (error: unknown) {
      console.error('Error deleting trainer:', error);
      // Type guard for Axios error
      if (
        typeof error === 'object' &&
        error !== null && 
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: { data?: { message?: string } } }).response &&
        'data' in (error as { response?: { data?: { message?: string } } }).response! &&
        (error as { response?: { data?: { message?: string } } }).response!.data &&
        typeof (error as { response?: { data?: { message?: string } } }).response!.data === 'object' &&
        'message' in (error as { response?: { data?: { message?: string } } }).response!.data!
      ) {
        showUserMessage(
          `Error: ${(error as { response: { data: { message: string } } }).response.data.message}`,
          'error'
        );
      } else {
        showUserMessage('Failed to delete trainer. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resets the form and clear edit state
  function handleReset() {
    setCurrentTrainerId(null);
    setFirstName('');
    setLastName('');
    setBirthday('');
    setMobileNumber('');
    setEmail('');
    setFavoriteColor('');
    setMessage('');
  }

  return (
    <div className="pokemon-container">
      <div className="pokemon-form">
        <h1 className="pokemon-title">
          {currentTrainerId ? 'Edit Pokemon Trainer' : 'Register New Pokemon Trainer'}
        </h1>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error-message' : 'success-message'}`}>
            {message}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Birthday</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mobile Number</label>
          <input
            type="text"
            value={mobileNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9+]/g, ''); // Allow '+' for international prefix
              setMobileNumber(value);
            }}
            placeholder="Enter mobile number"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Favorite Color</label>
          <input
            type="text" // Changed to text input as per previous discussion, but for backend could be hex
            value={favoriteColor}
            onChange={(e) => setFavoriteColor(e.target.value)}
            placeholder="Enter favorite color (e.g., Blue, Red)"
            className="form-input"
          />
        </div>

        <div className="button-group">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Processing...' : (currentTrainerId ? 'Update Trainer' : 'Register Trainer')}
          </button>
          <button
            onClick={handleReset}
            className="reset-button"
            disabled={loading}
          >
            {currentTrainerId ? 'Cancel Edit' : 'Reset Form'}
          </button>
        </div>
      </div>

      <div className="all-trainers-section">
        <h2 className="all-trainers-title">All Registered Trainers</h2>
        {loading && allTrainers.length === 0 && <p>Loading trainers...</p>}
        {!loading && allTrainers.length === 0 && <p>No trainers registered yet.</p>}

        <div className="trainers-list">
          {allTrainers.map((trainer) => (
            <div key={trainer.id} className="trainer-item">
              <div className="trainer-item-header">
                <h3 className="trainer-item-name">{trainer.firstName} {trainer.lastName}</h3>
                <span className="trainer-item-id">ID: {trainer.id}</span>
              </div>
              <div className="trainer-item-details">
                <div className="trainer-item-row">
                  <span className="trainer-item-label">Birthday:</span>
                  <span className="trainer-item-value">{trainer.birthday.split('T')[0]}</span> {/* Display only date part */}
                </div>
                <div className="trainer-item-row">
                  <span className="trainer-item-label">Mobile:</span>
                  <span className="trainer-item-value">{trainer.mobileNumber}</span>
                </div>
                <div className="trainer-item-row">
                  <span className="trainer-item-label">Email:</span>
                  <span className="trainer-item-value">{trainer.email}</span>
                </div>
                <div className="trainer-item-row">
                  <span className="trainer-item-label">Favorite Color:</span>
                  <div className="trainer-item-color">
                    <div
                      className="trainer-color-circle"
                      style={{ backgroundColor: getColorName(trainer.favoriteColor || '#CCCCCC') }} // Use getColorName if fav color is hex, or a default
                    ></div>
                    <span className="trainer-item-value">{trainer.favoriteColor || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="trainer-item-actions">
                <button onClick={() => handleEdit(trainer)} className="edit-button" disabled={loading}>Edit</button>
                <button onClick={() => handleDelete(trainer.id)} className="delete-button" disabled={loading}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
