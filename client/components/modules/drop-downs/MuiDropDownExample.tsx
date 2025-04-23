'use client';

import React, { useState } from 'react';
import MuiDropDown from './MuiDropDown';
import { ItemType } from './mui-drop-down.type';
import { Box, Typography, Button, Switch, FormControlLabel, Grid, Paper } from '@mui/material';

export default function MuiDropDownExample() {
  // Sample data
  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'cn', label: 'China' },
    { value: 'br', label: 'Brazil' },
    { value: 'in', label: 'India' },
  ];

  // State for single select
  const [selectedCountry, setSelectedCountry] = useState<ItemType[]>([]);

  // State for multi select
  const [selectedCountries, setSelectedCountries] = useState<ItemType[]>([]);

  // State for validation example
  const [isValid, setIsValid] = useState(true);

  // State for disabled example
  const [isDisabled, setIsDisabled] = useState(false);

  // State for loading example
  const [isLoading, setIsLoading] = useState(false);

  // State for marquee example
  const [useMarquee, setUseMarquee] = useState(false);

  // State for LTR example
  const [isLTR, setIsLTR] = useState(false);

  // State for chips vs simple view
  const [useChips, setUseChips] = useState(false);

  // State for append to body
  const [appendToBody, setAppendToBody] = useState(false);

  // Handle single select change
  const handleSingleSelectChange = (items: ItemType[]) => {
    setSelectedCountry(items);
  };

  // Handle multi select change
  const handleMultiSelectChange = (items: ItemType[]) => {
    setSelectedCountries(items);
  };

  // Simulate loading
  const handleSimulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  // Toggle validation state
  const toggleValidation = () => {
    setIsValid(!isValid);
  };

  return (
    <Box className="mx-auto mb-8 flex w-full max-w-6xl flex-col gap-6 p-4">
      <Typography variant="h4" component="h1" className="mb-4">
        MUI Dropdown Examples
      </Typography>

      <Grid container spacing={4}>
        {/* Controls */}
        <Grid item xs={12}>
          <Paper elevation={2} className="p-4">
            <Typography variant="h6" className="mb-3">
              Configuration Options
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch checked={isDisabled} onChange={() => setIsDisabled(!isDisabled)} />
                  }
                  label="Disabled"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={<Switch checked={!isValid} onChange={toggleValidation} />}
                  label="Invalid"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch checked={useMarquee} onChange={() => setUseMarquee(!useMarquee)} />
                  }
                  label="Use Marquee"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={<Switch checked={isLTR} onChange={() => setIsLTR(!isLTR)} />}
                  label="LTR Direction"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={<Switch checked={useChips} onChange={() => setUseChips(!useChips)} />}
                  label="Use Chips (Multi-select)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={appendToBody}
                      onChange={() => setAppendToBody(!appendToBody)}
                    />
                  }
                  label="Append to Body"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleSimulateLoading}
                  disabled={isLoading}
                  className="mt-2"
                >
                  {isLoading ? 'Loading...' : 'Simulate Loading'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Single Select Example */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} className="p-4">
            <Typography variant="h6" className="mb-3">
              Single Select
            </Typography>
            <MuiDropDown
              options={{
                label: "Select Country",
                items: countries,
                selectedValue: selectedCountry,
                onChange: handleSingleSelectChange,
                isDisabled: isDisabled,
                isValid: isValid,
                isMarquee: useMarquee,
                isLTR: isLTR,
                isLoading: isLoading,
                appendToBody: appendToBody,
              }}
            />
            <Box className="mt-4">
              <Typography variant="subtitle2">Selected Value:</Typography>
              <pre className="bg-gray-100 dark:bg-slate-800 p-2 rounded mt-1">
                {selectedCountry.length > 0
                  ? JSON.stringify(selectedCountry, null, 2)
                  : 'No selection'}
              </pre>
            </Box>
          </Paper>
        </Grid>

        {/* Multi Select Example */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} className="p-4">
            <Typography variant="h6" className="mb-3">
              Multi Select
            </Typography>
            <MuiDropDown
              options={{
                label: "Select Multiple Countries",
                items: countries,
                selectedValue: selectedCountries,
                onChange: handleMultiSelectChange,
                isMultiSelectable: true,
                multiSelectLabelsViewType: useChips ? 'chips' : 'simple',
                isDisabled: isDisabled,
                isValid: isValid,
                isMarquee: useMarquee,
                isLTR: isLTR,
                isLoading: isLoading,
                appendToBody: appendToBody,
              }}
            />
            <Box className="mt-4">
              <Typography variant="subtitle2">Selected Values:</Typography>
              <pre className="bg-gray-100 dark:bg-slate-800 p-2 rounded mt-1">
                {selectedCountries.length > 0
                  ? JSON.stringify(selectedCountries, null, 2)
                  : 'No selection'}
              </pre>
            </Box>
          </Paper>
        </Grid>

        {/* Disabled Items Example */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} className="p-4">
            <Typography variant="h6" className="mb-3">
              With Disabled Items
            </Typography>
            <MuiDropDown
              options={{
                label: "Some Options Disabled",
                items: [
                  { value: 'us', label: 'United States' },
                  { value: 'ca', label: 'Canada', disabled: true },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'au', label: 'Australia', disabled: true },
                  { value: 'de', label: 'Germany' },
                ],
                selectedValue: [],
                onChange: () => {},
                isDisabled: isDisabled,
                isValid: isValid,
                isMarquee: useMarquee,
                isLTR: isLTR,
              }}
            />
            <Typography variant="body2" className="mt-2 text-gray-600">
              Note: Canada and Australia are disabled options
            </Typography>
          </Paper>
        </Grid>

        {/* Long Text Example */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} className="p-4">
            <Typography variant="h6" className="mb-3">
              Long Text Items
            </Typography>
            <MuiDropDown
              options={{
                label: "Items with Long Text",
                items: [
                  { value: 'item1', label: 'This is a very long item text that should demonstrate the marquee effect when selected' },
                  { value: 'item2', label: 'Another extremely long option text to show how the component handles overflow and text truncation' },
                  { value: 'item3', label: 'Short item' },
                  { value: 'item4', label: 'This is yet another very long item text that will need to scroll or be truncated when displayed in the dropdown' },
                ],
                selectedValue: [],
                onChange: () => {},
                isDisabled: isDisabled,
                isValid: isValid,
                isMarquee: true, // Force marquee for this example
                isLTR: isLTR,
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
