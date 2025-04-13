import React, { useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchAnalytics, getQRCode } from '../../redux/slices/urlSlice';
import './AnalyticsDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Custom label function for pie charts
const renderCustomLabel = (props: any) => {
  const { name, percent } = props;
  return `${name}: ${(percent * 100).toFixed(0)}%`;
};

const AnalyticsDashboard = ({ urlCode }: { urlCode: string }) => {
  const dispatch = useAppDispatch();
  const analyticsData = useAppSelector(state => state.url.analyticsData);
  const analyticsLoading = useAppSelector(state => state.url.analyticsLoading);
  const qrCodeUrl = useAppSelector(state => state.url.qrCodeUrl);
  
  useEffect(() => {
    dispatch(fetchAnalytics(urlCode));
  }, [dispatch, urlCode]);

  if (analyticsLoading) {
    return <div className="analytics-loading">Loading analytics data...</div>;
  }

  if (!analyticsData) {
    return <div className="analytics-empty">No analytics data available</div>;
  }

  const { analytics, visitCount } = analyticsData;

  // Process data for charts
  const processTimeData = () => {
    // Group by date for clicks over time
    const clicksByDate: Record<string, number> = {};
    
    analytics?.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });
    
    return Object.keys(clicksByDate).map(date => ({
      date,
      clicks: clicksByDate[date]
    }));
  };

  const processDeviceData = () => {
    // Group by device type
    const deviceCounts: Record<string, number> = {};
    
    analytics?.forEach(entry => {
      const device = entry.device || 'Unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    
    return Object.keys(deviceCounts).map(device => ({
      name: device,
      value: deviceCounts[device]
    }));
  };

  const processBrowserData = () => {
    // Group by browser
    const browserCounts: Record<string, number> = {};
    
    analytics?.forEach(entry => {
      const browser = entry.browser || 'Unknown';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });
    
    return Object.keys(browserCounts).map(browser => ({
      name: browser,
      value: browserCounts[browser]
    }));
  };

  const timeData = processTimeData();
  const deviceData = processDeviceData();
  const browserData = processBrowserData();

  // Generate QR Code
  const handleGenerateQRCode = () => {
    dispatch(getQRCode(urlCode));
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Analytics for URL: {urlCode}</h2>
        <div className="total-clicks">
          <span className="total-clicks-label">Total Clicks:</span>
          <span className="total-clicks-value">{visitCount}</span>
        </div>
      </div>

      <div className="charts-container">
        {/* Clicks Over Time Chart */}
        <div className="chart-box">
          <h3>Clicks Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={timeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="clicks" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="chart-box">
          <h3>Device Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Browser Breakdown */}
        <div className="chart-box">
          <h3>Browser Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={browserData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {browserData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="qr-code-section">
        <h3>QR Code</h3>
        <div className="qr-code-container">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code" className="qr-code-image" />
          ) : (
            <button className="generate-qr-btn" onClick={handleGenerateQRCode}>
              Generate QR Code
            </button>
          )}
        </div>
      </div>

      <div className="raw-data-section">
        <h3>Recent Visits</h3>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Device</th>
              <th>Browser</th>
              <th>OS</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {analytics?.slice(0, 10).map((entry, index) => (
              <tr key={index}>
                <td>{new Date(entry.timestamp).toLocaleString()}</td>
                <td>{entry.device || 'Unknown'}</td>
                <td>{entry.browser || 'Unknown'}</td>
                <td>{entry.os || 'Unknown'}</td>
                <td>{entry.location || 'Unknown'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 