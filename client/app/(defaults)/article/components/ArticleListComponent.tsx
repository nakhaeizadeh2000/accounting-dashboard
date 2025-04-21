'use client';

import React, { useEffect } from 'react';
import {
  useGetArticlesQuery,
  useDeleteArticleMutation,
} from '@/store/features/article/article.api';
import {
  setFilter,
  resetFilter,
  setSelectedArticleIds,
  clearSelectedArticleIds,
  setLastViewedArticleId,
} from '@/store/features/article/articleSlice';
import { ResponseArticleDto } from '@/store/features/article/article.model';
// Create the ArticleFilterFormData type in the article.schema.ts file
export interface ArticleFilterFormData {
  title?: string;
  authorId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
import { isResponseCatchError } from '@/store/features/base-response.model';
import DataGridComponent from '@/components/modules/data-grid/DataGridComponent';
import ArticleFilterComponent from './ArticleFilterComponent';
import { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/shared/utils/date-utils'; // Update the import to use the shared utility function
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
import { ARTICLE_ROUTES } from '..';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux.hook';
import { ResponseUserDto } from '@/store/features/users/users.model';

const ArticleListComponent: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get current filter and selection from Redux store
  const currentFilter = useAppSelector((state) => state.article.currentFilter);
  const selectedArticleIds = useAppSelector((state) => state.article.selectedArticleIds);

  // Local state for UI controls
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [articleToDelete, setArticleToDelete] = React.useState<number | null>(null);

  // Fetch articles with pagination and filtering
  const { data, isLoading, isFetching, error, refetch } = useGetArticlesQuery({
    ...currentFilter,
  });

  // Delete mutation
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();

  const lastViewedArticleId = useAppSelector((state) => state.article.lastViewedArticleId);

  // Clear selection only when coming from article detail page
  useEffect(() => {
    if (lastViewedArticleId !== null) {
      // Clear selection only if we're coming from a detail page
      dispatch(clearSelectedArticleIds());
      // Reset the last viewed article ID
      dispatch(setLastViewedArticleId(null));
    }
  }, [dispatch, lastViewedArticleId]);

  // Handle pagination changes
  const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
    dispatch(
      setFilter({
        page: model.page + 1, // API expects 1-based indexing while DataGrid uses 0-based
        limit: model.pageSize,
      }),
    );
  };

  // Handle article selection
  const handleSelectionChange = <T extends GridValidRowModel>(items: T[]) => {
    // First, check if items have the expected properties of a ResponseArticleDto
    if (items.length > 0 && 'id' in items[0]) {
      // Cast the selection to any to bypass type checking, then to ResponseArticleDto[]
      const articleRows = items as any as ResponseArticleDto[];
      dispatch(setSelectedArticleIds(articleRows.map((article) => article.id)));
    } else if (items.length === 0) {
      dispatch(setSelectedArticleIds([]));
    } else {
      console.warn('Selected items do not have expected structure:', items);
      dispatch(setSelectedArticleIds([]));
    }
  };

  // Apply filters
  const handleFilterApply = (newFilters: ArticleFilterFormData) => {
    dispatch(
      setFilter({
        ...newFilters,
        authorId: newFilters.authorId !== undefined ? String(newFilters.authorId) : undefined,
        fromDate: newFilters.startDate,
        toDate: newFilters.endDate,
      }),
    );
  };

  // Reset filters
  const handleFilterReset = () => {
    dispatch(resetFilter());
    refetch();
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

  // Navigate to create new article
  const handleCreateArticle = () => {
    router.push(ARTICLE_ROUTES.CREATE);
  };

  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    { field: 'title', headerName: 'عنوان', width: 200 },
    {
      field: 'author',
      headerName: 'نویسنده',
      width: 180,
      flex: 1,
      valueGetter: (author: ResponseUserDto) => {
        if (!author) return '-';
        return author.firstName && author.lastName
          ? `${author.firstName} ${author.lastName}`
          : author.email;
      },
    },
    {
      field: 'createdAt',
      headerName: 'تاریخ ایجاد',
      width: 150,
      valueFormatter: (date) => {
        if (!date) return '-';
        return formatDate(date);
      },
    },
    {
      field: 'updatedAt',
      headerName: 'تاریخ بروزرسانی',
      width: 150,
      valueFormatter: (date) => {
        if (!date) return '-';
        return formatDate(date);
      },
    },
    {
      field: 'actions',
      headerName: 'عملیات',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex h-full w-full items-center justify-center gap-1">
          <Tooltip title="مشاهده">
            <IconButton size="small" color="info" onClick={() => handleViewArticle(params.row.id)}>
              <FiEye />
            </IconButton>
          </Tooltip>
          <Tooltip title="ویرایش">
            <IconButton
              size="small"
              color="warning"
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

  // Selected articles based on IDs
  const selectedArticles = React.useMemo(() => {
    if (!data?.data?.items) return [];
    return data.data.items.filter((article) => selectedArticleIds.includes(article.id));
  }, [data?.data?.items, selectedArticleIds]);

  // Batch operations on selected articles
  const handleBatchDelete = () => {
    if (selectedArticles.length === 0) return;

    if (window.confirm(`آیا از حذف ${selectedArticles.length} مقاله انتخاب شده اطمینان دارید؟`)) {
      // Sequentially delete each selected article
      selectedArticles.forEach((article) => {
        deleteArticle({ id: article.id });
      });
    }
  };

  const handleBatchDownload = () => {
    // Implementation for batch download would go here
    console.log('Downloading selected articles:', selectedArticles);
  };

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
          {selectedArticleIds.length > 0 && (
            <div className="absolute right-2 top-[-48px] z-10 flex items-center gap-2 rounded-t-md bg-blue-50 px-3 py-2 dark:bg-blue-900">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedArticleIds.length} مورد انتخاب شده
              </span>
              <Tooltip title="حذف موارد انتخاب شده">
                <IconButton size="small" color="error" onClick={handleBatchDelete}>
                  <FiTrash2 />
                </IconButton>
              </Tooltip>
              <Tooltip title="صادر کردن لیست">
                <IconButton size="small" color="primary" onClick={handleBatchDownload}>
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
          <Button
            onClick={closeDeleteDialog}
            className="[&&]:text-neutral-500 [&&]:dark:text-neutral-400"
          >
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

export default ArticleListComponent;
