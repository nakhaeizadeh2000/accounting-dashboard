'use client';

import React from 'react';
import { Select, SelectChangeEvent } from '@mui/material';
import { gridPageCountSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid';
import dynamic from 'next/dynamic';

const Pagination = dynamic(() => import('@mui/material').then((mod) => mod.Pagination));
// const Select = dynamic(() => import('@mui/material').then((mod) => mod.Select));
const MenuItem = dynamic(() => import('@mui/material').then((mod) => mod.MenuItem));

function PaginationDataTableGridComponent() {
  const apiRef = useGridApiContext();
  const paginationModel = apiRef.current.state.pagination.paginationModel; // Get pagination model
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newPageSize = Number(event.target.value);
    apiRef.current.setPageSize(newPageSize);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Pagination
        color="standard"
        count={pageCount}
        page={paginationModel.page + 1} // Convert to 1-based index for Pagination component
        onChange={(event, value) => {
          apiRef.current.setPage(value - 1); // Convert to 0-based index for DataGrid
        }}
      />
      <Select
        value={paginationModel.pageSize}
        onChange={handlePageSizeChange}
        className="ml-4 h-[50px]"
      >
        {[10, 15, 20, 50].map((size) => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}

export default PaginationDataTableGridComponent;
