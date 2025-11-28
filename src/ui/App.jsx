import React, { useState, useEffect, useRef  } from 'react';
import './App.css';

function App() {
  const initialToken = localStorage.getItem('app_token');
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState('invalid');
  const initialTokenCheckCompleted = useRef(false);

  const [calculationResult, setCalculationResult] = useState(null);
  const [calculationError, setCalculationError] = useState(null);

  const initialLogIn = localStorage.getItem('logged_in') === true;
  const [isLoggedIn, setLoggedIn] = useState(initialLogIn);
  
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showRegistrationProcessInfo, setShowRegistrationProcessInfo] = useState(null);

  useEffect(() => {
    
    if (token && !initialTokenCheckCompleted.current && !loading) {
      setLoading(true);

      if (window.electron && window.electron.checkToken) {
        window.electron.checkToken(token)
          .then(isValid => {
            setLoading(false);

            if (isValid) {
              setTokenStatus('valid');
            } else {
              setToken(null);
              localStorage.removeItem('app_token');
              setTokenStatus('invalid')
            }
          })
      }
      initialTokenCheckCompleted.current = true;
    }
  }, [token, loading]);

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    const inputToken = e.target.elements.tokenInput.value;

    setLoading(true);

    if (window.electron && window.electron.checkToken) {
      try {
        const isValid = await window.electron.checkToken(inputToken);
        setLoading(false);

        if (isValid) {
          setToken(inputToken);
          localStorage.setItem('app_token', inputToken);
          setTokenStatus('valid');
        } else {
          setToken(null);
          localStorage.removeItem('app_token');
          setTokenStatus('invalid');
        };
      } catch (error) {
        console.error("Error during token submission:", error);
        setLoading(false);
        setToken(null);
        localStorage.removeItem('app_token');
      };
    };
  };

  const handleCalculation = async (e) => {
    e.preventDefault(); // Why is it required here?
    const valueA = e.target.elements.valueA.value;
    const valueB = e.target.elements.valueB.value;

    if (tokenStatus === 'valid') {
      try {
        const result = await window.electron.makeCalculation(valueA, valueB);

        if (result.success === false) {
          setCalculationError(result.error);
          setCalculationResult(null);
        } else {
          setCalculationError(null);
          setCalculationResult(result.result);
        }
      } catch (error) {
        console.error('Error during calculations submission: ', error);
        setCalculationResult(null);
      };
    };
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    const name = e.target.elements.name_register.value;
    const email = e.target.elements.email_register.value;
    const password = e.target.elements.password_register.value;

    try {
      const match = await window.electron.checkDatabaseMatch(email);

      if (match.success === true) {
        
        if (match.match === true) {
          setShowRegistrationProcessInfo('This email is already in use');

        } else {
          setShowRegistrationProcessInfo(null);
          const reg_result = await window.electron.makeRegistration(name, email, password);

          if (reg_result.success === true) {
            setShowRegistrationProcessInfo('User successfully registered');
          } else {
            setShowRegistrationProcessInfo(reg_result.error);
          };
        };
      } else {
        setShowRegistrationProcessInfo(match.error);
      };

    } catch (err) {
      console.log('Error occured during registration process: ', err);
    };
  };

  return (
    <div className='login_register'>
        {!isLoggedIn ? (
          !showRegistrationForm ? (
          <div>
            <h1>
              Login
            </h1>

            <form>
              <input
                type='text'
                name='email_login'
                placeholder='Email'
              >
              </input>

              <input
                type='text'
                name='password_login'
                placeholder='Password'
              >
              </input>

              <button>
                Login
              </button>

              <p>
                Don't have an account?{' '}
                <span
                className='auth-link'
                onClick={() => setShowRegistrationForm(true)}
                > 
                  Register
                </span>
              </p>
            </form>
          </div>
        ) : (
          <div>
            <h1>
              Register
            </h1>

            <form
            onSubmit={handleRegistration}
            >
              <input
              type='text'
              name='name_register'
              placeholder='Name'
              >
              </input>

              <input
              type='text'
              name='email_register'
              placeholder='Email'
              >
              </input>

              <input
              type='text'
              name='password_register'
              placeholder='Password'
              >
              </input>

              <button>
                Register
              </button>
              
              <p>
                Already have an account?{' '}
                <span
                className='auth-link'
                onClick={() => { setShowRegistrationForm(false), setShowRegistrationProcessInfo(null) }}
                >
                  Login
                </span>
              </p>

              {showRegistrationProcessInfo && (
                <p>
                  {showRegistrationProcessInfo}
                </p>
              )}
            </form>
          </div>
        )
        ) : (
            <div className='app'>
                <h1
                    style={{
                        fontSize: '28px'
                    }}>
                    Set up your calculations
                </h1>

                <p
                    style={{
                        marginTop: '-10px',
                        fontFamily: 'Roboto',
                    }}>
                    Enter your access token and values
                </p>

                <form onSubmit={handleTokenSubmit}>
                    <div>
                        <input
                            type='text'
                            name='tokenInput'
                            placeholder={token ? localStorage.getItem('app_token') : 'Access token'}
                            disabled={loading}
                        >
                        </input>
                        {!loading && tokenStatus === 'valid' && <span className="status-icon valid">✅</span>}
                        {!loading && tokenStatus === 'invalid' && <span className="status-icon invalid">❌</span>}
                    </div>
                </form>

                <p>
                    Input numbers for calculation
                </p>

                <form onSubmit={handleCalculation}>
                    <input
                        type='text'
                        name='valueA'
                        placeholder='Value A'
                    >
                    </input>

                    <input
                        type='text'
                        name='valueB'
                        placeholder='Value B'
                    >
                    </input>

                    <button>
                        Calculate
                    </button>
                </form>

                {tokenStatus !== 'valid' && (
                    <p>
                        Please, enter your access token to get access to the functional
                    </p>
                )}

                {calculationError !== null && (
                    <p>
                        Error occured during calculation: {calculationError}
                    </p>
                )}

                {calculationResult !== null && (
                    <p>
                        CALCULATION RESULT: <span style={{ fontWeight: 'bold' }}>{calculationResult}</span>
                    </p>
                )}
            </div>
        )}
    </div>
  );
}

export default App;