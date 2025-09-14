import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Dashboard.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://lead-management-system-beta-ten.vercel.app/api';

// Cell renderer components
const SourceRenderer = (params) => {
  const source = params.value;
  const colors = {
    'website': '#4CAF50',
    'facebook_ads': '#3B5998',
    'google_ads': '#4285F4',
    'referral': '#FF9800',
    'events': '#9C27B0',
    'other': '#607D8B'
  };
  return (
    <span style={{ color: colors[source] || '#000', fontWeight: 'bold' }}>
      {source}
    </span>
  );
};

const StatusRenderer = (params) => {
  const status = params.value;
  const colors = {
    'new': '#2196F3',
    'contacted': '#FF9800',
    'qualified': '#4CAF50',
    'lost': '#F44336',
    'won': '#8BC34A'
  };
  return (
    <span style={{ color: colors[status] || '#000', fontWeight: 'bold' }}>
      {status}
    </span>
  );
};

const QualifiedRenderer = (params) => {
  return params.value ? '✅' : '❌';
};

const ActionsRenderer = (params) => {
  return (
    <div>
      <button 
        onClick={() => window.editLead(params.data._id)} 
        className="btn-edit"
        style={{ marginRight: '5px', padding: '2px 8px', fontSize: '12px' }}
      >
        Edit
      </button>
      <button 
        onClick={() => window.deleteLead(params.data._id)} 
        className="btn-delete"
        style={{ padding: '2px 8px', fontSize: '12px' }}
      >
        Delete
      </button>
    </div>
  );
};

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({});
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Memoize row data to prevent unnecessary re-renders
  const memoizedLeads = useMemo(() => leads, [leads]);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Memoize grid options to prevent re-renders
  const gridOptions = useMemo(() => ({
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [10, 20, 50, 100],
    suppressPaginationPanel: false,
    theme: "legacy",
    suppressRowHoverHighlight: false,
    suppressColumnVirtualisation: false,
    suppressRowVirtualisation: false,
    suppressNoRowsOverlay: false,
    animateRows: true,
    rowSelection: { type: 'single' },
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: 'agTextColumnFilter',
      suppressHeaderMenuButton: false,
      floatingFilter: false
    }
  }), []);

  const columnDefs = useMemo(() => [
    { field: '_id', headerName: 'ID', width: 80, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'firstName', headerName: 'First Name', width: 120, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'lastName', headerName: 'Last Name', width: 120, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'email', headerName: 'Email', width: 200, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'phone', headerName: 'Phone', width: 150, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'company', headerName: 'Company', width: 150, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'city', headerName: 'City', width: 120, sortable: true, filter: 'agTextColumnFilter' },
    { field: 'state', headerName: 'State', width: 80, sortable: true, filter: 'agTextColumnFilter' },
    { 
      field: 'source', 
      headerName: 'Source', 
      width: 120, 
      sortable: true, 
      filter: 'agTextColumnFilter',
      cellRenderer: SourceRenderer
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120, 
      sortable: true, 
      filter: 'agTextColumnFilter',
      cellRenderer: StatusRenderer
    },
    { field: 'score', headerName: 'Score', width: 100, sortable: true, filter: 'agNumberColumnFilter' },
    { 
      field: 'leadValue', 
      headerName: 'Lead Value', 
      width: 120, 
      sortable: true, 
      filter: 'agNumberColumnFilter', 
      valueFormatter: (params) => `$${params.value?.toLocaleString() || 0}` 
    },
    { 
      field: 'isQualified', 
      headerName: 'Qualified', 
      width: 100, 
      sortable: true, 
      filter: 'agTextColumnFilter',
      cellRenderer: QualifiedRenderer
    },
    { field: 'createdAt', headerName: 'Created', width: 150, sortable: true, filter: 'agDateColumnFilter' },
    {
      headerName: 'Actions',
      width: 150,
      cellRenderer: ActionsRenderer,
      suppressHeaderMenuButton: true,
      sortable: false,
      filter: false
    }
  ], []);

  const fetchLeads = useCallback(async (page = 1, limit = 20, filterParams = {}) => {
    try {
      // Only show loading for initial load or when explicitly needed
      if (isInitialLoad || page === 1) {
        setLoading(true);
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filterParams
      });

      const response = await axios.get(`${API_BASE_URL}/leads?${params}`);
      
      // Batch state updates to prevent multiple re-renders
      setLeads(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
      
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const onGridReady = (params) => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
  };

  const onPaginationChanged = useCallback(() => {
    if (gridApi) {
      const currentPage = gridApi.paginationGetCurrentPage() + 1;
      const pageSize = gridApi.paginationGetPageSize();
      
      if (currentPage !== pagination.page || pageSize !== pagination.limit) {
        fetchLeads(currentPage, pageSize, filters);
      }
    }
  }, [gridApi, fetchLeads, filters, pagination.page, pagination.limit]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAddLead = () => {
    navigate('/leads/new');
  };

  // Global functions for action buttons
  window.editLead = (id) => {
    navigate(`/leads/${id}/edit`);
  };

  window.deleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await axios.delete(`${API_BASE_URL}/leads/${id}`);
        fetchLeads(pagination.page, pagination.limit, filters);
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Error deleting lead');
      }
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Lead Management System</h1>
        <div className="header-actions">
          <span>Welcome, {user?.firstName} {user?.lastName}</span>
          <button onClick={handleAddLead} className="btn-primary">Add Lead</button>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Leads</h3>
            <p>{pagination.total}</p>
          </div>
          <div className="stat-card">
            <h3>Qualified Leads</h3>
            <p>{leads.filter(lead => lead.isQualified).length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Value</h3>
            <p>${leads.reduce((sum, lead) => sum + (lead.leadValue || 0), 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="leads-grid">
          <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
            <AgGridReact
              key="leads-grid"
              columnDefs={columnDefs}
              rowData={memoizedLeads}
              onGridReady={onGridReady}
              onPaginationChanged={onPaginationChanged}
              rowSelection="single"
              {...gridOptions}
              components={{
                SourceRenderer,
                StatusRenderer,
                QualifiedRenderer,
                ActionsRenderer
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
