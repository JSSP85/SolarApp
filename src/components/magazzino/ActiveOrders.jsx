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
  TrendingUp,
  Edit2,
  X,
  Save
} from 'lucide-react';
import {
  getAllSalesOrders,
  deleteSalesOrder,
  updateSalesOrderStatus,
  updateSalesOrderItems
} from '../../firebase/salesOrderService';

const ActiveOrders = ({ onOrderUpdate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | in-progress | completed
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // Edit/Delete modes per order
  const [editModes, setEditModes] = useState({}); // { orderId: { mode: 'edit'|'delete', selectedItems: Set(), editedItems: {} } }

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
        // Clear edit mode when collapsing
        setEditModes(prevModes => {
          const newModes = { ...prevModes };
          delete newModes[orderId];
          return newModes;
        });
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Edit mode functions
  const enterEditMode = (orderId) => {
    setEditModes(prev => ({
      ...prev,
      [orderId]: {
        mode: 'edit',
        selectedItems: new Set(),
        editedItems: {}
      }
    }));
  };

  const enterDeleteMode = (orderId) => {
    setEditModes(prev => ({
      ...prev,
      [orderId]: {
        mode: 'delete',
        selectedItems: new Set()
      }
    }));
  };

  const cancelEditMode = (orderId) => {
    setEditModes(prev => {
      const newModes = { ...prev };
      delete newModes[orderId];
      return newModes;
    });
  };

  const toggleItemSelection = (orderId, itemIndex) => {
    setEditModes(prev => {
      const mode = prev[orderId];
      if (!mode) return prev;

      const newSelected = new Set(mode.selectedItems);
      if (newSelected.has(itemIndex)) {
        newSelected.delete(itemIndex);
      } else {
        newSelected.add(itemIndex);
      }

      return {
        ...prev,
        [orderId]: {
          ...mode,
          selectedItems: newSelected
        }
      };
    });
  };

  const handleCellEdit = (orderId, itemIndex, field, value) => {
    setEditModes(prev => {
      const mode = prev[orderId];
      if (!mode || mode.mode !== 'edit') return prev;

      return {
        ...prev,
        [orderId]: {
          ...mode,
          editedItems: {
            ...mode.editedItems,
            [itemIndex]: {
              ...(mode.editedItems[itemIndex] || {}),
              [field]: value
            }
          }
        }
      };
    });
  };

  const confirmEdit = async (orderId) => {
    const mode = editModes[orderId];
    if (!mode || mode.selectedItems.size === 0) {
      alert('Please select at least one item to edit');
      return;
    }

    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Apply edits to selected items
      const updatedItems = order.items.map((item, index) => {
        if (mode.selectedItems.has(index)) {
          const edits = mode.editedItems[index] || {};
          return {
            ...item,
            ...edits,
            // Convert numeric fields
            quantityRequired: edits.quantityRequired ? parseInt(edits.quantityRequired) : item.quantityRequired,
            quantityPrepared: edits.quantityPrepared ? parseInt(edits.quantityPrepared) : item.quantityPrepared
          };
        }
        return item;
      });

      await updateSalesOrderItems(orderId, updatedItems);
      await loadOrders();
      if (onOrderUpdate) onOrderUpdate();
      cancelEditMode(orderId);
    } catch (error) {
      console.error('Error updating items:', error);
      alert('Failed to update items');
    }
  };

  const confirmDelete = async (orderId) => {
    const mode = editModes[orderId];
    if (!mode || mode.selectedItems.size === 0) {
      alert('Please select at least one item to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${mode.selectedItems.size} item(s)?`)) {
      return;
    }

    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Remove selected items
      const updatedItems = order.items.filter((item, index) => !mode.selectedItems.has(index));

      if (updatedItems.length === 0) {
        alert('Cannot delete all items. Please delete the entire order instead.');
        return;
      }

      await updateSalesOrderItems(orderId, updatedItems);
      await loadOrders();
      if (onOrderUpdate) onOrderUpdate();
      cancelEditMode(orderId);
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('Failed to delete items');
    }
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

  const filteredOrders = (orders || []).filter(order => {
    if (!order) return false;
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
          All Orders ({(orders || []).length})
        </button>
        <button
          className={`so-filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <Clock size={16} />
          Pending ({(orders || []).filter(o => o && o.status === 'pending').length})
        </button>
        <button
          className={`so-filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          <PlayCircle size={16} />
          In Progress ({(orders || []).filter(o => o && o.status === 'in-progress').length})
        </button>
        <button
          className={`so-filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          <CheckCircle size={16} />
          Completed ({(orders || []).filter(o => o && o.status === 'completed').length})
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
                    {/* Edit/Delete Action Buttons */}
                    <div className="so-items-actions-bar">
                      {!editModes[order.id] ? (
                        <>
                          <button
                            className="so-items-action-btn edit"
                            onClick={() => enterEditMode(order.id)}
                            title="Edit items"
                          >
                            <Edit2 size={18} />
                            <span>Edit Items</span>
                          </button>
                          <button
                            className="so-items-action-btn delete"
                            onClick={() => enterDeleteMode(order.id)}
                            title="Delete items"
                          >
                            <Trash2 size={18} />
                            <span>Delete Items</span>
                          </button>
                        </>
                      ) : (
                        <div className="so-items-edit-actions">
                          <span className="so-edit-mode-label">
                            {editModes[order.id].mode === 'edit' ? '✏️ Edit Mode' : '🗑️ Delete Mode'}
                            {' - '}
                            {editModes[order.id].selectedItems.size} item(s) selected
                          </span>
                          <div className="so-edit-buttons">
                            <button
                              className="so-edit-confirm-btn"
                              onClick={() => editModes[order.id].mode === 'edit' ? confirmEdit(order.id) : confirmDelete(order.id)}
                            >
                              <Save size={16} />
                              {editModes[order.id].mode === 'edit' ? 'Save Changes' : 'Confirm Delete'}
                            </button>
                            <button
                              className="so-edit-cancel-btn"
                              onClick={() => cancelEditMode(order.id)}
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="so-items-table-wrapper">
                      <table className="so-items-table-full">
                        <thead>
                          <tr>
                            {editModes[order.id] && <th className="so-checkbox-col">Select</th>}
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
                          {(order.items || []).map((item, idx) => {
                            const preparedPercent = item.quantityRequired > 0
                              ? (item.quantityPrepared / item.quantityRequired) * 100
                              : 0;
                            const editMode = editModes[order.id];
                            const isSelected = editMode?.selectedItems?.has(idx) || false;
                            const isEditable = editMode?.mode === 'edit' && isSelected;
                            const editedData = editMode?.editedItems?.[idx] || {};

                            return (
                              <tr key={idx} className={isSelected ? 'so-row-selected' : ''}>
                                {editMode && (
                                  <td className="so-checkbox-col">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleItemSelection(order.id, idx)}
                                      className="so-item-checkbox"
                                    />
                                  </td>
                                )}
                                <td className="so-line-item">
                                  {isEditable ? (
                                    <input
                                      type="text"
                                      value={editedData.lineItem ?? item.lineItem ?? idx + 1}
                                      onChange={(e) => handleCellEdit(order.id, idx, 'lineItem', e.target.value)}
                                      className="so-cell-input"
                                    />
                                  ) : (
                                    item.lineItem || idx + 1
                                  )}
                                </td>
                                <td className="so-material-code">
                                  {isEditable ? (
                                    <input
                                      type="text"
                                      value={editedData.materialCode ?? item.materialCode}
                                      onChange={(e) => handleCellEdit(order.id, idx, 'materialCode', e.target.value)}
                                      className="so-cell-input"
                                    />
                                  ) : (
                                    item.materialCode
                                  )}
                                </td>
                                <td className="so-description">
                                  {isEditable ? (
                                    <input
                                      type="text"
                                      value={editedData.description ?? item.description}
                                      onChange={(e) => handleCellEdit(order.id, idx, 'description', e.target.value)}
                                      className="so-cell-input"
                                    />
                                  ) : (
                                    item.description
                                  )}
                                </td>
                                <td className="so-qty-required">
                                  {isEditable ? (
                                    <input
                                      type="number"
                                      value={editedData.quantityRequired ?? item.quantityRequired}
                                      onChange={(e) => handleCellEdit(order.id, idx, 'quantityRequired', e.target.value)}
                                      className="so-cell-input so-cell-number"
                                    />
                                  ) : (
                                    item.quantityRequired
                                  )}
                                </td>
                                <td className="so-qty-prepared" style={{
                                  color: preparedPercent >= 100 ? '#10b981' :
                                         preparedPercent > 0 ? '#f59e0b' : '#6b7280',
                                  fontWeight: 'bold'
                                }}>
                                  {isEditable ? (
                                    <input
                                      type="number"
                                      value={editedData.quantityPrepared ?? item.quantityPrepared ?? 0}
                                      onChange={(e) => handleCellEdit(order.id, idx, 'quantityPrepared', e.target.value)}
                                      className="so-cell-input so-cell-number"
                                    />
                                  ) : (
                                    item.quantityPrepared || 0
                                  )}
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
