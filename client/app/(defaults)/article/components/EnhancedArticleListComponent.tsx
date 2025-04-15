'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  useGetArticlesQuery,
  useDeleteArticleMutation,
} from '@/store/features/article/article.api';
import { ResponseArticleDto } from '@/store/features/article/article.model';
import { ArticleFilterFormData } from '@/schemas/validations/article/article.schema';
import { isResponseCatchError } from '@/store/features/base-response.model';
import DataGridComponent from '@/components/modules/data-grid/DataGridComponent';
import ArticleFilterComponent from './ArticleFilterComponent';
import { GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { FiEdit3, FiEye, FiTrash2, FiDownload, FiFilePlus } from 'react-icons/fi';
import ButtonLoading from '@/components/modules/loadings/ButtonLoading';
import useDebounce from '@/shared/hooks/useDebounce.hook';
import { ARTICLE_ROUTES } from '..';

const EnhancedArticleListComponent: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedArticles, setSelectedArticles] = useState<ResponseArticleDto[]>([]);
  const [filters, setFilters] = useState<ArticleFilterFormData>({
    page: 1,
    limit: 10,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);

  // Debounce filter changes to prevent excessive API calls
  const debouncedFilters = useDebounce<ArticleFilterFormData>(filters, 500);

  // Fetch articles with pagination and filtering
  const { data, isLoading, isFetching, error, refetch } = useGetArticlesQuery({
    page: debouncedFilters.page || 1,
    limit: debouncedFilters.limit || 10,
    // Additional filter params would be added here in a real implementation
  });

  // Delete mutation
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();

  // Update page size when pagination changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      page: page + 1, // API expects 1-based indexing
      limit: pageSize,
    }));
  }, [page, pageSize]);

  // Handle pagination changes
  const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  // Handle article selection
  const handleSelectionChange = (selectedRows: any[]) => {
    setSelectedArticles(selectedRows as ResponseArticleDto[]);
  };

  // Apply filters
  const handleFilterApply = useCallback((newFilters: ArticleFilterFormData) => {
    setFilters(newFilters);
    // Reset to first page when applying new filters
    setPage(0);
  }, []);

  // Reset filters
  const handleFilterReset = useCallback(() => {
    setFilters({
      page: 1,
      limit: pageSize,
    });
    // Reset to first page
    setPage(0);
    refetch();
  }, [pageSize, refetch]);

  // Navigate to article details
  const handleViewArticle = (id: number) => {
    router.push(ARTICLE_ROUTES.VIEW(id));
  };

  // Navigate to article edit
  const handleEditArticle = (id: number) => {
    router.push(ARTICLE_ROUTES.EDIT(id));
  };

  // Delete article
  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;

    try {
      await deleteArticle({ id: articleToDelete }).unwrap();
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    } catch (err) {
      if (isResponseCatchError(err)) {
        console.error('Error deleting article:', err.data.message);
        // You could show a toast or alert here
      } else {
        console.error('Unknown error:', err);
      }
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: number) => {
    setArticleToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setArticleToDelete(null);
  };

  // Format date for display
  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return format(date, 'yyyy/MM/dd HH:mm');
  };

  // Navigate to create new article
  const handleCreateArticle = () => {
    router.push(ARTICLE_ROUTES.CREATE);
  };

  // Define columns for the DataGrid
  const columns: GridColDef[] = [
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
        <div className="flex gap-1">
          <Tooltip title="مشاهده">
            <IconButton size="small" color="info" onClick={() => handleViewArticle(params.row.id)}>
              <FiEye />
            </IconButton>
          </Tooltip>
          <Tooltip title="ویرایش">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditArticle(params.row.id)}
            >
              <FiEdit3 />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton
              size="small"
              color="error"
              onClick={() => openDeleteDialog(params.row.id)}
              disabled={isDeleting && articleToDelete === params.row.id}
            >
              {isDeleting && articleToDelete === params.row.id ? (
                <ButtonLoading colorClassName="bg-red-400" />
              ) : (
                <FiTrash2 />
              )}
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">لیست مقالات</h1>

        <Button
          variant="contained"
          color="primary"
          startIcon={<FiFilePlus />}
          onClick={handleCreateArticle}
        >
          ایجاد مقاله جدید
        </Button>
      </div>

      {/* Filter component */}
      <ArticleFilterComponent onFilter={handleFilterApply} onResetFilters={handleFilterReset} />

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
          <p>خطا در بارگیری مقالات</p>
          <Button variant="contained" color="primary" onClick={() => refetch()} className="mt-2">
            تلاش مجدد
          </Button>
        </div>
      ) : (
        <div className="relative">
          {/* Batch actions for selected items */}
          {selectedArticles.length > 0 && (
            <div className="absolute right-2 top-[-48px] z-10 flex items-center gap-2 rounded-t-md bg-blue-50 px-3 py-2 dark:bg-blue-900">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedArticles.length} مورد انتخاب شده
              </span>
              <Tooltip title="حذف موارد انتخاب شده">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    /* Implement batch delete */
                  }}
                >
                  <FiTrash2 />
                </IconButton>
              </Tooltip>
              <Tooltip title="صادر کردن لیست">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    /* Implement export */
                  }}
                >
                  <FiDownload />
                </IconButton>
              </Tooltip>
            </div>
          )}

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
        </div>
      )}

      {/* Loading overlay */}
      {(isLoading || isFetching) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="rounded-md bg-white p-4 shadow-xl dark:bg-gray-800">
            <ButtonLoading colorClassName="bg-blue-600" />
            <p className="mt-2 text-center text-gray-700 dark:text-gray-300">در حال بارگذاری...</p>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">تایید حذف مقاله</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            آیا از حذف این مقاله اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            انصراف
          </Button>
          <Button onClick={handleDeleteArticle} color="error" autoFocus disabled={isDeleting}>
            {isDeleting ? (
              <>
                <ButtonLoading colorClassName="bg-red-400" />
                <span className="mr-2">در حال حذف...</span>
              </>
            ) : (
              'حذف'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EnhancedArticleListComponent;
