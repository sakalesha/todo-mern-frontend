import React, { useState, useEffect } from 'react';
import axios from 'axios';
import packageJson from '../package.json';  // adjust path as needed

const VersionDisplay = () => {
  const [backendVersion, setBackendVersion] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/version`)
      .then(res => setBackendVersion(res.data.version))
      .catch(() => setBackendVersion('Unavailable'));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
      Version: Frontend {packageJson.version} / Backend {backendVersion}
    </div>
  );
};

export default VersionDisplay;
