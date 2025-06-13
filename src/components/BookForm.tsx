import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Book } from '../api/bookService';

interface BookFormProps {
  initialValues?: Partial<Book>;
  onSubmit: (values: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isSubmitting: boolean;
  title: string;
  submitButtonText: string;
}

const BookForm: React.FC<BookFormProps> = ({
  initialValues = {
    title: '',
    author: '',
    isbn: '',
    published_date: '',
    status: 'available',
  },
  onSubmit,
  isSubmitting,
  title,
  submitButtonText,
}) => {
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    author: Yup.string().required('Author is required'),
    isbn: Yup.string()
      .required('ISBN is required')
      .matches(/^(\d[- ]?){9}[\dXx]$/, 'Invalid ISBN format'),
    published_date: Yup.date().required('Published date is required'),
    status: Yup.string().oneOf(
      ['available', 'checked_out', 'lost'],
      'Invalid status'
    ),
  });

  const formik = useFormik({
    initialValues: {
      title: initialValues.title || '',
      author: initialValues.author || '',
      isbn: initialValues.isbn || '',
      published_date: initialValues.published_date || '',
      status: initialValues.status || 'available',
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit({
        ...values,
        status: values.status as 'available' | 'checked_out' | 'lost',
      });
    },
  });

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="author"
              name="author"
              label="Author"
              value={formik.values.author}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.author && Boolean(formik.errors.author)}
              helperText={formik.touched.author && formik.errors.author}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="isbn"
              name="isbn"
              label="ISBN"
              value={formik.values.isbn}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.isbn && Boolean(formik.errors.isbn)}
              helperText={formik.touched.isbn && formik.errors.isbn}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="published_date"
              name="published_date"
              label="Published Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={formik.values.published_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.published_date &&
                Boolean(formik.errors.published_date)
              }
              helperText={
                formik.touched.published_date && formik.errors.published_date
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={formik.values.status}
                label="Status"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="checked_out">Checked Out</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
              {formik.touched.status && formik.errors.status && (
                <FormHelperText>{formik.errors.status}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {isSubmitting ? 'Saving...' : submitButtonText}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default BookForm;
