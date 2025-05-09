import { useState } from 'react';
import welcomeHtml from './welcome.html?raw';
import changeLogHtml from './changelog.html?raw';
import DOMPurify from 'dompurify';

const SEEN_KEY = "seenWelcome";

type HelpButtonProps = {
  handleHelp: () => void;
};

const HelpButton: React.FC<HelpButtonProps> = ({ handleHelp }) => {
  return (
    <div style={{
      position: "absolute",
      zIndex: 2000,
      left: 10,
      bottom: 24,
      borderRadius: 2,
      border: '2px solid rgba(0,0,0,0.2)',
    }}>
      <a href="#" onClick={handleHelp} style={{
        backgroundColor: '#fff',
        color: 'black',
        cursor: 'pointer',
        width: '30px',
        height: '30px',
        lineHeight: '30px',
        fontSize: '22px',
        display: 'block',
        fontFamily: "'Lucida Console', Monaco, monospace",
        fontWeight: '700',
        textAlign: 'center',
        textDecoration: 'none',
      }}><span aria-hidden="true">?</span></a>
    </div>
  );
}

type WelcomeOverlayProps = {
  handleStart: () => void;
};

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ handleStart }) => {
  const purifiedHtml = DOMPurify.sanitize(
    welcomeHtml + changeLogHtml,
    {ADD_ATTR: ['target']}
  );

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
        <div
          style={{
            overflowY: 'scroll',
            height: 'calc(100% - 20px)',
            width: '100%',
          }}
          dangerouslySetInnerHTML={{
            __html: purifiedHtml,
          }}
        >
        </div>
      </div>
    </div>
  );
}

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

  const handleHelp = () => {
    setSeen(0);
  };

  return (
    <>
      <HelpButton handleHelp={handleHelp} />
      { seen ? '' : (<WelcomeOverlay handleStart={handleStart} />) }
    </>
  );
};

export default Welcome;
