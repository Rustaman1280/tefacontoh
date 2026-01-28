'use client';

import { useState, useEffect, useCallback } from 'react';
import { departmentAPI } from '@/lib/api';

export function useDepartments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await departmentAPI.getAll();
            setDepartments(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch departments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const refresh = () => {
        fetchDepartments();
    };

    return { departments, loading, error, refresh };
}

export function useDepartment(id) {
    const [department, setDepartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDepartment = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await departmentAPI.getById(id);
            setDepartment(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch department');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDepartment();
    }, [fetchDepartment]);

    const refresh = () => {
        fetchDepartment();
    };

    return { department, loading, error, refresh };
}
