'use client';
import { GridColDef, GridPaginationModel, GridRowsProp } from '@mui/x-data-grid';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import PaginationDataTableGridComponent from '../pagination/PaginationComponent';

const DataGrid = dynamic(() => import('@mui/x-data-grid').then((mod) => mod.DataGrid));

type Props = {
  options: {
    columnsData: GridColDef[];
    rowData: GridRowsProp;
    rowCountData: number | undefined;
    disableColumnMenu?: boolean;
    disableColumnSorting?: boolean;
    disableColumnResize?: boolean;
    checkboxSelection?: boolean;
    getPaginationModel?: (pagination: { page: number; pageSize: number }) => void;
  };
};

const DataGridComponent = ({ options }: Props) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0, // Start from page 0 for MUI DataGrid
  });

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
    options?.getPaginationModel?.(newModel);
  };

  return (
    <div>
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
          rows={options?.rowData}
          rowCount={options?.rowCountData} // Ensure this reflects total number of items
          columns={options?.columnsData}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 15, 20, 50]}
          slots={{
            pagination: PaginationDataTableGridComponent,
          }}
          disableColumnMenu={options?.disableColumnMenu}
          disableColumnSorting={options?.disableColumnSorting}
          disableColumnResize={options?.disableColumnResize}
          checkboxSelection={options?.checkboxSelection}
        />
      </div>
    </div>
  );
};

export default DataGridComponent;
