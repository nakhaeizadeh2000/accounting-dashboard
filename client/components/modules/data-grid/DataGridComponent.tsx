'use client';
import {
  GridColDef,
  GridPaginationModel,
  GridRowId,
  GridRowSelectionModel,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
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
    getPaginationModel: (pagination: { page: number; pageSize: number }) => void;
    getSelectedData?: <T>(items: GridValidRowModel[] & T) => void;
  };
};

const DataGridComponent = ({
  options: {
    columnsData,
    rowCountData,
    rowData,
    checkboxSelection,
    disableColumnMenu,
    disableColumnResize,
    disableColumnSorting,
    getPaginationModel,
    getSelectedData,
  },
}: Props) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0, // Start from page 0 for MUI DataGrid
  });

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
    getPaginationModel?.(newModel);
  };

  const handleRowSelection = (selectionModel: GridRowSelectionModel) => {
    const selectedRowsData = rowData.filter((row) => selectionModel.includes(row.id));
    getSelectedData?.(selectedRowsData);
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
          rows={rowData}
          rowCount={rowCountData} // Ensure this reflects total number of items
          columns={columnsData}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 15, 20, 50]}
          slots={{
            pagination: PaginationDataTableGridComponent,
          }}
          disableColumnMenu={disableColumnMenu}
          disableColumnSorting={disableColumnSorting}
          disableColumnResize={disableColumnResize}
          checkboxSelection={checkboxSelection}
          onRowSelectionModelChange={handleRowSelection}
        />
      </div>
    </div>
  );
};

export default DataGridComponent;
