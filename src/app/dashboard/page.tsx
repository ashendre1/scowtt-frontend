"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import './dashboard.css';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [favoriteMovie, setFavoriteMovie] = useState('');
  const [funFact, setFunFact] = useState('');
  const [isSubmittingMovie, setIsSubmittingMovie] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoadingFact, setIsLoadingFact] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const token = searchParams.get('token');
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const photo = searchParams.get('photo');
    const favoriteMovieParam = searchParams.get('favoriteMovie');
    const funFactFromUrl = searchParams.get('funFact');
    console.log("refresh")

    if (token) {

      localStorage.setItem('token', token);
      const googleUser = { 
        username, 
        email, 
        photo, 
        favoriteMovie: favoriteMovieParam || '' 
      };
      localStorage.setItem('user', JSON.stringify(googleUser));
      setUser(googleUser);
      
      if (funFactFromUrl) {
        setFunFact(decodeURIComponent(funFactFromUrl));
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        if (userData.favoriteMovie) {
          setIsLoadingFact(true);
          getNewFunFact();
        }
      } else {
        const basicUser = {
          username: 'User',
          email: null,
          photo: null,
          favoriteMovie: null
        };
        setUser(basicUser);
        localStorage.setItem('user', JSON.stringify(basicUser));
      }
    }
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [user?.photo]);

  useEffect(() => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  console.log("empty useEFfect")
  if (storedUser && storedToken) {
    const userData = JSON.parse(storedUser);
    
    const mappedUser = {
      id: userData.id,
      username: userData.username, 
      email: userData.email,
      photo: userData.photo || null,
      favoriteMovie: userData.movie || userData.favoriteMovie || ''
    };
    
    setUser(mappedUser);
    if (userData.funFact) {
      setFunFact(userData.funFact);
    }
    
    localStorage.setItem('user', JSON.stringify(mappedUser));
  }
}, []);

  const handleSubmitFavoriteMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!favoriteMovie.trim()) return;

    setIsSubmittingMovie(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:4000/api/movies/fun-fact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ movieName: favoriteMovie.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const updatedUser = { ...user, favoriteMovie: favoriteMovie.trim() };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setFunFact(data.funFact);
        //setFavoriteMovie('');
      } else {
        alert(data.error || 'Failed to get fun fact');
        if (res.status === 401) {
          handleTokenExpired();
        }
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmittingMovie(false);
    }
  };

  const getNewFunFact = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found');
        return;
      }

      const res = await fetch('http://localhost:4000/api/movies/refresh-fact', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.funFact) {
          setFunFact(data.funFact);
        } else {
          setFunFact('');
        }
      } else {
        console.error('Error getting fun fact:', data.error);
        if (res.status === 401) {
          handleTokenExpired();
        }
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setIsLoadingFact(false);
    }
  };

  const handleTokenExpired = () => {
    alert('Session expired, please login again');
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to Dashboard</h1>
        <div className="header-actions">

          <button className="logout-btn" onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}>
            Logout
          </button>
        </div>
      </div>
      
      <div className="user-card">
        <div className="user-avatar">
          {user.photo && !imageError ? (
            <img 
              src={user.photo} 
              alt="Profile" 
              className={`profile-image ${imageLoaded ? 'loaded' : 'loading'}`}
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.log('Image failed to load:', user.photo);
                setImageError(true);
              }}
            />
          ) : (
            <div className="avatar-placeholder">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        
        <div className="user-details">
          <h2 className="user-name">{user.username || 'User'}</h2>
          {user.email && <p className="user-email">{user.email}</p>}
        </div>
      </div>

      <div className="dashboard-content">
        {/* Two-column layout */}
        <div className="content-grid">
          {/* Left Column - Account Information */}
          <div className="info-section">
            <h3 className="section-title">Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Display Name:</label>
                <span>{user.username || 'N/A'}</span>
              </div>
              {user.email && (
                <div className="info-item">
                  <label>Email:</label>
                  <span>{user.email}</span>
                </div>
              )}
              <div className="info-item">
                <label>Favorite Movie:</label>
                <span>{user.favoriteMovie || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Movie Section */}
          <div className="movie-section">
            {!user.favoriteMovie && !funFact ? (
              /* Show movie prompt */
              <div className="movie-prompt-card">
                <h3 className="section-title">What's your favorite movie?</h3>
                <p className="movie-prompt-subtitle">Tell us your favorite movie and we'll share a fun fact about it!</p>
                
                <form onSubmit={handleSubmitFavoriteMovie} className="movie-form">
                  <input
                    type="text"
                    className="movie-input"
                    placeholder="Enter your favorite movie..."
                    value={favoriteMovie}
                    onChange={(e) => setFavoriteMovie(e.target.value)}
                    required
                    disabled={isSubmittingMovie}
                  />
                  <button 
                    type="submit" 
                    className="movie-submit-btn"
                    disabled={isSubmittingMovie || !favoriteMovie.trim()}
                  >
                    {isSubmittingMovie ? 'Getting Fun Fact...' : 'Get Fun Fact'}
                  </button>
                </form>
              </div>
            ) : (
              /* Show fun fact */
              <div className="fun-fact-section">
                <h3 className="section-title">🎬 Fun Movie Fact</h3>
                <div className="fun-fact-card">
                  {user.favoriteMovie && (
                    <p className="movie-title">About "{user.favoriteMovie}":</p>
                  )}
                  
                  {isLoadingFact ? (
                    <div className="loading-fact">
                      <p>Loading a new fun fact...</p>
                    </div>
                  ) : (
                    <div className="fun-fact-content">
                      <p className="fun-fact-text">{funFact}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}