import axios from 'axios';

const API_BASE_URL = 'http://localhost:5217/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add session token to all requests
api.interceptors.request.use((config) => {
    const session = localStorage.getItem('token');
    if (session) {
        config.params = {
            ...config.params,
            session: session
        };
    }
    return config;
});

// Payment API
export const paymentAPI = {
    getAll: () => api.get('/TuitionPayment/GetAll'),
    getById: (id) => api.get(`/TuitionPayment/${id}`),
    create: (data) => api.post('/TuitionPayment/Add', data),
    update: (data) => api.put('/TuitionPayment/Update', data),
    delete: (id) => api.delete(`/TuitionPayment/Delete/${id}`)
};

// Student API
export const studentAPI = {
    getAll: () => api.get('/Student/GetAll'),
    getById: (id) => api.get(`/Student/${id}`),
    create: (data) => api.post('/Student/Add', data),
    update: (data) => api.put('/Student/Update', data),
    delete: (id) => api.delete(`/Student/Delete/${id}`),
    deleteMultiple: (ids) => api.post('/Student/Delete', ids)
};

// Academic Year API
export const academicYearAPI = {
    getAll: () => api.get('/AcademicYear/GetAll'),
    getById: (id) => api.get(`/AcademicYear/${id}`),
    getActive: () => api.get('/AcademicYear'),
    create: (data) => api.post('/AcademicYear/Add', data),
    update: (data) => api.put('/AcademicYear/Update', data),
    delete: (id) => api.delete(`/AcademicYear/Delete/${id}`)
};

export default api;