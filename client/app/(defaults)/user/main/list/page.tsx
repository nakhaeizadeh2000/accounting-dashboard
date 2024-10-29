'use client';
import DataGridComponent from '@/components/modules/data-grid/DataGridComponent';
import { UserFormData } from '@/schemas/validations/users/user.schema';
import { useGetUsersQuery } from '@/store/features/user/users.api';
import { Button } from '@mui/material';
import { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// type Props = {
//   name?: string;
// };

const UserListComponent = (props: any) => {
  const router = useRouter();

  // get detail of pagination
  const [detailPage, setDetailPage] = useState<{ page: number; pageSize: number }>({
    pageSize: 10,
    page: 0, // Start from page 0 for MUI DataGrid
  });

  // this state for getting the selected data of grid data component
  const [selectedData, setSelectedData] = useState<GridValidRowModel[]>([]);
  console.log('Selected Rows Data:', selectedData);

  // Automatically fetches data when the component is mounted
  const { data, error, isLoading } = useGetUsersQuery({
    page: detailPage.page + 1, // Convert to 1-based for API
    limit: detailPage.pageSize,
  });

  //get data of api
  const [rowData, setRowData] = useState<Array<UserFormData & { id: string }> | []>([]);

  // Update rowData whenever data changes
  useEffect(() => {
    if (data) {
      setRowData(data.data.items); // Adjust based on your API response structure
    }
  }, [data]);

  // define the columns the grid data component
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
          onClick={() => router.push(`/user/info/${params.row?.id}`)} // Pass the record ID to the edit function
        >
          Edit
        </Button>
      ),
    },
  ];

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>Error loading users</div>;

  return (
    <div>
      <DataGridComponent
        options={{
          rowData,
          columnsData: columns,
          rowCountData: data?.data?.total,
          getPaginationModel: setDetailPage,
          checkboxSelection: true,
          getSelectedData: setSelectedData,
        }}
      />
    </div>
  );
};

export default UserListComponent;

//TODO assignment the safe type for getting the selected data
