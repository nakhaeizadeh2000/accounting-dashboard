'use client';
import PaginationDataTableGridComponent from '@/components/modules/pagination/PaginationComponent';
import { UserFormData } from '@/schemas/validations/users/user.schema';
import { useGetUsersQuery } from '@/store/features/user/users.api';
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
            '&.MuiDataGrid-cell:focus': {
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
        />
      </div>
    </div>
  );
};

export default UserListComponent;
const dataFake = [
  { id: 1, lastName: 'Martell', firstName: 'Theon' },
  { id: 2, lastName: 'Targaryen', firstName: 'Theon' },
  { id: 3, lastName: 'Frey', firstName: 'Robb' },
  { id: 4, lastName: 'Martell', firstName: 'Tyrion' },
  { id: 5, lastName: 'Baratheon', firstName: 'Bran' },
  { id: 6, lastName: 'Martell', firstName: 'Cersei' },
  { id: 7, lastName: 'Snow', firstName: 'Jaime' },
  { id: 8, lastName: 'Frey', firstName: 'Robb' },
  { id: 9, lastName: 'Tyrell', firstName: 'Arya' },
  { id: 10, lastName: 'Bolton', firstName: 'Theon' },
  { id: 11, lastName: 'Frey', firstName: 'Joffrey' },
  { id: 12, lastName: 'Stark', firstName: 'Tyrion' },
  { id: 13, lastName: 'Stark', firstName: 'Tyrion' },
  { id: 14, lastName: 'Martell', firstName: 'Bran' },
  { id: 15, lastName: 'Targaryen', firstName: 'Cersei' },
  { id: 16, lastName: 'Stark', firstName: 'Tyrion' },
  { id: 17, lastName: 'Tyrell', firstName: 'Sansa' },
  { id: 18, lastName: 'Tyrell', firstName: 'Sansa' },
  { id: 19, lastName: 'Stark', firstName: 'Robb' },
  { id: 20, lastName: 'Frey', firstName: 'Theon' },
  { id: 21, lastName: 'Baratheon', firstName: 'Arya' },
  { id: 22, lastName: 'Stark', firstName: 'Jaime' },
  { id: 23, lastName: 'Targaryen', firstName: 'Arya' },
  { id: 24, lastName: 'Bolton', firstName: 'Jaime' },
  { id: 25, lastName: 'Snow', firstName: 'Bran' },
  { id: 26, lastName: 'Baratheon', firstName: 'Tyrion' },
  { id: 27, lastName: 'Stark', firstName: 'Tyrion' },
  { id: 28, lastName: 'Lannister', firstName: 'Theon' },
  { id: 29, lastName: 'Snow', firstName: 'Sansa' },
  { id: 30, lastName: 'Stark', firstName: 'Joffrey' },
  { id: 31, lastName: 'Lannister', firstName: 'Sansa' },
  { id: 32, lastName: 'Lannister', firstName: 'Theon' },
  { id: 33, lastName: 'Frey', firstName: 'Robb' },
  { id: 34, lastName: 'Baratheon', firstName: 'Cersei' },
  { id: 35, lastName: 'Greyjoy', firstName: 'Jon' },
  { id: 36, lastName: 'Martell', firstName: 'Tyrion' },
  { id: 37, lastName: 'Stark', firstName: 'Cersei' },
  { id: 38, lastName: 'Baratheon', firstName: 'Theon' },
  { id: 39, lastName: 'Lannister', firstName: 'Bran' },
  { id: 40, lastName: 'Bolton', firstName: 'Jon' },
  { id: 41, lastName: 'Lannister', firstName: 'Robb' },
  { id: 42, lastName: 'Martell', firstName: 'Joffrey' },
  { id: 43, lastName: 'Baratheon', firstName: 'Cersei' },
  { id: 44, lastName: 'Bolton', firstName: 'Theon' },
  { id: 45, lastName: 'Baratheon', firstName: 'Sansa' },
  { id: 46, lastName: 'Snow', firstName: 'Cersei' },
  { id: 47, lastName: 'Snow', firstName: 'Robb' },
  { id: 48, lastName: 'Frey', firstName: 'Robb' },
  { id: 49, lastName: 'Bolton', firstName: 'Robb' },
  { id: 50, lastName: 'Greyjoy', firstName: 'Cersei' },
];
