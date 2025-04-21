'use client';

import React from 'react';
import { ResponseArticleDto } from '@/store/features/article/article.model';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { FiEdit3, FiEye, FiTrash2, FiCalendar, FiUser, FiPaperclip } from 'react-icons/fi';
import { formatArticleDate, truncateText, htmlToPlainText, calculateReadingTime } from '../utils';
import Image from 'next/image';

interface ArticleCardComponentProps {
  article: ResponseArticleDto;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

const ArticleCardComponent: React.FC<ArticleCardComponentProps> = ({
  article,
  onEdit,
  onDelete,
  onView,
}) => {
  const router = useRouter();

  // Get thumbnail from first image file if available
  const thumbnail = article.files?.find(
    (file) => file.mimetype.startsWith('image/') && file.thumbnailUrl,
  )?.thumbnailUrl;

  // Get plain text excerpt
  const excerpt = truncateText(htmlToPlainText(article.content), 120);

  // Calculate reading time
  const readingTime = calculateReadingTime(article.content);

  // Check if article has attachments
  const hasAttachments = article.files && article.files.length > 0;

  return (
    <Card className="h-full overflow-hidden transition-shadow hover:shadow-md dark:bg-gray-800">
      {/* Thumbnail */}
      {thumbnail ? (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={thumbnail}
            alt={article.title}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 hover:scale-105"
            unoptimized // Using unoptimized for dynamic images from API
          />
        </div>
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
          <Typography variant="h6" color="textSecondary">
            بدون تصویر
          </Typography>
        </div>
      )}

      {/* Content */}
      <CardContent className="pb-2">
        {/* Title */}
        <Typography
          variant="h6"
          component="h2"
          className="mb-2 cursor-pointer text-lg font-bold hover:text-blue-600 dark:hover:text-blue-400"
          onClick={() => onView(article.id)}
        >
          {article.title}
        </Typography>

        {/* Metadata */}
        <div className="mb-3 flex flex-wrap gap-2">
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <FiCalendar className="ml-1" />
            {formatArticleDate(article.createdAt, 'yyyy/MM/dd')}
          </div>

          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <FiUser className="ml-1" />
            {article.authorId}
          </div>

          {hasAttachments && (
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <FiPaperclip className="ml-1" />
              {article.files?.length} فایل
            </div>
          )}

          <Chip
            label={`${readingTime} دقیقه مطالعه`}
            size="small"
            variant="outlined"
            className="h-5 text-xs"
          />
        </div>

        {/* Excerpt */}
        <Typography
          variant="body2"
          color="textSecondary"
          component="p"
          className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300"
        >
          {excerpt}
        </Typography>
      </CardContent>

      {/* Actions */}
      <CardActions className="flex justify-between px-4 pb-3">
        <div>
          <Tooltip title="مشاهده">
            <IconButton size="small" color="info" onClick={() => onView(article.id)}>
              <FiEye />
            </IconButton>
          </Tooltip>

          <Tooltip title="ویرایش">
            <IconButton size="small" color="warning" onClick={() => onEdit(article.id)}>
              <FiEdit3 />
            </IconButton>
          </Tooltip>

          <Tooltip title="حذف">
            <IconButton size="small" color="error" onClick={() => onDelete(article.id)}>
              <FiTrash2 />
            </IconButton>
          </Tooltip>
        </div>

        <Button size="small" color="primary" onClick={() => onView(article.id)}>
          ادامه مطلب
        </Button>
      </CardActions>
    </Card>
  );
};

export default ArticleCardComponent;
