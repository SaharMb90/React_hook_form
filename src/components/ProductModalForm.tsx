import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useForm, SubmitHandler } from 'react-hook-form';
import { styled } from '@mui/system';
import './ProductModalForm.scss';

const CustomTextField = styled(TextField)({
  '& label': {
    transformOrigin: 'top right',
    left: 'inherit !important',
    right: '1.75rem !important',
    top: '-0.9rem',
    fontSize: '0.875rem',
    color: '#807D7B',
    fontWeight: 400,
    overflow: 'unset',
    textAlign: 'right',
    padding: '4px',
    zIndex: 1,
  },
  '& label.Mui-focused': {
    top: '-0.9rem',
    fontSize: '0.75rem',
  },
  '& .MuiInputLabel-shrink': {
    top: '-0.9rem',
    fontSize: '0.75rem',
  },
});

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
};

type HeaderFormInputs = {
  date: string;
  customerName: string;
  billNumber: string;
  detail: string;
};

type ProductFormInputs = {
  id: string;
  productName: string;
  numbers: number;
  price: number;
  detail: string;
};

const ProductModalForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormInputs | null>(null);
  const [products, setProducts] = useState<ProductFormInputs[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<any>(null);

  useEffect(() => {
    axios.get('/api/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('API error:', err));
  }, []);

  const {
    register: registerHeader,
    handleSubmit: handleHeaderSubmit,
  } = useForm<HeaderFormInputs>();

  const {
    register: registerProduct,
    handleSubmit: handleProductSubmit,
    reset: resetProduct,
  } = useForm<ProductFormInputs>();

  const convertPersianToEnglishDigits = (str: string) =>
    str.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

  const onHeaderSubmit: SubmitHandler<HeaderFormInputs> = (data) => {
    data.date = selectedDate?.format("YYYY/MM/DD") || "";
    console.log('Header Data:', data);
    setShowSuccess(true);
  };

  const onProductSubmit: SubmitHandler<ProductFormInputs> = async (data) => {
  const numbers = Number(convertPersianToEnglishDigits(data.numbers.toString()));
  const price = Number(convertPersianToEnglishDigits(data.price.toString()));
  const productData = { ...data, numbers, price };

  const fallbackId = new Date().toISOString();
  const productWithId = { ...productData, id: fallbackId };

  try {
    if (editingProduct) {
      const updatedProduct = { ...editingProduct, ...productData };
      await axios.put(`/api/products/${editingProduct.id}`, updatedProduct);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );
    } else {
      await axios.post('/api/products', productWithId);
      setProducts((prev) => [...prev, productWithId]);
    }
  } catch (err) {
    console.warn('API failed — using local update for demo:', err);

    if (editingProduct) {
      const updatedProduct = { ...editingProduct, ...productData };
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );
    } else {
      setProducts((prev) => [...prev, productWithId]);
    }
  }

  setShowSuccess(true);
  setIsOpen(false);
  setEditingProduct(null);
  resetProduct();
};


  useEffect(() => {
    if (editingProduct) resetProduct(editingProduct);
  }, [editingProduct, resetProduct]);

  const handleEditClick = (product: ProductFormInputs) => {
    setEditingProduct(product);
    setIsOpen(true);
  };

  const totalPrice = products.reduce((sum, product) => sum + product.price * product.numbers, 0);

  return (
    <div className="product-form-container">
      <form onSubmit={handleHeaderSubmit(onHeaderSubmit)} className="form-section product-form">
        <div className="form-row">
          <CustomTextField fullWidth label="نام مشتری" {...registerHeader('customerName')} />
          <CustomTextField fullWidth label="شرح فاکتور" {...registerHeader('detail')} />
        </div>
        <div className="form-row">
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            className="persian-datepicker"
            placeholder="تاریخ"
          />
          <CustomTextField type="integer" fullWidth label="شماره فاکتور" {...registerHeader('billNumber')} />
        </div>
        <hr className="custom-hr" />
        <h2 className="section-title">فاکتور فروش</h2>
        <Button type="submit" variant="outlined" color="info" className="btn-s">
          ذخیره اطلاعات فرم
        </Button>
      </form>

      <div className="add-product-button">
        <Button variant="outlined" color="success" onClick={() => setIsOpen(true)}>
          افزودن محصول <Add />
        </Button>
      </div>

      <div className="product-list">
        <div className="table-responsive">
          <table className="product-table">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام محصول</th>
                <th>تعداد</th>
                <th>قیمت (تومان)</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>{product.productName}</td>
                  <td>{product.numbers}</td>
                  <td>{product.price.toLocaleString()}</td>
                  <td>
                    <Button className=' btn-edit' variant="outlined" color="success" onClick={() => handleEditClick(product)}>
                      ویرایش
                    </Button>     
                    <Button
                      variant="outlined"  
                      color="error"
                      onClick={() => setProducts(products.filter((p) => p.id !== product.id))}
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="total-summary">
          <hr className="custom-hr" />
          <Typography variant="h6" align="right" sx={{ mt: 2, fontSize: '0.9rem', fontWeight: 'bold' }}>
            مجموع کل قیمت محصولات: {totalPrice.toLocaleString()} تومان
          </Typography>
        </div>
      </div>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Box sx={{ ...modalStyle, direction: 'rtl' }} className="product-modal">
          <Typography variant="h6" mb={2} className="product-modal-title">
            {editingProduct ? 'ویرایش مشخصات کالا' : 'شرح کالا'}
          </Typography>
          <hr className="custom-modal-hr" />
          <form onSubmit={handleProductSubmit(onProductSubmit)} className="form-section product-modal-form">
            <div className="form-actions">
              <Button type="submit" variant="outlined" color="success">
                {editingProduct ? 'ویرایش' : 'افزودن'}
              </Button>
            </div>
            <div className="form-row">
              <CustomTextField fullWidth label="نام محصول" {...registerProduct('productName')} />
              <CustomTextField fullWidth label="تعداد" type="number" {...registerProduct('numbers')} />
            </div>
            <div className="form-row">
              <CustomTextField fullWidth label="قیمت" type="number" {...registerProduct('price')} />
              <CustomTextField fullWidth label="شرح محصول" {...registerProduct('detail')} />
            </div>
          </form>
        </Box>
      </Modal>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          اطلاعات با موفقیت ذخیره شد!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProductModalForm;