import React, { useState } from 'react';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Events App</h1>
        <div className="controls">
          <button onClick={fetchEvents} disabled={loading}>
            {loading ? 'Fetching...' : 'FETCH EVENTS'}
          </button>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            placeholder="Number of events"
          />
        </div>
        <div className="events-list">
          {events.slice(0, limit).map((event, index) => (
            <div key={index} className="event">
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>Start: {event.startDate}</p>
              <p>End: {event.endDate}</p>
              <p>Location: {event.location}</p>
              {event.url && <p><a href={event.url} target="_blank" rel="noopener noreferrer">More Info</a></p>}
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;