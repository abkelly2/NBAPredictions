import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { FaHome } from 'react-icons/fa';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Confetti from 'react-confetti';
import useIsMobile from './useIsMobile.js'; // Import the custom hoo

function Header() {
  const [user, setUser] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const ballPositionRef = useRef({ x: 0, y: 0 });
  const ballVelocityRef = useRef({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const headerRef = useRef(null);
  const hoopRef = useRef(null);
  const ballPlaceholderRef = useRef(null);
  const hoopPlaceholderRef = useRef(null);
  const isMobile = useIsMobile();
  const leftBlockRef = useRef(null);
  const rightBlockRef = useRef(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Rim position state
  const [rimPosition, setRimPosition] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  // Blocks position state
  const [blocksPosition, setBlocksPosition] = useState({
    leftBlock: { top: 0, bottom: 0, left: 0, right: 0 },
    rightBlock: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  // Toggle for showing the rim and blocks (set to false when done testing)
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Set initial ball position after component mounts
    resetBall();

    // Set initial hoop and blocks positions
    updateHoopPosition();
    calculateRimPosition();
    calculateBlocksPosition();

    // Handle window resize for confetti and positions
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
      updateHoopPosition();
      resetBall();
      calculateRimPosition();
      calculateBlocksPosition();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const calculateRimPosition = () => {
    if (hoopRef.current && headerRef.current) {
      const hoopRect = hoopRef.current.getBoundingClientRect();
      const headerRect = headerRef.current.getBoundingClientRect();

      // Adjust these values based on your image and alignment
      const rimTopOffset = 30; // Vertical alignment
      const rimLeftOffset = 45; // Horizontal alignment
      const rimThickness = 10; // Rim thickness in pixels
      const rimWidth = 70; // Rim width in pixels

      const rimTop = hoopRect.top - headerRect.top + rimTopOffset;
      const rimBottom = rimTop + rimThickness;
      const rimLeft = hoopRect.left - headerRect.left + rimLeftOffset;
      const rimRight = rimLeft + rimWidth;

      setRimPosition({
        top: rimTop,
        bottom: rimBottom,
        left: rimLeft,
        right: rimRight,
      });
    }
  };

  const calculateBlocksPosition = () => {
    if (leftBlockRef.current && rightBlockRef.current && headerRef.current) {
      const headerRect = headerRef.current.getBoundingClientRect();
      const leftBlockRect = leftBlockRef.current.getBoundingClientRect();
      const rightBlockRect = rightBlockRef.current.getBoundingClientRect();

      const leftBlockPosition = {
        top: leftBlockRect.top - headerRect.top - 45,
        bottom: leftBlockRect.bottom - headerRect.top -80,
        left: leftBlockRect.left - headerRect.left -10,
        right: leftBlockRect.right -10 - headerRect.left,
      };

      const rightBlockPosition = {
        top: leftBlockRect.top - headerRect.top - 45,
        bottom: leftBlockRect.bottom - headerRect.top -80,
        left: rightBlockRect.left - headerRect.left +20,
        right: rightBlockRect.right - headerRect.left+10,
      };

      setBlocksPosition({
        leftBlock: leftBlockPosition,
        rightBlock: rightBlockPosition,
      });
    }
  };

  const updateHoopPosition = () => {
    if (hoopPlaceholderRef.current && headerRef.current && hoopRef.current) {
      const placeholderRect = hoopPlaceholderRef.current.getBoundingClientRect();
      const headerRect = headerRef.current.getBoundingClientRect();

      const x = placeholderRect.left - headerRect.left;
      const y = placeholderRect.top - headerRect.top;

      hoopRef.current.style.left = `${x}px`;
      hoopRef.current.style.top = `${y}px`;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
    } catch (err) {
      console.error('Logout error:', err);
      alert('An error occurred during logout. Please try again.');
    }
  };

  // Handle mouse down on the basketball
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const headerRect = headerRef.current.getBoundingClientRect();
    const x = e.clientX - headerRect.left ;
    const y = e.clientY - headerRect.top ;
    setStartX(x);
    setStartY(y);
    setBallPosition({ x: x - 25, y: y - 25 }); // Adjust for ball size
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (isDragging) {
      const headerRect = headerRef.current.getBoundingClientRect();
      const x = e.clientX - headerRect.left ;
      const y = e.clientY - headerRect.top ;
      setBallPosition({ x: x - 25, y: y - 25 }); // Adjust for ball size
    }
  };

  // Handle mouse up
  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      const headerRect = headerRef.current.getBoundingClientRect();
      const x = e.clientX - headerRect.left;
      const y = e.clientY - headerRect.top;
      // Calculate the drag distance
      const dx = startX - x;
      const dy = startY - y;
      // Calculate velocity
      const velocityX = dx * 0.2; // Adjust multiplier for speed
      const velocityY = dy * 0.2;
      ballVelocityRef.current = { x: velocityX, y: velocityY };
      // Start the animation
      requestAnimationFrame(animateBall);
    }
  };

  // Animate the ball
  const animateBall = () => {
    // Update position
    ballPositionRef.current.x += ballVelocityRef.current.x;
    ballPositionRef.current.y += ballVelocityRef.current.y;

    // Apply damping (air resistance)
    const damping = 0.98;
    ballVelocityRef.current.x *= damping;
    ballVelocityRef.current.y *= damping;

    // Apply gravity
    ballVelocityRef.current.y += 0.2; // Adjust gravity as needed

    // Update state to re-render
    setBallPosition({ x: ballPositionRef.current.x, y: ballPositionRef.current.y });

    // Check for collision with blocks
    checkCollisionWithBlocks();

    // Check for scoring
    if (checkScore(ballPositionRef.current.x, ballPositionRef.current.y)) {
      setShowConfetti(true);
      // Reset the ball after a delay
      setTimeout(() => {
        resetBall();
        setShowConfetti(false);
      }, 2000);
      return;
    }

    // If ball goes off the header, reset
    const headerRect = headerRef.current.getBoundingClientRect();
    if (
      ballPositionRef.current.y > headerRect.height ||
      ballPositionRef.current.x < 0 ||
      ballPositionRef.current.x > headerRect.width
    ) {
      resetBall();
      return;
    }

    // Continue animation
    requestAnimationFrame(animateBall);
  };

  // Check collision with blocks and bounce the ball
  const checkCollisionWithBlocks = () => {
    const ballSize = 50;
    const ballX = ballPositionRef.current.x;
    const ballY = ballPositionRef.current.y;

    const ballRect = {
      top: ballY,
      bottom: ballY + ballSize,
      left: ballX,
      right: ballX + ballSize,
    };

    const { leftBlock, rightBlock } = blocksPosition;

    const blocks = [leftBlock, rightBlock];

    blocks.forEach((block) => {
      if (
        ballRect.right > block.left &&
        ballRect.left < block.right &&
        ballRect.bottom > block.top &&
        ballRect.top < block.bottom
      ) {
        // Collision detected with block

        // Determine the overlap on both axes
        const overlapX = Math.min(ballRect.right, block.right) - Math.max(ballRect.left, block.left);
        const overlapY = Math.min(ballRect.bottom, block.bottom) - Math.max(ballRect.top, block.top);

        if (overlapX < overlapY) {
          // Horizontal collision
          if (ballVelocityRef.current.x > 0) {
            // Moving right, collided with left side of block
            ballPositionRef.current.x -= overlapX;
          } else {
            // Moving left, collided with right side of block
            ballPositionRef.current.x += overlapX;
          }
          ballVelocityRef.current.x *= -1; // Reverse X velocity
        } else {
          // Vertical collision
          if (ballVelocityRef.current.y > 0) {
            // Moving down, collided with top of block
            ballPositionRef.current.y -= overlapY;
          } else {
            // Moving up, collided with bottom of block
            ballPositionRef.current.y += overlapY;
          }
          ballVelocityRef.current.y *= -1; // Reverse Y velocity
        }
      }
    });
  };

  // Check if the ball goes through the hoop correctly
  const checkScore = (x, y) => {
    const ballSize = 50;
    const ballCenterX = x + ballSize / 2;
    const ballCenterY = y + ballSize / 2;

    const { top: rimTop, bottom: rimBottom, left: rimLeft, right: rimRight } = rimPosition;

    // Ball must be within the rim area
    const withinRim =
      ballCenterX > rimLeft &&
      ballCenterX < rimRight &&
      ballCenterY > rimTop &&
      ballCenterY < rimBottom &&
      ballVelocityRef.current.y > 0; // Ball is moving downward

    // Ensure the ball has not collided with the blocks
    const { leftBlock, rightBlock } = blocksPosition;
    const ballRect = {
      top: y,
      bottom: y + ballSize,
      left: x,
      right: x + ballSize,
    };

    const collidesWithLeftBlock =
      ballRect.right > leftBlock.left &&
      ballRect.left < leftBlock.right &&
      ballRect.bottom > leftBlock.top &&
      ballRect.top < leftBlock.bottom;

    const collidesWithRightBlock =
      ballRect.right > rightBlock.left &&
      ballRect.left < rightBlock.right &&
      ballRect.bottom > rightBlock.top &&
      ballRect.top < rightBlock.bottom;

    if (withinRim && !collidesWithLeftBlock && !collidesWithRightBlock) {
      return true;
    }
    return false;
  };

  const resetBall = () => {
    if (ballPlaceholderRef.current && headerRef.current) {
      const placeholderRect = ballPlaceholderRef.current.getBoundingClientRect();
      const headerRect = headerRef.current.getBoundingClientRect();

      const x = placeholderRect.left - headerRect.left -40;
      const y = placeholderRect.top - headerRect.top -10;

      ballPositionRef.current = { x: x, y: y };
      ballVelocityRef.current = { x: 0, y: 0 };
      setBallPosition(ballPositionRef.current);
    }
  };

  useEffect(() => {
    // Add event listeners for mouse move and mouse up
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <header className="header-container" ref={headerRef}>
      <div className="header-content">
        {/* Home Button on the far left */}
        <Link to="/" className="go-home-button">
          <FaHome size={50} className="home-icon" />
        </Link>

        {/* Title in the center */}
        <div className="header-left">
          <h1 className="header-title">
            {isMobile ? (
              // On mobile, display two basketball emojis
              <>
                <span className="static-basketball">🏀</span>
                NBA Predictions
                <span className="static-basketball">🏀</span>
              </>
            ) : (
              // On desktop, display the interactive basketball and hoop placeholders
              <>
                {/* Basketball Placeholder */}
                <span className="basketball-placeholder" ref={ballPlaceholderRef}></span>
                NBA Predictions
                {/* Hoop Placeholder */}
                <span className="hoop-placeholder" ref={hoopPlaceholderRef}></span>
              </>
            )}
          </h1>
          <p className="header-subtitle">Your ultimate playoff and award picks</p>
        </div>

        {/* Interactive Basketball for Desktop */}
        {!isMobile && (
          <>
            {/* Basketball emoji (interactive) */}
            <div
              className="basketball"
              onMouseDown={handleMouseDown}
              style={{
                left: ballPosition.x,
                top: ballPosition.y,
              }}
            >
              🏀
            </div>

            {/* Basketball Hoop */}
            <div className="hoop" ref={hoopRef}>
              <img src="/hoop.png" alt="Hoop" className="hoop-image" />

              {/* Left Block */}
              <div className="block left-block" ref={leftBlockRef} style={{ opacity: showDebug ? 1 : 0 }}></div>

              {/* Right Block */}
              <div className="block right-block" ref={rightBlockRef} style={{ opacity: showDebug ? 1 : 0 }}></div>
            </div>
          </>
        )}

        {/* Stacked Buttons on the far right */}
        <div className="header-right">
          <div className="stacked-buttons">
            <Link to="/legacy" className="legacy-button">
              Legacy
            </Link>
            <Link to="/scoring" className="nav-button">
              Scoring
            </Link>
            {user && (
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confetti effect */}
      {showConfetti && !isMobile && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={300}
        />
      )}

      {/* Visualize the rim and blocks (only for desktop) */}
      {showDebug && !isMobile && (
        <>
          {/* Rim Visualization */}
          <div
            style={{
              position: 'absolute',
              left: rimPosition.left,
              top: rimPosition.top,
              width: rimPosition.right - rimPosition.left,
              height: rimPosition.bottom - rimPosition.top,
              border: '2px solid red',
              backgroundColor: 'rgba(255, 0, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          ></div>
          {/* Left Block Visualization */}
          <div
            style={{
              position: 'absolute',
              left: blocksPosition.leftBlock.left,
              top: blocksPosition.leftBlock.top,
              width: blocksPosition.leftBlock.right - blocksPosition.leftBlock.left,
              height: blocksPosition.leftBlock.bottom - blocksPosition.leftBlock.top,
              border: '2px solid blue',
              backgroundColor: 'rgba(0, 0, 255, 0.3)',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          ></div>
          {/* Right Block Visualization */}
          <div
            style={{
              position: 'absolute',
              left: blocksPosition.rightBlock.left,
              top: blocksPosition.rightBlock.top,
              width: blocksPosition.rightBlock.right - blocksPosition.rightBlock.left,
              height: blocksPosition.rightBlock.bottom - blocksPosition.rightBlock.top,
              border: '2px solid blue',
              backgroundColor: 'rgba(0, 0, 255, 0.3)',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          ></div>
        </>
      )}
    </header>
  );
}

export default Header;
