'use client';

import { useState, useEffect, useCallback } from 'react';
import { itemTypeAPI } from '@/lib/api';

export function useItemTypes(initialParams = {}) {
    const [itemTypes, setItemTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [params, setParams] = useState(initialParams);

    const fetchItemTypes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await itemTypeAPI.getAll(params);
            setItemTypes(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch item types');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchItemTypes();
    }, [fetchItemTypes]);

    const updateParams = (newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    };

    const refresh = () => {
        fetchItemTypes();
    };

    return { itemTypes, loading, error, params, updateParams, refresh };
}

export function useItemTypesGrouped() {
    const [data, setData] = useState({ jurusan: [], kelas: [], umum: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItemTypes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await itemTypeAPI.getGrouped();
            setData(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch item types');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItemTypes();
    }, [fetchItemTypes]);

    const refresh = () => {
        fetchItemTypes();
    };

    return { data, loading, error, refresh };
}
