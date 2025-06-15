import React, { useState, useEffect } from 'react';

function App() {
  const initialToken = localStorage.getItem('app_token');
  const [token, setToken] = useState(initialToken);
  const [showTokenInput, setShowTokenInput] = useState(!initialToken);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    
    if (token && showTokenInput && !loading) {
      setLoading(true);

      if (window.electron && window.electron.checkToken) {
        window.electron.checkToken(token)
          .then(isValid => {
            setLoading(false);
          })

          if (isValid) {
            setShowTokenInput(false);
          } else {
            alert('Сохраненный токен недействителен. Введите новый.');
            setToken(null);
            localStorage.removeItem('app_token');
          }
      }
    }
  }, [token, showTokenInput, loading]);

  const handleTokenSubmit = async (e) => { // ОБЯЗАТЕЛЬНО async, чтобы использовать await
    e.preventDefault();
    const inputToken = e.target.elements.tokenInput.value;

    if (!inputToken) {
      alert('Пожалуйста, введите токен.');
      return;
    }

    setLoading(true); // Начинаем загрузку

    if (window.electron && window.electron.checkToken) {
      try {
        const isValid = await window.electron.checkToken(inputToken);
        setLoading(false);

        if (isValid) {
          setToken(inputToken);
          localStorage.setItem('app_token', inputToken);
          setShowTokenInput(false);
        } else {
          alert('Неверный токен! Пожалуйста, попробуйте снова.');
          setToken(null);
          localStorage.removeItem('app_token');
          setShowTokenInput(true);
        }
      } catch (error) {
        console.error("Error during token submission:", error);
        setLoading(false);
        alert('Произошла ошибка при проверке токена. Пожалуйста, попробуйте еще раз.');
        setToken(null);
        localStorage.removeItem('app_token');
        setShowTokenInput(true);
      }
    }
  };

  if (showTokenInput) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Введите ваш токен</h1>
        <form onSubmit={handleTokenSubmit}>
          <input type="text" 
          name="tokenInput" 
          placeholder="Токен" 
          required 
          disabled={loading} 
          />
          <button 
          type="submit" 
          disabled={loading}
          >{loading ? 'Проверка...' : 'Подтвердить'}</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Добро пожаловать в основное приложение!</h1>
      <p>Ваш токен: {token}</p>
    </div>
  );
}

export default App;