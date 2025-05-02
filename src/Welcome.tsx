import { useState } from 'react';

const SEEN_KEY = "seenWelcome";

const Welcome = () => {
  const [ seen, setSeen ] = useState(() => {
    const storedSeen = localStorage.getItem(SEEN_KEY);
    return storedSeen ? parseInt(storedSeen, 10) : 0
  });

  const handleStart = () => {
    const newSeen = Date.now();
    setSeen(newSeen);
    localStorage.setItem(SEEN_KEY, newSeen.toString());
  };

  if (seen) {
    return null;
  }
  return (
    <div style={{
      position: "absolute",
      zIndex: 2000,
      width: '100%',
      height: '100%',
    }}>
      <div style={{
        margin: 'auto',
        borderRadius: 20,
        border: '1px solid black',
        padding: 10,
        maxWidth: 900,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        width: 'calc(100% - 40px)',
        height: 'calc(100% - 40px)',
        overflow: 'hidden',
      }}>
        <div style={{
          textAlign: 'right',
          height: 20,
        }}>
          <button style={{fontSize: 'x-small'}} onClick={handleStart}>Close tutorial</button>
        </div>
        <div style={{
          overflowY: 'scroll',
          height: 'calc(100% - 20px)',
          width: '100%',
        }}>
        <h1>Welcome to Open Skate Map!</h1>
        <p>
          Welcome to Open Skate Map – your guide to the best outdoor inline skating path!
          We focus on what really counts: smooth, skate-friendly asphalt.
          Whether you're into fitness skating, long-distance trails, or just cruising your city, you'll find real skater-rated info on surface quality.
          Discover new routes, share your favorite paths, and help build a better map for the global inline skating community. Lace up, roll out, and let’s skate smarter—together.
        </p>

        <h2>Quick Start</h2>
        <p>The app shows you cycleways with a skater's rating:</p>
        <ul>
          <li><strong style={{color:'green'}}>Green</strong>: Really good asphalt. Go there!</li>
          <li><strong style={{color:'gold'}}>Yellow</strong>: Medium asphalt.</li>
          <li><strong style={{color:'red'}}>Red</strong>: Really bad asphalt. Try to avoid.</li>
          <li><strong style={{color:'grey'}}>Grey</strong>: No one rated this path. Go ahead and be the first one to rate it!</li>
        </ul>
        <p>The map automatically centers on you. To disable this uncheck "Center map on your location".</p>

        <h3>How to rate a path?</h3>
        <p>You can rate a path with two simple steps:</p>
        <ol>
          <li>Let the map automatically center on your location or manually move the map, so the path you want to rate is under the "x" sign.</li>
          <li>Click or tap one of the three buttons in the top-right corner.</li>
        </ol>

        <h2>What's new?</h2>
        <h3>Version 0.27.0</h3>
        <ul>
          <li>Fix: OpenStreetMap attribution is visible</li>
        </ul>
        <h3>Version 0.26.0</h3>
        <ul>
          <li>Added welcome screen</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default Welcome;
