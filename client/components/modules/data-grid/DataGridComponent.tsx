'use client';
import {
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import PaginationDataTableGridComponent from '../pagination/pagination-grid-component/PaginationComponent';
import { persianLocaleText } from './persian-local-text';

const DataGrid = dynamic(() => import('@mui/x-data-grid').then((mod) => mod.DataGrid));

type Props = {
  options: {
    columnsData: GridColDef[];
    rowData: GridRowsProp;
    rowCountData: number;
    disableColumnMenu?: boolean;
    disableColumnSorting?: boolean;
    disableColumnResize?: boolean;
    checkboxSelection?: boolean;
    disableRowSelectionOnClick?: boolean;
    disableMultipleRowSelection?: boolean;
    className?: string;
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
    disableMultipleRowSelection,
    disableRowSelectionOnClick,
    className,
    getPaginationModel,
    getSelectedData,
  },
}: Props) => {
  // set pagination detail
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0, // Start from page 0 for MUI DataGrid
  });

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
    getPaginationModel?.(newModel);
  };

  // set selected data from data table grid
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
          }}
          className={`${className}`}
          rows={rowData}
          rowCount={rowCountData ?? 0} // Ensure this reflects total number of items
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
          localeText={persianLocaleText}
          disableMultipleRowSelection={disableMultipleRowSelection}
          disableRowSelectionOnClick={disableRowSelectionOnClick}
        />
      </div>
    </div>
  );
};

export default DataGridComponent;

type selectedDataType = {
  [key: string]: any; // or number, boolean, etc.
};
