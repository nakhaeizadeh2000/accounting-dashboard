'use client';
import PaginationDataTableGridComponent from '@/components/modules/pagination/PaginationComponent';
import { UserFormData } from '@/schemas/validations/users/user.schema';
import { useGetUsersQuery } from '@/store/features/user/users.api';
import { Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';

type Props = {
  name?: string;
};

const UserListComponent = (props: Props) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0, // Start from page 0 for MUI DataGrid
  });

  // Automatically fetches data when the component is mounted
  const { data, error, isLoading } = useGetUsersQuery({
    page: paginationModel.page + 1, // Convert to 1-based for API
    limit: paginationModel.pageSize,
  });

  const [rowData, setRowData] = useState<Array<UserFormData & { id: string }> | []>([]);

  // Update rowData whenever data changes
  useEffect(() => {
    if (data) {
      setRowData(data.data.items); // Adjust based on your API response structure
    }
  }, [data]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: '', headerName: 'index', width: 70 },
    { field: 'firstName', headerName: 'First name', width: 130 },
    { field: 'lastName', headerName: 'Last name', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => console.log('hello', params.row)} // Pass the record ID to the edit function
        >
          Edit
        </Button>
      ),
    },
  ];

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <div>
      <h1>User List</h1>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          sx={{
            '& .MuiDataGrid-footerContainer': {
              justifyContent: 'space-between',
              flexDirection: 'row-reverse',
            },
            '&.MuiDataGrid-cell': {
              outline: 'solid #6571ff 1px',
            },
          }}
          rows={rowData}
          rowCount={data?.data?.total} // Ensure this reflects total number of items
          columns={columns}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 15, 20, 50]}
          slots={{
            pagination: PaginationDataTableGridComponent,
          }}
          disableColumnMenu
          disableColumnSorting
          disableColumnResize
          checkboxSelection={true}
        />
      </div>
    </div>
  );
};

export default UserListComponent;
