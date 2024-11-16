import React, { useEffect, useState } from 'react';
import contract from './contract';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await contract.methods.yourMethod().call();
      setData(result);
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>Smart Contract Data</h1>
      {data && <p>{data}</p>}
    </div>
  );
}

export default App;