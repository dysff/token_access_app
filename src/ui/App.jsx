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

    if (!inputToken) {
      alert('Пожалуйста, введите токен.');
      return;
    }

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

  return (
    <div>
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
          CALCULATION RESULT: <span style={{fontWeight: 'bold'}}>{calculationResult}</span>
        </p>
      )}
    </div>
  )
}

export default App;