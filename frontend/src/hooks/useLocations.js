'use client';

import { useState, useEffect, useCallback } from 'react';
import { locationAPI } from '@/lib/api';

export function useLocations(initialParams = {}) {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [params, setParams] = useState(initialParams);

    const fetchLocations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await locationAPI.getAll(params);
            setLocations(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch locations');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const updateParams = (newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));
    };

    const refresh = () => {
        fetchLocations();
    };

    return { locations, loading, error, params, updateParams, refresh };
}

export function useLocationsGrouped() {
    const [data, setData] = useState({ sekolah: [], jurusan: {}, kelas: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLocations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await locationAPI.getGrouped();
            setData(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch locations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const refresh = () => {
        fetchLocations();
    };

    return { data, loading, error, refresh };
}

export function useLocation(id) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLocation = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await locationAPI.getById(id);
            setLocation(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch location');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchLocation();
    }, [fetchLocation]);

    const refresh = () => {
        fetchLocation();
    };

    return { location, loading, error, refresh };
}
