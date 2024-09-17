import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  total: 0,
};

const Counter = createSlice({
  name: 'counter',
  initialState: initialState,
  reducers: {
    decrement: (sate) => {
      sate.value -= 1;
    },
    increment: (state) => {
      state.value += 1;
    },
  },
});

export const { decrement, increment } = Counter.actions;
export default Counter.reducer;
