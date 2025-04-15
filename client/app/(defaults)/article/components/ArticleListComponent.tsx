'use client';

import React, { useState, useEffect } from 'react';
import { useGetArticlesQuery } from '@/store/features/article/article.api';
import { ResponseArticleDto } from '@/store/features/article/article.model';
import DataGridComponent from '@/components/modules/data-grid/DataGridComponent';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import ButtonLoading from '@/components/modules/loadings/ButtonLoading';
import { Button } from '@mui/material';
import { FiEdit3, FiEye, FiTrash2 } from 'react-icons/fi';
import { useDeleteArticleMutation } from '@/store/features/article/article.api';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { Route } from 'next';
import { ARTICLE_ROUTES } from '..';

const ArticleListComponent: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedArticles, setSelectedArticles] = useState<ResponseArticleDto[]>([]);

  // Fetch articles with pagination
  const { data, isLoading, isFetching, error } = useGetArticlesQuery({
    page: page + 1, // API expects 1-based indexing
    limit: pageSize,
  });

  // Delete mutation
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();

  // Handle pagination changes
  const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  // Handle article selection
  const handleSelectionChange = (selectedRows: any[]) => {
    setSelectedArticles(selectedRows as ResponseArticleDto[]);
  };

  // Navigate to article details
  const handleViewArticle = (id: number) => {
    router.push(ARTICLE_ROUTES.VIEW(id));
  };

  // Navigate to article edit
  const handleEditArticle = (id: number) => {
    router.push(ARTICLE_ROUTES.EDIT(id));
  };

  // Delete article
  const handleDeleteArticle = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle({ id }).unwrap();
      } catch (err) {
        if (isResponseCatchError(err)) {
          console.error('Error deleting article:', err.data.message);
          // You could show a toast or alert here
        } else {
          console.error('Unknown error:', err);
        }
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return format(date, 'yyyy/MM/dd HH:mm');
  };

  type ArticleRow = {
    id: number;
    title: string;
    authorId: number;
    createdAt: string;
    updatedAt: string;
  };
  // Define columns for the DataGrid
  const columns: GridColDef<ArticleRow>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'عنوان', width: 230, flex: 1 },
    { field: 'authorId', headerName: 'نویسنده', width: 180 },
    {
      field: 'createdAt',
      headerName: 'تاریخ ایجاد',
      width: 150,
      valueFormatter: (params: any) => formatDate(params.value),
    },
    {
      field: 'updatedAt',
      headerName: 'تاریخ بروزرسانی',
      width: 150,
      valueFormatter: (params: any) => formatDate(params.value),
    },
    {
      field: 'actions',
      headerName: 'عملیات',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Button
            variant="contained"
            color="info"
            size="small"
            onClick={() => handleViewArticle(params.row.id)}
            startIcon={<FiEye />}
          >
            مشاهده
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleEditArticle(params.row.id)}
            startIcon={<FiEdit3 />}
          >
            ویرایش
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDeleteArticle(params.row.id)}
            startIcon={isDeleting ? <ButtonLoading colorClassName="bg-white" /> : <FiTrash2 />}
            disabled={isDeleting}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full bg-white p-6 shadow-md dark:bg-gray-800">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">لیست مقالات</h1>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
          <p>خطا در بارگیری مقالات</p>
        </div>
      ) : (
        <DataGridComponent
          options={{
            rowData: data?.data?.items || [],
            columnsData: columns,
            rowCountData: data?.data?.total || 0,
            getPaginationModel: handlePaginationModelChange,
            checkboxSelection: true,
            getSelectedData: handleSelectionChange,
            disableColumnMenu: false,
            className: 'h-[600px] w-full',
          }}
        />
      )}

      {(isLoading || isFetching) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="rounded-md bg-white p-4 shadow-xl dark:bg-gray-800">
            <ButtonLoading colorClassName="bg-blue-600" />
            <p className="mt-2 text-center text-gray-700 dark:text-gray-300">در حال بارگذاری...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleListComponent;
