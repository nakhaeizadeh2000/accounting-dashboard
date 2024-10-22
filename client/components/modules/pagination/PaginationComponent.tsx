// 'use client';

// import React, { useState } from 'react';
// import { Pagination, Select, MenuItem, SelectChangeEvent } from '@mui/material';
// import {
//   gridPageCountSelector,
//   gridPageSelector,
//   useGridApiContext,
//   useGridSelector,
// } from '@mui/x-data-grid';

// function CustomPagination() {
//   const [page, setPage] = useState<number>(1);
//   const apiRef = useGridApiContext();
//   // const page = useGridSelector(apiRef, gridPageSelector);
//   const pageCount = useGridSelector(apiRef, gridPageCountSelector);
//   const paginationModel = apiRef.current.state.pagination.paginationModel;

//   console.log(page, 'page');

//   const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
//     const newPageSize = Number(event.target.value);
//     apiRef.current.setPageSize(newPageSize);
//     console.log(event, 'hhhh');
//   };

//   return (
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//       <Pagination
//         color="primary"
//         count={pageCount}
//         page={page}
//         onChange={(event, value) => {
//           setPage(value);
//           return apiRef.current.setPage(value - 1);
//         }}
//       />
//       <Select
//         value={paginationModel.pageSize}
//         onChange={handlePageSizeChange}
//         style={{ marginLeft: 16 }}
//       >
//         {[10, 15, 20, 50].map((size) => (
//           <MenuItem key={size} value={size}>
//             {size}
//           </MenuItem>
//         ))}
//       </Select>
//     </div>
//   );
// }

// export default CustomPagination;

'use client';

import React from 'react';
import { Pagination, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { gridPageCountSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid';

function CustomPagination() {
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
        color="primary"
        count={pageCount}
        page={paginationModel.page + 1} // Convert to 1-based index for Pagination component
        onChange={(event, value) => {
          apiRef.current.setPage(value - 1); // Convert to 0-based index for DataGrid
        }}
      />
      <Select
        value={paginationModel.pageSize}
        onChange={handlePageSizeChange}
        style={{ marginLeft: 16 }}
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

export default CustomPagination;
