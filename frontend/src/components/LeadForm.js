import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './LeadForm.css';


// API base URL setup
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://lead-management-system-bn67.vercel.app/api"
    : "http://localhost:5000/api");

console.log("🚀 API Base URL (Dashboard):", API_BASE_URL);




const LeadForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    state: '',
    source: 'website',
    status: 'new',
    score: 0,
    leadValue: 0,
    lastActivityAt: '',
    isQualified: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id && id !== 'new') {
      setIsEdit(true);
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leads/${id}`);
      const lead = response.data;
      setFormData({
        firstName: lead.first_name || '',
        lastName: lead.last_name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        city: lead.city || '',
        state: lead.state || '',
        source: lead.source || 'website',
        status: lead.status || 'new',
        score: lead.score || 0,
        leadValue: lead.lead_value || 0,
        lastActivityAt: lead.last_activity_at ? lead.last_activity_at.slice(0, 16) : '',
        isQualified: lead.is_qualified || false
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
      setError('Error fetching lead data');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        leadValue: parseFloat(formData.leadValue) || 0,
        score: parseInt(formData.score) || 0
      };

      if (isEdit) {
        await axios.put(`${API_BASE_URL}/leads/${id}`, submitData);
      } else {
        await axios.post(`${API_BASE_URL}/leads`, submitData);
      }

      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Error saving lead');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="lead-form-container">
      <div className="lead-form-card">
        <h2>{isEdit ? 'Edit Lead' : 'Create New Lead'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                maxLength="2"
                placeholder="e.g., CA"
              />
            </div>

            <div className="form-group">
              <label htmlFor="source">Source *</label>
              <select
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
              >
                <option value="website">Website</option>
                <option value="facebook_ads">Facebook Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
                <option value="won">Won</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="score">Score (0-100)</label>
              <input
                type="number"
                id="score"
                name="score"
                value={formData.score}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="leadValue">Lead Value ($)</label>
              <input
                type="number"
                id="leadValue"
                name="leadValue"
                value={formData.leadValue}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastActivityAt">Last Activity</label>
              <input
                type="datetime-local"
                id="lastActivityAt"
                name="lastActivityAt"
                value={formData.lastActivityAt}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isQualified"
                checked={formData.isQualified}
                onChange={handleChange}
              />
              Is Qualified
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : (isEdit ? 'Update Lead' : 'Create Lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;

