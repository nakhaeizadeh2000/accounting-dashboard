'use client';
// import React, { useState } from 'react';
// import { Pagination, PaginationItem } from '@mui/material';

// import {
//   gridPageCountSelector,
//   gridPageSelector,
//   useGridApiContext,
//   useGridSelector,
// } from '@mui/x-data-grid';
// import styles from './Pagination.module.scss';

// export default function CustomPagination() {
//   const apiRef = useGridApiContext();
//   const page = useGridSelector(apiRef, gridPageSelector);
//   const pageCount = useGridSelector(apiRef, gridPageCountSelector);
//   console.log({
//     apiRef,
//     page,
//     pageCount,
//   });

//   return (
//     <Pagination
//       color="primary"
//       count={pageCount}
//       page={page + 1}
//       onChange={(event, value) => apiRef.current.setPage(value - 1)}
//     />
//   );
// }

import React, { useState } from 'react';
import { Pagination, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import {
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
} from '@mui/x-data-grid';

function CustomPagination() {
  const [page, setPage] = useState<number>(1);
  const apiRef = useGridApiContext();
  // const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const paginationModel = apiRef.current.state.pagination.paginationModel;

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newPageSize = Number(event.target.value);
    apiRef.current.setPageSize(newPageSize);
    console.log(event, 'hhhh');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Pagination
        color="primary"
        count={pageCount}
        page={page}
        onChange={(event, value) => {
          setPage(value);
          return apiRef.current.setPage(value - 1);
        }}
      />
      <Select
        value={paginationModel.pageSize}
        onChange={handlePageSizeChange}
        style={{ marginLeft: 16 }}
      >
        {[5, 10, 25, 50].map((size) => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}

export default CustomPagination;
