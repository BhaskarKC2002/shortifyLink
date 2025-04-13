import React, { useEffect } from "react";
import moment from "moment";
import Modal from "react-modal";
import TextInput from "../../components/TextInput/TextInput";
import Button from "../../components/Button/Button";
import UrlTable from "../../components/UrlTable/UrlTable";
import AnalyticsDashboard from "../../components/Analytics/AnalyticsDashboard";

import "./Dashboard.css";
import { UrlType } from "../../types";
import snackBarStore from "../../components/common/Snackbar/store/snackBarStore";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchUrls,
  addUrl,
  removeUrl,
  fetchAnalytics,
  updateUrl,
  setShowUrlAddView,
  setNewUrlPayload,
  setCurrentPage,
  setSearchQuery,
  selectPaginatedUrls,
  selectTotalPages
} from "../../redux/slices/urlSlice";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const urlData = useAppSelector(state => state.url.urlData);
  const urlDataLoading = useAppSelector(state => state.url.urlDataLoading);
  const showUrlAddView = useAppSelector(state => state.url.showUrlAddView);
  const newUrlPayload = useAppSelector(state => state.url.newUrlPayload);
  const currentPage = useAppSelector(state => state.url.currentPage);
  const searchQuery = useAppSelector(state => state.url.searchQuery);
  
  // Derived selectors
  const paginatedUrls = useAppSelector(selectPaginatedUrls);
  const totalPages = useAppSelector(selectTotalPages);
  
  // Local state
  const [editUrlData, setEditUrlData] = React.useState<Partial<UrlType>>();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = React.useState(false);
  const [currentUrlCode, setCurrentUrlCode] = React.useState<string>("");

  useEffect(() => {
    dispatch(fetchUrls());
  }, [dispatch]);

  const renderEmptyState = () => {
    return (
      <div className="dashboard__empty-state">
        <p>You don't have any short url</p>
        <Button
          onClick={() => dispatch(setShowUrlAddView(true))}
          label="Create a new short url"
          variant="outlined-primary"
        />
      </div>
    );
  };
  
  const renderAddNewButton = () => {
    if (showUrlAddView) return null;
    return (
      <div className="dashboard__addNew">
        <Button
          onClick={() => dispatch(setShowUrlAddView(true))}
          label="Create a new short url"
          variant="primary"
        />
      </div>
    );
  };

  const renderEditModal = () => {
    const onCancel = () => {
      setIsEditDialogOpen(false);
      setEditUrlData({});
    };
    return (
      <Modal
        isOpen={isEditDialogOpen}
        onRequestClose={onCancel}
        style={modalStyle}
      >
        <h3 style={{ marginBottom: 20 }}>Edit {editUrlData?.name}</h3>
        <TextInput
          style={{ marginBottom: 10 }}
          label="Original Url"
          placeholder="https://google.com/test/12"
          value={editUrlData?.originalLink || ""}
          onChange={(val) =>
            setEditUrlData({
              ...editUrlData,
              originalLink: val.toLocaleString(),
            })
          }
        />
        <TextInput
          label="Name"
          placeholder="Another short url"
          value={editUrlData?.name || ""}
          onChange={(val) =>
            setEditUrlData({
              ...editUrlData,
              name: val.toLocaleString(),
            })
          }
        />
        <TextInput
          label="Expiration Date (optional)"
          type="text"
          value={editUrlData?.expirationDate ? new Date(editUrlData.expirationDate).toISOString().split('T')[0] : ""}
          onChange={(val) =>
            setEditUrlData({
              ...editUrlData,
              expirationDate: val.toLocaleString(),
            })
          }
        />
        <div
          style={{ marginTop: 20, display: "flex", flexDirection: "column" }}
        >
          <Button
            label="Update"
            onClick={async () => {
              if (editUrlData?.urlCode) {
                await dispatch(updateUrl(editUrlData));
                snackBarStore.showSnackBar("Updated successfully");
                dispatch(fetchUrls());
                onCancel();
              }
            }}
            variant="outlined-primary"
            style={{ marginBottom: 10 }}
          />
          <Button
            label="Cancel"
            onClick={onCancel}
            variant="outlined-secondary"
          />
        </div>
      </Modal>
    );
  };

  const renderAnalyticsModal = () => {
    return (
      <Modal
        isOpen={isAnalyticsDialogOpen}
        onRequestClose={() => setIsAnalyticsDialogOpen(false)}
        style={modalStyle}
        contentLabel="Analytics Dashboard"
      >
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsAnalyticsDialogOpen(false)}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
          <h2 style={{ marginBottom: 20 }}>URL Analytics</h2>
          <AnalyticsDashboard urlCode={currentUrlCode} />
        </div>
      </Modal>
    );
  };

  const renderAddNewUrl = () => {
    return (
      <div className="dashbard__add-new">
        <TextInput
          label="Original Url"
          placeholder="https://google.com/test/12"
          value={newUrlPayload.originalLink}
          onChange={(val) =>
            dispatch(setNewUrlPayload({ originalLink: val.toLocaleString() }))
          }
        />
        <TextInput
          label="Name"
          value={newUrlPayload.name || ""}
          placeholder="Online shopping"
          onChange={(val) => 
            dispatch(setNewUrlPayload({ name: val.toLocaleString() }))
          }
        />
        <TextInput
          label="Expiration Date (optional)"
          type="text"
          value={newUrlPayload.expirationDate || ""}
          onChange={(val) => 
            dispatch(setNewUrlPayload({ expirationDate: val.toLocaleString() }))
          }
        />
        <div className="dashboard__add-new-actions">
          <Button
            label="Generate a short url"
            onClick={() => {
              if (!newUrlPayload.originalLink) {
                alert("Original link is required");
                return;
              }
              dispatch(addUrl(newUrlPayload)).then(() => {
                dispatch(fetchUrls());
              });
            }}
          />
          <Button
            label="Cancel"
            variant="outlined-secondary"
            onClick={() => dispatch(setShowUrlAddView(false))}
          />
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    return (
      <div className="dashboard__pagination">
        <button 
          onClick={() => dispatch(setCurrentPage(currentPage - 1))} 
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => dispatch(setCurrentPage(currentPage + 1))} 
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    );
  };

  const renderSearch = () => {
    return (
      <div className="dashboard__search">
        <TextInput
          placeholder="Search by name, URL, or code"
          value={searchQuery}
          onChange={(val) => dispatch(setSearchQuery(val.toString()))}
        />
      </div>
    );
  };
  
  // Helper function for handling delete URL
  const handleDelete = (urlCode: string) => {
    const ans = window.confirm("Are you sure");
    if (ans) {
      dispatch(removeUrl(urlCode)).then(() => {
        dispatch(fetchUrls());
        snackBarStore.showSnackBar("Deleted Successfully", "success");
      });
    }
  };

  const showAnalytics = (urlCode: string) => {
    setCurrentUrlCode(urlCode);
    dispatch(fetchAnalytics(urlCode));
    setIsAnalyticsDialogOpen(true);
  };

  return (
    <div className="dashboard">
      {showUrlAddView && renderAddNewUrl()}
      {Boolean(urlData.length) ? renderAddNewButton() : renderEmptyState()}
      {urlDataLoading && <h2>Loading...</h2>}

      {Boolean(urlData.length) && !urlDataLoading && (
        <>
          {renderEditModal()}
          {renderAnalyticsModal()}
          <h3>Shortened URL List</h3>
          {renderSearch()}
          <UrlTable
            columns={tableColumn}
            rows={paginatedUrls.map((_) =>
              convertRowDataToTableData(
                _, 
                setEditUrlData, 
                setIsEditDialogOpen,
                showAnalytics,
                handleDelete,
                dispatch
              )
            )}
          />
          {renderPagination()}
        </>
      )}
    </div>
  );
};

const tableColumn = [
  { label: "Name", field: "name" },
  { label: "Link", field: "urlCode" },
  { label: "Visit", field: "visitCount" },
  { label: "Added date", field: "createdAt" },
  { label: "Expiration", field: "expirationDate" },
  { label: "Actions", field: "actions", hideLabelinMobile: true },
];

const convertRowDataToTableData = (
  data: UrlType,
  setEditUrlData: React.Dispatch<React.SetStateAction<Partial<UrlType> | undefined>>,
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  showAnalytics: (urlCode: string) => void,
  handleDelete: (urlCode: string) => void,
  dispatch: any
) => {
  return {
    ...data,
    urlCode: `http://localhost:5001/api/url/${data.urlCode}`,
    createdAt: moment.unix(Number(data.createdAt) / 1000).format("l"),
    expirationDate: data.expirationDate 
      ? moment(data.expirationDate).format("l") 
      : "No expiration",
    actions: renderActions(
      data, 
      setEditUrlData, 
      setIsEditDialogOpen, 
      showAnalytics,
      handleDelete
    ),
  };
};

const renderActions = (
  data: UrlType,
  setEditUrlData: React.Dispatch<React.SetStateAction<Partial<UrlType> | undefined>>,
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  showAnalytics: (urlCode: string) => void,
  handleDelete: (urlCode: string) => void
): React.ReactNode => {
  return (
    <div style={{ display: "flex", gap: "5px" }}>
      <Button
        label="Edit"
        variant="primary"
        onClick={() => {
          setEditUrlData(data);
          setIsEditDialogOpen(true);
        }}
      />
      <Button
        label="Delete"
        variant="outlined-secondary"
        onClick={() => handleDelete(data.urlCode)}
      />
      <Button
        label="Analytics"
        variant="primary"
        onClick={() => showAnalytics(data.urlCode)}
      />
    </div>
  );
};

const modalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "95%",
    width: "800px",
    maxHeight: "90vh",
    overflow: "auto"
  },
};

export default Dashboard;
