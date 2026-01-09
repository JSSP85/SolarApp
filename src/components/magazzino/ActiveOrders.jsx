// src/components/magazzino/ActiveOrders.jsx
import React, { useState, useEffect } from 'react';
import {
  Package,
  Calendar,
  User,
  Clock,
  CheckCircle,
  PlayCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  TrendingUp
} from 'lucide-react';
import {
  getAllSalesOrders,
  deleteSalesOrder,
  updateSalesOrderStatus
} from '../../firebase/salesOrderService';

const ActiveOrders = ({ onOrderUpdate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | in-progress | completed
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await getAllSalesOrders();
      setOrders(allOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    if (!window.confirm(`Are you sure you want to delete Sales Order ${orderNumber}?`)) {
      return;
    }

    try {
      await deleteSalesOrder(orderId);
      await loadOrders();
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateSalesOrderStatus(orderId, newStatus);
      await loadOrders();
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Pending' };
      case 'in-progress':
        return { icon: PlayCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'In Progress' };
      case 'completed':
        return { icon: CheckCircle, color: '#0077a2', bg: 'rgba(0, 119, 162, 0.1)', label: 'Completed' };
      default:
        return { icon: AlertCircle, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', label: 'Unknown' };
    }
  };

  const isOverdue = (deadline, status) => {
    if (status === 'completed') return false;
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="so-loading">
        <TrendingUp size={48} />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="so-active-orders">
      {/* Filter Tabs */}
      <div className="so-filter-tabs">
        <button
          className={`so-filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Orders ({orders.length})
        </button>
        <button
          className={`so-filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <Clock size={16} />
          Pending ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button
          className={`so-filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          <PlayCircle size={16} />
          In Progress ({orders.filter(o => o.status === 'in-progress').length})
        </button>
        <button
          className={`so-filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          <CheckCircle size={16} />
          Completed ({orders.filter(o => o.status === 'completed').length})
        </button>
      </div>

      {/* Orders List - Compact Cards */}
      {filteredOrders.length === 0 ? (
        <div className="so-empty-state">
          <Package size={64} />
          <h3>No orders found</h3>
          <p>Create a new sales order to get started</p>
        </div>
      ) : (
        <div className="so-orders-list">
          {filteredOrders.map(order => {
            const statusBadge = getStatusBadge(order.status);
            const StatusIcon = statusBadge.icon;
            const isExpanded = expandedOrders.has(order.id);
            const overdue = isOverdue(order.deadline, order.status);

            return (
              <div key={order.id} className={`so-order-wrapper ${isExpanded ? 'expanded' : ''}`}>
                {/* Compact Card - "Carátula" */}
                <div className={`so-card-compact ${order.status}`}>
                  <div className="so-compact-header">
                    <div className="so-compact-title-section">
                      <h3 className="so-compact-title">{order.salesOrderNumber}</h3>
                      <div
                        className="so-status-badge"
                        style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}
                      >
                        <StatusIcon size={14} />
                        <span>{statusBadge.label}</span>
                      </div>
                    </div>
                    <button
                      className="so-delete-btn"
                      onClick={() => handleDeleteOrder(order.id, order.salesOrderNumber)}
                      title="Delete order"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="so-compact-details">
                    <div className="so-compact-info">
                      <div className="so-compact-row">
                        <User size={16} />
                        <span className="so-compact-label">Customer:</span>
                        <span className="so-compact-value">{order.cliente}</span>
                      </div>
                      <div className="so-compact-row">
                        <Package size={16} />
                        <span className="so-compact-label">Project:</span>
                        <span className="so-compact-value">{order.nombreProyecto}</span>
                      </div>
                      <div className="so-compact-row">
                        <Calendar size={16} />
                        <span className="so-compact-label">Deadline:</span>
                        <span className={`so-compact-value ${overdue ? 'so-overdue' : ''}`}>
                          {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'No deadline'}
                          {overdue && <AlertCircle size={14} style={{ marginLeft: '4px' }} />}
                        </span>
                      </div>
                    </div>

                    <div className="so-compact-progress">
                      <div className="so-progress-header">
                        <span className="so-progress-label">Progress</span>
                        <span className="so-progress-percentage">{order.progress || 0}%</span>
                      </div>
                      <div className="so-progress-bar">
                        <div
                          className="so-progress-fill"
                          style={{
                            width: `${order.progress || 0}%`,
                            backgroundColor: order.progress === 100 ? '#10b981' :
                                           order.progress > 0 ? '#0077a2' : '#9ca3af'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="so-compact-footer">
                    <button
                      className="so-expand-items-btn"
                      onClick={() => toggleOrderExpand(order.id)}
                    >
                      <Package size={16} />
                      <span>View {order.items?.length || 0} Items</span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {order.status !== 'completed' && (
                      <div className="so-compact-actions">
                        {order.status === 'pending' && (
                          <button
                            className="so-action-btn-compact so-btn-start"
                            onClick={() => handleStatusChange(order.id, 'in-progress')}
                          >
                            <PlayCircle size={16} />
                            Start
                          </button>
                        )}
                        {order.status === 'in-progress' && (
                          <button
                            className="so-action-btn-compact so-btn-complete"
                            onClick={() => handleStatusChange(order.id, 'completed')}
                          >
                            <CheckCircle size={16} />
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Items Table - Full Width */}
                {isExpanded && (
                  <div className="so-items-expanded">
                    <div className="so-items-table-wrapper">
                      <table className="so-items-table-full">
                        <thead>
                          <tr>
                            <th>Line Item</th>
                            <th>Material Code</th>
                            <th>Description</th>
                            <th>Qty Required</th>
                            <th>Qty Prepared</th>
                            <th>Current Stock</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items?.map((item, idx) => {
                            const preparedPercent = item.quantityRequired > 0
                              ? (item.quantityPrepared / item.quantityRequired) * 100
                              : 0;

                            return (
                              <tr key={idx}>
                                <td className="so-line-item">{item.lineItem || idx + 1}</td>
                                <td className="so-material-code">{item.materialCode}</td>
                                <td className="so-description">{item.description}</td>
                                <td className="so-qty-required">{item.quantityRequired}</td>
                                <td className="so-qty-prepared" style={{
                                  color: preparedPercent >= 100 ? '#10b981' :
                                         preparedPercent > 0 ? '#f59e0b' : '#6b7280',
                                  fontWeight: 'bold'
                                }}>
                                  {item.quantityPrepared || 0}
                                </td>
                                <td className="so-current-stock" style={{
                                  color: (item.currentStock || 0) >= item.quantityRequired ? '#10b981' :
                                         (item.currentStock || 0) > 0 ? '#f59e0b' : '#ef4444',
                                  fontWeight: 'bold'
                                }}>
                                  {item.currentStock || 0}
                                </td>
                                <td>
                                  {preparedPercent >= 100 ? (
                                    <span className="so-item-status complete">
                                      <CheckCircle size={14} /> Complete
                                    </span>
                                  ) : preparedPercent > 0 ? (
                                    <span className="so-item-status partial">
                                      <Clock size={14} /> {Math.round(preparedPercent)}%
                                    </span>
                                  ) : (
                                    <span className="so-item-status pending">
                                      <AlertCircle size={14} /> Pending
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveOrders;
