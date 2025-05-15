import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ResponseArticleDto } from './article.model';
import { articleApi } from './article.api';

interface ArticleState {
  currentArticle: ResponseArticleDto | null;
  currentFilter: {
    title?: string;
    authorId?: string;
    fromDate?: string;
    toDate?: string;
    page: number;
    limit: number;
  };
  selectedArticleIds: number[];
  lastViewedArticleId: number | null;
}

const initialState: ArticleState = {
  currentArticle: null,
  currentFilter: {
    page: 1,
    limit: 10,
  },
  selectedArticleIds: [],
  lastViewedArticleId: null,
};

const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    // Set the current article manually if needed
    setCurrentArticle: (state, action: PayloadAction<ResponseArticleDto | null>) => {
      state.currentArticle = action.payload;
    },

    // Update filter criteria for article list
    setFilter: (state, action: PayloadAction<Partial<ArticleState['currentFilter']>>) => {
      state.currentFilter = {
        ...state.currentFilter,
        ...action.payload,
      };
    },

    // Reset filter to default values
    resetFilter: (state) => {
      state.currentFilter = {
        page: 1,
        limit: 10,
      };
    },

    // Update selected article IDs
    setSelectedArticleIds: (state, action: PayloadAction<number[]>) => {
      state.selectedArticleIds = action.payload;
    },

    // Add an article ID to selection
    addSelectedArticleId: (state, action: PayloadAction<number>) => {
      if (!state.selectedArticleIds.includes(action.payload)) {
        state.selectedArticleIds.push(action.payload);
      }
    },

    // Remove an article ID from selection
    removeSelectedArticleId: (state, action: PayloadAction<number>) => {
      state.selectedArticleIds = state.selectedArticleIds.filter((id) => id !== action.payload);
    },

    // Clear all selected article IDs
    clearSelectedArticleIds: (state) => {
      state.selectedArticleIds = [];
    },

    // Set the last viewed article ID
    setLastViewedArticleId: (state, action: PayloadAction<number | null>) => {
      state.lastViewedArticleId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // When fetching a single article succeeds, update the current article in the state
    builder.addMatcher(articleApi.endpoints.getArticleById.matchFulfilled, (state, { payload }) => {
      if (payload.success && payload.data) {
        state.currentArticle = payload.data;
        state.lastViewedArticleId = payload.data.id;
      }
    });

    // When creating an article succeeds, clear the current article
    builder.addMatcher(articleApi.endpoints.createArticle.matchFulfilled, (state) => {
      state.currentArticle = null;
    });

    // When updating an article succeeds, update the current article in the state
    builder.addMatcher(articleApi.endpoints.updateArticle.matchFulfilled, (state, { payload }) => {
      if (payload.success && payload.data) {
        state.currentArticle = payload.data;
      }
    });

    // When deleting an article succeeds, clear the current article if it was the deleted one
    builder.addMatcher(articleApi.endpoints.deleteArticle.matchFulfilled, (state, { meta }) => {
      if (state.currentArticle && state.currentArticle.id === meta.arg.originalArgs.id) {
        state.currentArticle = null;
      }

      // Also remove from selected IDs if present
      state.selectedArticleIds = state.selectedArticleIds.filter(
        (id) => id !== meta.arg.originalArgs.id,
      );
    });
  },
});

// Export actions
export const {
  setCurrentArticle,
  setFilter,
  resetFilter,
  setSelectedArticleIds,
  addSelectedArticleId,
  removeSelectedArticleId,
  clearSelectedArticleIds,
  setLastViewedArticleId,
} = articleSlice.actions;

// Export the reducer
export default articleSlice.reducer;
