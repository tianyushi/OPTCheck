import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <h1>Check Your OPT Application For Free!</h1>
      <form>
        <div>
          <label htmlFor="passport-upload">Passport Upload:</label>
          <input type="file" id="passport-upload" />
        </div>
        <div>
          <label htmlFor="i94-upload">I-94 Upload:</label>
          <input type="file" id="i94-upload" />
        </div>
        <div>
          <label htmlFor="i765-upload">I-765 Upload:</label>
          <input type="file" id="i765-upload" />
        </div>
        <div>
          <label htmlFor="i20-upload">I-20 Upload:</label>
          <input type="file" id="i20-upload" />
        </div>
        <button type="submit" className="check-docs-btn">Check Documents</button>
      </form>
      <p className="disclaimer">
        Please note: This app does not store any of your uploaded documents.
      </p>
    </div>
  );
}

export default Home;
