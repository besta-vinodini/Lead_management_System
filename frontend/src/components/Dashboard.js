import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosInstance'; // ✅ use axios instance
import './Dashboard.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Cell renderer components
const SourceRenderer = (params) => {
  const source = params.value;
  const colors = {
    website: '#4CAF50',
    facebook_ads: '#3B5998',
    google_ads: '#4285F4',
    referral: '#FF9800',
    events: '#9C27B0',
    other: '#607D8B',
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
    new: '#2196F3',
    contacted: '#FF9800',
    qualified: '#4CAF50',
    lost: '#F44336',
    won: '#8BC34A',
  };
  return (
    <span style={{ color: colors[status] || '#000', fontWeight: 'bold' }}>
      {status}
    </span>
  );
};

const QualifiedRenderer = (params) => (params.value ? '✅' : '❌');

const ActionsRenderer = (params) => (
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

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({});
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const memoizedLeads = useMemo(() => leads, [leads]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const gridOptions = useMemo(
    () => ({
      pagination: true,
      paginationPageSize: 20,
      paginationPageSizeSelector: [10, 20, 50, 100],
      animateRows: true,
      rowSelection: { type: 'single' },
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: 'agTextColumnFilter',
      },
    }),
    []
  );

  const columnDefs = useMemo(
    () => [
      { field: '_id', headerName: 'ID', width: 80 },
      { field: 'firstName', headerName: 'First Name', width: 120 },
      { field: 'lastName', headerName: 'Last Name', width: 120 },
      { field: 'email', headerName: 'Email', width: 200 },
      { field: 'phone', headerName: 'Phone', width: 150 },
      { field: 'company', headerName: 'Company', width: 150 },
      { field: 'city', headerName: 'City', width: 120 },
      { field: 'state', headerName: 'State', width: 80 },
      {
        field: 'source',
        headerName: 'Source',
        width: 120,
        cellRenderer: SourceRenderer,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        cellRenderer: StatusRenderer,
      },
      { field: 'score', headerName: 'Score', width: 100 },
      {
        field: 'leadValue',
        headerName: 'Lead Value',
        width: 120,
        valueFormatter: (params) =>
          `$${params.value?.toLocaleString() || 0}`,
      },
      {
        field: 'isQualified',
        headerName: 'Qualified',
        width: 100,
        cellRenderer: QualifiedRenderer,
      },
      { field: 'createdAt', headerName: 'Created', width: 150 },
      {
        headerName: 'Actions',
        width: 150,
        cellRenderer: ActionsRenderer,
        sortable: false,
        filter: false,
      },
    ],
    []
  );

  const fetchLeads = useCallback(
    async (page = 1, limit = 20, filterParams = {}) => {
      try {
        if (isInitialLoad || page === 1) setLoading(true);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...filterParams,
        });

        const response = await axiosInstance.get(`/leads?${params}`);

        setLeads(response.data.data);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        });

        if (isInitialLoad) setIsInitialLoad(false);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    },
    [isInitialLoad]
  );

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

      if (
        currentPage !== pagination.page ||
        pageSize !== pagination.limit
      ) {
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
        await axiosInstance.delete(`/leads/${id}`);
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
          <span>
            Welcome, {user?.firstName} {user?.lastName}
          </span>
          <button onClick={handleAddLead} className="btn-primary">
            Add Lead
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
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
            <p>{leads.filter((lead) => lead.isQualified).length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Value</h3>
            <p>
              $
              {leads
                .reduce(
                  (sum, lead) => sum + (lead.leadValue || 0),
                  0
                )
                .toLocaleString()}
            </p>
          </div>
        </div>

        <div className="leads-grid">
          <div
            className="ag-theme-alpine"
            style={{ height: '600px', width: '100%' }}
          >
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
                ActionsRenderer,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
