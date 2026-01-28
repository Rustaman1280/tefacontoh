'use client';

import { useState, useEffect, useCallback } from 'react';
import { assetAPI } from '@/lib/api';

export function useAssets(initialParams = {}) {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });
    const [params, setParams] = useState(initialParams);

    const fetchAssets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await assetAPI.getAll(params);
            setAssets(response.data.data);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch assets');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const updateParams = (newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    };

    const refresh = () => {
        fetchAssets();
    };

    return {
        assets,
        loading,
        error,
        pagination,
        params,
        updateParams,
        refresh
    };
}

export function useAsset(id) {
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAsset = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await assetAPI.getById(id);
            setAsset(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch asset');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAsset();
    }, [fetchAsset]);

    const refresh = () => {
        fetchAsset();
    };

    return { asset, loading, error, refresh };
}
